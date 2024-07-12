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

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.IntStream;

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

    public generated.sky.meal.ordering.rest.model.Order addOrderPosition(UUID orderId, generated.sky.meal.ordering.rest.model.OrderPosition position) {
        var updater = DefaultUser.DEFAULT_USER;
        var ts = OffsetDateTime.now();

        return transactionTemplate.execute(status -> {
            var rec = ctx.selectFrom(Tables.MEAL_ORDER)
                    .where(Tables.MEAL_ORDER.ID.eq(orderId))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new NotFoundException("No Order found with id " + orderId));

            rec.setState(OrderState.OPEN);

            rec.setVersion(UUID.randomUUID())
                    .setUpdatedBy(updater)
                    .setUpdatedAt(ts);

            rec.update();

            var posRec = ctx.newRecord(Tables.ORDER_POSITION);

            posRec.setId(UUID.randomUUID())
                    .setOrderId(orderId);

            posRec.setVersion(UUID.randomUUID())
                    .setCreatedAt(ts)
                    .setCreatedBy(updater)
                    .setUpdatedAt(ts)
                    .setUpdatedBy(updater);

            posRec.setName(position.getName())
                    .setMeal(position.getMeal())
                    .setPrice(BigDecimal.valueOf(position.getPrice()))
                    .setPaid(Optional.ofNullable(position.getPaid()).map(BigDecimal::new).orElse(null))
                    .setTip(Optional.ofNullable(position.getTip()).map(BigDecimal::new).orElse(null));

            posRec.insert();

            return fetchOrder(orderId);
        });
    }

    public generated.sky.meal.ordering.rest.model.Order updateOrderPosition(UUID orderId, UUID positionId, generated.sky.meal.ordering.rest.model.OrderPosition position) {
        var updater = DefaultUser.DEFAULT_USER;
        var ts = OffsetDateTime.now();

        return transactionTemplate.execute(status -> {
            var rec = ctx.selectFrom(Tables.MEAL_ORDER)
                    .where(Tables.MEAL_ORDER.ID.eq(orderId))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new NotFoundException("No Order found with id " + orderId));

            rec.setVersion(UUID.randomUUID())
                    .setUpdatedBy(updater)
                    .setUpdatedAt(ts);

            rec.update();

            var posRec = ctx.selectFrom(Tables.ORDER_POSITION)
                    .where(Tables.ORDER_POSITION.ID.eq(positionId))
                    .and(Tables.ORDER_POSITION.ORDER_ID.eq(orderId))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new NotFoundException("No OrderPosition found with id " + positionId + " for Order " + orderId));

            posRec.setVersion(UUID.randomUUID())
                    .setUpdatedAt(ts)
                    .setUpdatedBy(updater);

            posRec.setName(position.getName())
                    .setMeal(position.getMeal())
                    .setPrice(BigDecimal.valueOf(position.getPrice()))
                    .setPaid(Optional.ofNullable(position.getPaid()).map(BigDecimal::new).orElse(null))
                    .setTip(Optional.ofNullable(position.getTip()).map(BigDecimal::new).orElse(null));

            posRec.update();

            return fetchOrder(orderId);
        });
    }

    public generated.sky.meal.ordering.rest.model.Order removeOrderPosition(UUID orderId, UUID positionId) {
        var updater = DefaultUser.DEFAULT_USER;
        var ts = OffsetDateTime.now();

        return transactionTemplate.execute(status -> {
            var deleted = ctx.deleteFrom(Tables.ORDER_POSITION)
                    .where(Tables.ORDER_POSITION.ID.eq(positionId))
                    .and(Tables.ORDER_POSITION.ORDER_ID.eq(orderId))
                    .execute();

            if (deleted == 0)
                throw new NotFoundException("No OrderPosition found with id " + positionId + " for Order with id " + orderId);

            var rec = ctx.selectFrom(Tables.MEAL_ORDER)
                    .where(Tables.MEAL_ORDER.ID.eq(orderId))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new NotFoundException("No Order found with id " + orderId));

            if (ctx.fetchCount(Tables.ORDER_POSITION, Tables.ORDER_POSITION.ORDER_ID.eq(orderId)) == 0)
                rec.setState(OrderState.NEW);
            else
                rec.setState(OrderState.OPEN);

            rec.setVersion(UUID.randomUUID())
                    .setUpdatedBy(updater)
                    .setUpdatedAt(ts);

            rec.update();

            return fetchOrder(orderId);
        });
    }

    private List<generated.sky.meal.ordering.rest.model.Order> fetchOrders() {
        var positionsByOrderId = ctx.selectFrom(Tables.ORDER_POSITION)
                .orderBy(Tables.ORDER_POSITION.CREATED_AT.asc())
                .fetch()
                .intoGroups(Tables.ORDER_POSITION.ORDER_ID);

        return ctx.selectFrom(Tables.MEAL_ORDER)
                .where(Tables.MEAL_ORDER.STATE.notIn(OrderState.ARCHIVED, OrderState.REVOKED))
                .orderBy(Tables.MEAL_ORDER.CREATED_AT.desc())
                .fetch()
                .map(rec -> map(rec, positionsByOrderId.get(rec.getId())));
    }

    private generated.sky.meal.ordering.rest.model.Order fetchOrder(UUID id) {
        var positions = ctx.selectFrom(Tables.ORDER_POSITION)
                .where(Tables.ORDER_POSITION.ORDER_ID.eq(id))
                .orderBy(Tables.ORDER_POSITION.CREATED_AT.asc())
                .fetch();

        return ctx.fetchOptional(Tables.MEAL_ORDER, Tables.MEAL_ORDER.ID.eq(id))
                .map(rec -> map(rec, positions))
                .orElseThrow(() -> new NotFoundException("No Order found with id " + id));
    }

    private static generated.sky.meal.ordering.rest.model.Order map(MealOrderRecord rec, List<generated.sky.meal.ordering.schema.tables.records.OrderPositionRecord> rawPositions) {
        var positions = rawPositions == null ? List.<generated.sky.meal.ordering.schema.tables.records.OrderPositionRecord>of() : rawPositions;

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
                .orderPositions(
                        IntStream.range(0, positions.size())
                                .mapToObj(idx -> {
                                            var r = positions.get(idx);

                                            return generated.sky.meal.ordering.rest.model.OrderPosition.builder()
                                                    .id(r.getId())
                                                    .index(idx)
                                                    .name(r.getName())
                                                    .meal(r.getMeal())
                                                    .price(Optional.of(r.getPrice()).map(BigDecimal::floatValue).orElse(null))
                                                    .paid(Optional.ofNullable(r.getPaid()).map(BigDecimal::floatValue).orElse(null))
                                                    .tip(Optional.ofNullable(r.getTip()).map(BigDecimal::floatValue).orElse(null))
                                                    .build();
                                        }
                                )
                                .toList()
                )
                .build();
    }
}
