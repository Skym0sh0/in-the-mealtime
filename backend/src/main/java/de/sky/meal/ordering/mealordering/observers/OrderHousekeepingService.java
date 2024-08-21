package de.sky.meal.ordering.mealordering.observers;

import com.google.common.base.Stopwatch;
import com.google.common.collect.Comparators;
import de.sky.meal.ordering.mealordering.config.OrderConfiguration;
import de.sky.meal.ordering.mealordering.service.OrderRepository;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.schema.enums.OrderState;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
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
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static generated.sky.meal.ordering.schema.Tables.MEAL_ORDER;
import static org.jooq.impl.DSL.and;
import static org.jooq.impl.DSL.or;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderHousekeepingService implements OnOrderChange {

    private final Supplier<OffsetDateTime> clock = OffsetDateTime::now;

    private final OrderConfiguration config;

    private final TaskScheduler scheduler;

    private final TransactionTemplate transactionTemplate;
    private final DSLContext ctx;
    private final OrderRepository orderRepository;

    private final ChangesBroadcaster changesBroadcaster;

    private final MeterRegistry meterRegistry;

    @PostConstruct
    public void init() {
        log.info("Scheduled initial startup housekeeping ...");

        scheduler.schedule(this::doHousekeeping, in(OffsetDateTime.now(), Duration.ofMinutes(1)));

        log.info("Do re-schedulings of orders");
        doReschedulings();
    }

    @Scheduled(cron = "${app.config.orders.housekeeping-cron-expression}")
    public void startHousekeeping() {
        doHousekeeping();
    }

    public void doHousekeeping() {
        var timer = meterRegistry.timer("order.housekeeping", Tags.of("type", "housekeeping", "entity", "order"));

        timer.record(() -> {
            log.info("Start global housekeeping ...");

            var sw = Stopwatch.createStarted();

            doDeletions();
            doReopens();
            doDeliveries();
            doArchives();

            log.info("Finished global housekeeping in {}", sw.stop());
        });
    }

    @Override
    public void onLockOrder(Order order) {
        log.info("Scheduled lock check in {}", config.stateTimeouts().lockedBeforeReopened());
        scheduler.schedule(this::doReopens, in(order.getStateManagement().getLockedAt(), config.stateTimeouts().lockedBeforeReopened()));
    }

    @Override
    public void onOrderIsOrdered(Order order) {
        log.info("Scheduled ordered check in {}", config.stateTimeouts().orderedBeforeDelivered());
        scheduler.schedule(this::doDeliveries, in(order.getStateManagement().getOrderedAt(), config.stateTimeouts().orderedBeforeDelivered()));
    }

    @Override
    public void onOrderDelivered(Order order) {
        log.info("Scheduled delivery check in {}", config.stateTimeouts().deliveryBeforeArchive());
        scheduler.schedule(this::doArchives, in(order.getStateManagement().getDeliveredAt(), config.stateTimeouts().deliveryBeforeArchive()));
    }

    @Override
    public void onOrderIsRevoked(Order order) {
        log.info("Scheduled revoke check in {}", config.stateTimeouts().revokedBeforeDeleted());
        scheduler.schedule(this::doDeletions, in(order.getStateManagement().getRevokedAt(), config.stateTimeouts().revokedBeforeDeleted()));
    }

    private void doReschedulings() {
        var states = Map.<OrderState, Consumer<Order>>of(
                OrderState.LOCKED, this::onLockOrder,
                OrderState.ORDERED, this::onOrderIsOrdered,
                OrderState.REVOKED, this::onOrderIsRevoked,
                OrderState.DELIVERED, this::onOrderDelivered
        );

        states.forEach((state, runnable) -> {
            var ids = transactionTemplate.execute(_ ->
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
        var ts = Comparators.max(
                OffsetDateTime.now(),
                Optional.ofNullable(reference)
                        .orElseGet(OffsetDateTime::now)
                        .plus(diff)
        );

        return new Trigger() {
            @Override
            public Instant nextExecution(TriggerContext triggerContext) {
                if (triggerContext.lastActualExecution() == null)
                    return ts.toInstant();

                return null;
            }
        };
    }

    private void doDeletions() {
        var ts = clock.get();

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

        var deleted = ids.stream()
                .mapToInt(id -> {
                    try {
                        orderRepository.deleteOrderWithoutCondition(id);
                        return 1;
                    } catch (Exception e) {
                        log.error("During Order deletion an error occurred for id {}", e, e);
                        return 0;
                    }
                })
                .sum();

        changesBroadcaster.notifyOrdersChanged(ids);

        meterRegistry.counter("order.housekeeping.delete", Tags.of("entity", "order")).increment(deleted);
    }

    private void doReopens() {
        var ts = clock.get();

        var orders = doTransactionalWork("Re-Openings", ctx ->
                ctx.select(MEAL_ORDER.ID, MEAL_ORDER.VERSION)
                        .from(MEAL_ORDER)
                        .where(and(
                                MEAL_ORDER.STATE.in(OrderState.LOCKED),
                                MEAL_ORDER.LOCKED_AT.lessThan(ts.minus(config.stateTimeouts().lockedBeforeReopened()))
                        ))
                        .fetch()
        );

        var touched = orders.stream()
                .map(order -> {
                    try {
                        return Optional.of(orderRepository.reopenOrder(order.value1(), order.value2()));
                    } catch (Exception e) {
                        log.error("During Order reopen an error occurred for order with id {}", order, e);
                        return Optional.empty();
                    }
                })
                .filter(Optional::isPresent)
                .count();

        orders.forEach(o -> changesBroadcaster.notifyOrdersChanged(o.value1()));

        meterRegistry.counter("order.state.transition", Tags.of("from", "locked", "to", "open")).increment(touched);
    }

    private void doDeliveries() {
        var ts = clock.get();

        var orders = doTransactionalWork("Deliverings", ctx ->
                ctx.select(MEAL_ORDER.ID, MEAL_ORDER.VERSION)
                        .from(MEAL_ORDER)
                        .where(and(
                                MEAL_ORDER.STATE.in(OrderState.ORDERED),
                                MEAL_ORDER.ORDERED_AT.lessThan(ts.minus(config.stateTimeouts().orderedBeforeDelivered()))
                        ))
                        .fetch()
        );

        var touched = orders.stream()
                .map(order -> {
                    try {
                        return Optional.of(orderRepository.setOrderToDelivered(order.value1(), order.value2()));
                    } catch (Exception e) {
                        log.error("During Order deliverings an error occurred for order with id {}", order, e);
                        return Optional.empty();
                    }
                })
                .filter(Optional::isPresent)
                .count();

        orders.forEach(o -> changesBroadcaster.notifyOrdersChanged(o.value1()));

        meterRegistry.counter("order.state.transition", Tags.of("from", "ordered", "to", "delivered")).increment(touched);
    }

    private void doArchives() {
        var ts = clock.get();

        var orders = doTransactionalWork("Archivings", ctx ->
                ctx.select(MEAL_ORDER.ID, MEAL_ORDER.VERSION)
                        .from(MEAL_ORDER)
                        .where(and(
                                MEAL_ORDER.STATE.in(OrderState.DELIVERED),
                                MEAL_ORDER.ORDERED_AT.lessThan(ts.minus(config.stateTimeouts().deliveryBeforeArchive()))
                        ))
                        .fetch()
        );

        var touched = orders.stream()
                .map(order -> {
                    try {
                        return Optional.of(orderRepository.archiveOrder(order.value1(), order.value2()));
                    } catch (Exception e) {
                        log.error("During Order archivings an error occurred for order with id {}", order, e);
                        return Optional.empty();
                    }
                })
                .filter(Optional::isPresent)
                .count();

        orders.forEach(o -> changesBroadcaster.notifyOrdersChanged(o.value1()));

        meterRegistry.counter("order.state.transition", Tags.of("from", "delivered", "to", "archived")).increment(touched);
    }

    private <T> List<T> doTransactionalWork(String title, Function<DSLContext, List<T>> worker) {
        try {
            var sw = Stopwatch.createStarted();

            var touched = Optional.ofNullable(transactionTemplate.execute(_ -> worker.apply(ctx)))
                    .orElse(List.of());

            log.info("Housekeeping for {} selected {} records in {}", title, touched.size(), sw.stop());

            return touched;
        } catch (Exception e) {
            log.error("Error during housekeeping", e);
            return List.of();
        }
    }
}
