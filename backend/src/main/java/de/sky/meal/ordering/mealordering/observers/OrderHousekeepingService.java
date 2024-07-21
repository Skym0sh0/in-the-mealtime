package de.sky.meal.ordering.mealordering.observers;

import com.google.common.base.Stopwatch;
import de.sky.meal.ordering.mealordering.config.OrderConfiguration;
import de.sky.meal.ordering.mealordering.service.OrderRepository;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.schema.enums.OrderState;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.Trigger;
import org.springframework.scheduling.TriggerContext;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Stream;

import static generated.sky.meal.ordering.schema.Tables.MEAL_ORDER;
import static org.jooq.impl.DSL.and;
import static org.jooq.impl.DSL.or;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderHousekeepingService implements OnOrderChange {
    private final OrderConfiguration config;

    private final TaskScheduler scheduler;

    private final TransactionTemplate transactionTemplate;
    private final DSLContext ctx;
    private final OrderRepository orderRepository;

    @PostConstruct
    public void init() {
        log.info("Scheduled initial startup housekeeping ...");

        scheduler.schedule(this::doHousekeeping, in(OffsetDateTime.now(),Duration.ofMinutes(1)));

        log.info("Do re-schedulings of open orders");
        doReschedulings();
    }

    @Scheduled(cron = "${app.config.orders.housekeeping-cron-expression}")
    public void startHousekeeping() {
        doHousekeeping();
    }

    public void doHousekeeping() {
        var ts = OffsetDateTime.now();

        log.info("Start global housekeeping at {}...", ts);

        var sw = Stopwatch.createStarted();

        doDeletions(ts);
        doReopens(ts);
        doDeliveries(ts);
        doArchives(ts);

        log.info("Finished global housekeeping in {}", sw.stop());
    }

    @Override
    public void onLockOrder(Order order) {
        // die waiting times machen kein sinn, weil da ist der bezug falsch.
        // wieso soll ich 5 min warten, wenn vor 4 min der lock erstellt wurde

        log.info("Scheduled lock check in {}", config.stateTimeouts().lockedBeforeReopened());
        scheduler.schedule(() -> doReopens(OffsetDateTime.now()), in(OffsetDateTime.now(), config.stateTimeouts().lockedBeforeReopened()));
    }

    @Override
    public void onOrderIsOrdered(Order order) {
        log.info("Scheduled ordered check in {}", config.stateTimeouts().orderedBeforeDelivered());
        scheduler.schedule(() -> doDeliveries(OffsetDateTime.now()), in(OffsetDateTime.now(),config.stateTimeouts().orderedBeforeDelivered()));
    }

    @Override
    public void onOrderDelivered(Order order) {
        log.info("Scheduled delivery check in {}", config.stateTimeouts().deliveryBeforeArchive());
        scheduler.schedule(() -> doArchives(OffsetDateTime.now()), in(OffsetDateTime.now(),config.stateTimeouts().deliveryBeforeArchive()));
    }

    @Override
    public void onOrderIsRevoked(Order order) {
        log.info("Scheduled revoke check in {}", config.stateTimeouts().revokedBeforeDeleted());
        scheduler.schedule(() -> doDeletions(OffsetDateTime.now()), in(OffsetDateTime.now(),config.stateTimeouts().revokedBeforeDeleted()));
    }

    private void doReschedulings() {
        var states = Map.<OrderState, Consumer<Order>>of(
                OrderState.LOCKED, this::onLockOrder,
                OrderState.ORDERED, this::onOrderIsOrdered,
                OrderState.REVOKED, this::onOrderIsRevoked,
                OrderState.DELIVERED, this::onOrderDelivered
        );

        states.forEach((state, runnable) -> {
            var ids = transactionTemplate.execute(status ->
                    ctx.select(MEAL_ORDER.ID)
                            .from(MEAL_ORDER)
                            .where(MEAL_ORDER.STATE.eq(state))
                            .limit(100)
                            .fetch(MEAL_ORDER.ID)
            );

            Optional.ofNullable(ids)
                    .orElse(List.of())
                    .stream()
                    .flatMap(id -> {
                        try {
                            return Stream.of(orderRepository.readOrder(id));
                        } catch (Exception e) {
                            log.warn("Order encountered an error in the meantime", e);
                            return Stream.of();
                        }
                    })
                    .forEach(runnable);
        });
    }

    private static Trigger in(OffsetDateTime reference, Duration diff) {
        var ts = OffsetDateTime.now().plus(diff);

        return new Trigger() {
            @Override
            public Instant nextExecution(TriggerContext triggerContext) {
                if (triggerContext.lastActualExecution() == null)
                    return ts.toInstant();

                return null;
            }
        };
    }

    private void doDeletions(OffsetDateTime ts) {
        var ids = doTransactionalWork("Deletions", ctx ->
                ctx.select(MEAL_ORDER.ID)
                        .from(MEAL_ORDER)
                        .where(or(
                                and(
                                        MEAL_ORDER.STATE.in(OrderState.NEW, OrderState.OPEN),
                                        MEAL_ORDER.CREATED_AT.lessThan(ts.minus(config.stateTimeouts().maxOpenTime()))
                                ),
                                and(
                                        MEAL_ORDER.STATE.notEqual(OrderState.ARCHIVED),
                                        MEAL_ORDER.UPDATED_AT.lessThan(ts.minus(config.stateTimeouts().maxUntouchedTime()))
                                ),
                                and(
                                        MEAL_ORDER.STATE.in(OrderState.REVOKED),
                                        MEAL_ORDER.REVOKED_AT.lessThan(ts.minus(config.stateTimeouts().revokedBeforeDeleted()))
                                )
                        ))
                        .orderBy(MEAL_ORDER.CREATED_AT.asc())
                        .limit(1000)
                        .fetch(MEAL_ORDER.ID)
        );

        ids.forEach(orderRepository::deleteOrderWithoutCondition);
    }

    private void doReopens(OffsetDateTime ts) {
        var ids = doTransactionalWork("Re-Openings", ctx ->
                ctx.select(MEAL_ORDER.ID)
                        .from(MEAL_ORDER)
                        .where(and(
                                MEAL_ORDER.STATE.in(OrderState.LOCKED),
                                MEAL_ORDER.LOCKED_AT.lessThan(ts.minus(config.stateTimeouts().lockedBeforeReopened()))
                        ))
                        .fetch(MEAL_ORDER.ID)
        );

        ids.forEach(orderRepository::reopenOrder);
    }

    private void doDeliveries(OffsetDateTime ts) {
        var ids = doTransactionalWork("Deliverings", ctx ->
                ctx.select(MEAL_ORDER.ID)
                        .from(MEAL_ORDER)
                        .where(and(
                                MEAL_ORDER.STATE.in(OrderState.ORDERED),
                                MEAL_ORDER.ORDERED_AT.lessThan(ts.minus(config.stateTimeouts().orderedBeforeDelivered()))
                        ))
                        .fetch(MEAL_ORDER.ID)
        );

        ids.forEach(orderRepository::setOrderToDelivered);
    }

    private void doArchives(OffsetDateTime ts) {
        var ids = doTransactionalWork("Archivings", ctx ->
                ctx.select(MEAL_ORDER.ID)
                        .from(MEAL_ORDER)
                        .where(and(
                                MEAL_ORDER.STATE.in(OrderState.DELIVERED),
                                MEAL_ORDER.ORDERED_AT.lessThan(ts.minus(config.stateTimeouts().deliveryBeforeArchive()))
                        ))
                        .fetch(MEAL_ORDER.ID)
        );

        ids.forEach(orderRepository::archiveOrder);
    }

    private List<UUID> doTransactionalWork(String title, Function<DSLContext, List<UUID>> worker) {
        try {
            var sw = Stopwatch.createStarted();

            var touched = Optional.ofNullable(transactionTemplate.execute(status -> worker.apply(ctx)))
                    .orElse(List.of());

            log.info("Housekeeping for {} selected {} records in {}", title, touched.size(), sw.stop());

            return touched;
        } catch (Exception e) {
            log.error("Error during housekeeping", e);
            return List.of();
        }
    }
}
