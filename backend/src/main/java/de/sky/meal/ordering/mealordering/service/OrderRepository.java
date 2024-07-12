package de.sky.meal.ordering.mealordering.service;

import de.sky.meal.ordering.mealordering.config.DefaultUser;
import generated.sky.meal.ordering.rest.model.OrderInfos;
import generated.sky.meal.ordering.schema.Tables;
import generated.sky.meal.ordering.schema.enums.OrderState;
import generated.sky.meal.ordering.schema.tables.records.MealOrderRecord;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderRepository {

    private final DSLContext ctx;
    private final TransactionTemplate transactionTemplate;

    public generated.sky.meal.ordering.rest.model.Order readOrder(UUID id) {
        return transactionTemplate.execute(status -> {
            return fetchOrder(id);
        });
    }

    public List<generated.sky.meal.ordering.rest.model.Order> readOrders() {
        return transactionTemplate.execute(status -> {
            return fetchOrders();
        });
    }

    public generated.sky.meal.ordering.rest.model.Order createNewEmptyOrder(UUID restaurantId) {
        return transactionTemplate.execute(status -> {
            ctx.fetchOptional(Tables.RESTAURANT, Tables.RESTAURANT.ID.eq(restaurantId))
                    .orElseThrow(() -> new NotFoundException("No Restaurant found with id " + restaurantId));

            var id = UUID.randomUUID();
            var ts = OffsetDateTime.now();
            var creator = DefaultUser.DEFAULT_USER;

            var rec = ctx.newRecord(Tables.MEAL_ORDER);

            rec.setId(id)
                    .setRestaurantId(restaurantId);

            rec.setVersion(UUID.randomUUID())
                    .setCreatedAt(ts)
                    .setCreatedBy(creator)
                    .setUpdatedAt(ts)
                    .setUpdatedBy(creator);

            rec.setState(OrderState.NEW);

            rec.insert();

            return fetchOrder(id);
        });
    }

    public generated.sky.meal.ordering.rest.model.Order updateOrderInfos(UUID id, OrderInfos infos) {
        return transactionTemplate.execute(status -> {
            var rec = ctx.selectFrom(Tables.MEAL_ORDER)
                    .where(Tables.MEAL_ORDER.ID.eq(id))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new NotFoundException("No Order found with id " + id));

            rec.setOrderer(infos.getOrderer())
                    .setFetcher(infos.getFetcher())
                    .setMoneyCollectorType(
                            Optional.ofNullable(infos.getMoneyCollectionType())
                                    .map(Enum::name)
                                    .map(generated.sky.meal.ordering.schema.enums.MoneyCollectionType::valueOf)
                                    .orElse(null)
                    )
                    .setMoneyCollector(infos.getMoneyCollector())
                    .setOrderClosingTime(
                            Optional.ofNullable(infos.getOrderClosingTime())
                                    .map(LocalTime::parse)
                                    .orElse(null)
                    );

            rec.setVersion(UUID.randomUUID())
                    .setUpdatedBy(DefaultUser.DEFAULT_USER)
                    .setUpdatedAt(OffsetDateTime.now());

            rec.update();

            return fetchOrder(id);
        });
    }

    public void deleteOrder(UUID id) {
        transactionTemplate.executeWithoutResult(status -> {
            var deleted = ctx.deleteFrom(Tables.MEAL_ORDER)
                    .where(Tables.MEAL_ORDER.ID.eq(id))
                    .execute();

            if (deleted == 0)
                throw new NotFoundException("No Order found with id " + id);
        });
    }

    private List<generated.sky.meal.ordering.rest.model.Order> fetchOrders() {
        return ctx.fetch(Tables.MEAL_ORDER)
                .map(rec -> map(rec));
    }

    private generated.sky.meal.ordering.rest.model.Order fetchOrder(UUID id) {
        return ctx.fetchOptional(Tables.MEAL_ORDER, Tables.MEAL_ORDER.ID.eq(id))
                .map(rec -> map(rec))
                .orElseThrow(() -> new NotFoundException("No Order found with id " + id));
    }

    private static generated.sky.meal.ordering.rest.model.Order map(MealOrderRecord rec) {
        return generated.sky.meal.ordering.rest.model.Order.builder()
                .id(rec.getId())
                .restaurantId(rec.getRestaurantId())
                .orderState(generated.sky.meal.ordering.rest.model.OrderState.valueOf(rec.getState().name()))
                .infos(
                        OrderInfos.builder()
                                .orderer(rec.getOrderer())
                                .fetcher(rec.getFetcher())
                                .moneyCollectionType(
                                        Optional.ofNullable(rec.getMoneyCollectorType())
                                                .map(Enum::name)
                                                .map(generated.sky.meal.ordering.rest.model.OrderMoneyCollectionType::valueOf)
                                                .orElse(null)
                                )
                                .moneyCollector(rec.getMoneyCollector())
                                .orderClosingTime(
                                        Optional.ofNullable(rec.getOrderClosingTime())
                                                .map(LocalTime::toString)
                                                .orElse(null)
                                )
                                .build()
                )
                .date(rec.getCreatedAt().toLocalDate())
                .orderPositions(List.of())
                .build();
    }
}
