package de.sky.meal.ordering.mealordering.service;

import de.sky.meal.ordering.mealordering.config.DefaultUser;
import de.sky.meal.ordering.mealordering.config.OrderConfiguration;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.rest.model.OrderInfos;
import generated.sky.meal.ordering.rest.model.OrderInfosPatch;
import generated.sky.meal.ordering.rest.model.OrderMoneyCollectionType;
import generated.sky.meal.ordering.rest.model.OrderPosition;
import generated.sky.meal.ordering.rest.model.OrderPositionPatch;
import generated.sky.meal.ordering.rest.model.OrderStateType;
import generated.sky.meal.ordering.schema.Tables;
import generated.sky.meal.ordering.schema.enums.MoneyCollectionType;
import generated.sky.meal.ordering.schema.enums.OrderState;
import generated.sky.meal.ordering.schema.tables.records.MealOrderRecord;
import generated.sky.meal.ordering.schema.tables.records.OrderPositionRecord;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ClientErrorException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.jooq.tools.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.stream.IntStream;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class OrderRepository {

    private final OrderConfiguration config;

    private final TransactionTemplate transactionTemplate;
    private final DSLContext ctx;

    public Order readOrder(UUID id) {
        return transactionTemplate.execute(status -> fetchOrder(id));
    }

    public List<Order> readOrders() {
        return transactionTemplate.execute(status -> fetchOrders(
                DSL.or(
                        Tables.MEAL_ORDER.STATE.notIn(OrderState.ARCHIVED, OrderState.REVOKED),
                        Tables.MEAL_ORDER.REVOKED_AT.ge(OffsetDateTime.now().minus(config.closedOrderLingering())),
                        Tables.MEAL_ORDER.ARCHIVED_AT.ge(OffsetDateTime.now().minus(config.closedOrderLingering()))
                )
        ));
    }

    public List<UUID> readOrderableRestaurantIds(LocalDate date) {
        return transactionTemplate.execute(status ->
                ctx.selectDistinct(Tables.RESTAURANT.ID)
                        .from(Tables.RESTAURANT)
                        .where(Tables.RESTAURANT.ID.notIn(
                                DSL.select(Tables.MEAL_ORDER.RESTAURANT_ID)
                                        .from(Tables.MEAL_ORDER)
                                        .where(Tables.MEAL_ORDER.TARGET_DATE.eq(date))
                                        .and(Tables.MEAL_ORDER.STATE.in(OrderState.NEW, OrderState.OPEN, OrderState.LOCKED))
                        ))
                        .fetch(Tables.RESTAURANT.ID)
        );
    }

    public Order createNewEmptyOrder(LocalDate date, UUID restaurantId) {
        return transactionTemplate.execute(status -> {
            ctx.fetchOptional(Tables.RESTAURANT, Tables.RESTAURANT.ID.eq(restaurantId))
                    .orElseThrow(() -> new NotFoundException("No Restaurant found with id " + restaurantId));

            if (ctx.fetchExists(Tables.MEAL_ORDER, Tables.MEAL_ORDER.RESTAURANT_ID.eq(restaurantId)
                    .and(Tables.MEAL_ORDER.TARGET_DATE.eq(date))
                    .and(Tables.MEAL_ORDER.STATE.in(OrderState.NEW, OrderState.OPEN, OrderState.LOCKED)))) {
                throw new ClientErrorException("There is already an open Order for restaurant with id " + restaurantId, Response.Status.CONFLICT);
            }

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

            rec.setState(OrderState.NEW)
                    .setTargetDate(date);

            rec.insert();

            return fetchOrder(id);
        });
    }

    public Order updateOrderInfos(UUID id, OrderInfosPatch infos) {
        return changeOrderRecord(id, (updater, rec) -> {
            var requiredStates = Set.of(OrderState.OPEN, OrderState.NEW);
            if (!requiredStates.contains(rec.getState()))
                throw new BadRequestException("Order %s is not one of States %s".formatted(id, requiredStates));

            rec.setOrderer(infos.getOrderer())
                    .setFetcher(infos.getFetcher())
                    .setMoneyCollectorType(Mapper.map(infos.getMoneyCollectionType()))
                    .setMoneyCollector(infos.getMoneyCollector())
                    .setOrderClosingTime(infos.getOrderClosingTime());
        });
    }

    public void deleteOrder(UUID id) {
        transactionTemplate.executeWithoutResult(status -> {
            var rec = ctx.selectFrom(Tables.MEAL_ORDER)
                    .where(Tables.MEAL_ORDER.ID.eq(id))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new NotFoundException("No Order found with id " + id));

            var requiredStates = Set.of(OrderState.NEW, OrderState.ARCHIVED, OrderState.REVOKED);
            if (!requiredStates.contains(rec.getState()))
                throw new BadRequestException("Order %s is not one of States %s".formatted(id, requiredStates));

            rec.delete();
        });
    }

    public Order addOrderPosition(UUID orderId, OrderPositionPatch position) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            var requiredStates = Set.of(OrderState.NEW, OrderState.OPEN, OrderState.REVOKED);
            if (!requiredStates.contains(rec.getState()))
                throw new BadRequestException("Order %s is not one of States %s".formatted(orderId, requiredStates));

            rec.setState(OrderState.OPEN);

            var posRec = ctx.newRecord(Tables.ORDER_POSITION);

            posRec.setId(UUID.randomUUID())
                    .setOrderId(orderId);

            posRec.setVersion(UUID.randomUUID())
                    .setCreatedAt(updater.timestamp())
                    .setCreatedBy(updater.user())
                    .setUpdatedAt(updater.timestamp())
                    .setUpdatedBy(updater.user());

            posRec.setName(position.getName())
                    .setMeal(position.getMeal())
                    .setPrice(Mapper.map(position.getPrice()))
                    .setPaid(Mapper.map(position.getPaid()))
                    .setTip(Mapper.map(position.getTip()));

            posRec.insert();
        });
    }

    public Order updateOrderPosition(UUID orderId, UUID positionId, OrderPositionPatch position) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            var posRec = ctx.selectFrom(Tables.ORDER_POSITION)
                    .where(Tables.ORDER_POSITION.ID.eq(positionId))
                    .and(Tables.ORDER_POSITION.ORDER_ID.eq(orderId))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new NotFoundException("No OrderPosition found with id " + positionId + " for Order " + orderId));

            posRec.setVersion(UUID.randomUUID())
                    .setUpdatedAt(updater.timestamp())
                    .setUpdatedBy(updater.user());

            if (rec.getState() == OrderState.OPEN) {
                posRec.setName(position.getName())
                        .setMeal(position.getMeal())
                        .setPrice(Mapper.map(position.getPrice()))
                        .setPaid(Mapper.map(position.getPaid()))
                        .setTip(Mapper.map(position.getTip()));
            } else if (rec.getState() == OrderState.LOCKED || rec.getState() == OrderState.ORDERED || rec.getState() == OrderState.DELIVERED) {
                posRec.setPaid(Mapper.map(position.getPaid()))
                        .setTip(Mapper.map(position.getTip()));
            } else
                throw new BadRequestException("Order %s is not in State %s".formatted(orderId, OrderState.OPEN));

            posRec.update();
        });
    }

    public Order removeOrderPosition(UUID orderId, UUID positionId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            if (rec.getState() != OrderState.OPEN)
                throw new BadRequestException("Order %s is not in State %s".formatted(orderId, OrderState.OPEN));

            var deleted = ctx.deleteFrom(Tables.ORDER_POSITION)
                    .where(Tables.ORDER_POSITION.ID.eq(positionId))
                    .and(Tables.ORDER_POSITION.ORDER_ID.eq(orderId))
                    .execute();

            if (deleted == 0)
                throw new NotFoundException("No OrderPosition found with id " + positionId + " for Order with id " + orderId);

            if (ctx.fetchCount(Tables.ORDER_POSITION, Tables.ORDER_POSITION.ORDER_ID.eq(orderId)) == 0)
                rec.setState(OrderState.NEW);
            else
                rec.setState(OrderState.OPEN);
        });
    }

    public Order lockOrder(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            if (rec.getState() != OrderState.OPEN)
                throw new BadRequestException("Order %s is not in State %s".formatted(orderId, OrderState.OPEN));

            if (Stream.of(rec.getOrderer(), rec.getFetcher(), rec.getMoneyCollector()).anyMatch(StringUtils::isBlank))
                throw new BadRequestException("Order %s has no orderer, fetcher or money collector".formatted(orderId));

            rec.setState(OrderState.LOCKED);
            rec.setLockedAt(updater.timestamp());
        });
    }

    public Order reopenOrder(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            if (rec.getState() != OrderState.LOCKED)
                throw new BadRequestException("Order %s is not in State %s".formatted(orderId, OrderState.LOCKED));

            rec.setState(OrderState.OPEN);
            rec.setLockedAt(updater.timestamp());
        });
    }

    public Order setOrderToIsOrdered(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            if (rec.getState() != OrderState.LOCKED)
                throw new BadRequestException("Order %s is not in State %s".formatted(orderId, OrderState.LOCKED));

            rec.setState(OrderState.ORDERED);
            rec.setOrderedAt(updater.timestamp());
        });
    }

    public Order setOrderToDelivered(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            if (rec.getState() != OrderState.ORDERED)
                throw new BadRequestException("Order %s is not in State %s".formatted(orderId, OrderState.ORDERED));

            rec.setState(OrderState.DELIVERED);
            rec.setDeliveredAt(updater.timestamp());
        });
    }

    public Order revokeOrder(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            var requiredStates = Set.of(OrderState.OPEN, OrderState.LOCKED, OrderState.ORDERED);
            if (!requiredStates.contains(rec.getState()))
                throw new BadRequestException("Order %s is not one of States %s".formatted(orderId, requiredStates));

            rec.setState(OrderState.REVOKED);
            rec.setRevokedAt(updater.timestamp());
        });
    }

    public Order archiveOrder(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            var requiredStates = Set.of(OrderState.DELIVERED, OrderState.ORDERED);
            if (!requiredStates.contains(rec.getState()))
                throw new BadRequestException("Order %s is not one of States %s".formatted(orderId, requiredStates));

            rec.setState(OrderState.ARCHIVED);
            rec.setArchivedAt(updater.timestamp());
        });
    }

    private Order changeOrderRecord(UUID orderId, BiConsumer<Updater, MealOrderRecord> callback) {
        var updater = new Updater();

        return transactionTemplate.execute(status -> {
            var rec = ctx.selectFrom(Tables.MEAL_ORDER)
                    .where(Tables.MEAL_ORDER.ID.eq(orderId))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new NotFoundException("No Order found with id " + orderId));

            callback.accept(updater, rec);

            rec.setVersion(UUID.randomUUID())
                    .setUpdatedBy(updater.user())
                    .setUpdatedAt(updater.timestamp());

            rec.update();

            return fetchOrder(orderId);
        });
    }

    private List<Order> fetchOrders() {
        return fetchOrders(DSL.trueCondition());
    }

    private List<Order> fetchOrders(Condition cond) {
        var positionsByOrderId = ctx.selectFrom(Tables.ORDER_POSITION)
                .orderBy(Tables.ORDER_POSITION.CREATED_AT.asc())
                .fetch()
                .intoGroups(Tables.ORDER_POSITION.ORDER_ID);

        return ctx.selectFrom(Tables.MEAL_ORDER)
                .where(cond)
                .orderBy(Tables.MEAL_ORDER.CREATED_AT.desc())
                .fetch()
                .map(rec -> Mapper.map(rec, positionsByOrderId.get(rec.getId())));
    }

    private Order fetchOrder(UUID id) {
        var positions = ctx.selectFrom(Tables.ORDER_POSITION)
                .where(Tables.ORDER_POSITION.ORDER_ID.eq(id))
                .orderBy(Tables.ORDER_POSITION.CREATED_AT.asc())
                .fetch();

        return ctx.fetchOptional(Tables.MEAL_ORDER, Tables.MEAL_ORDER.ID.eq(id))
                .map(rec -> Mapper.map(rec, positions))
                .orElseThrow(() -> new NotFoundException("No Order found with id " + id));
    }

    private record Updater(UUID user, OffsetDateTime timestamp) {

        public Updater() {
            this(DefaultUser.DEFAULT_USER, OffsetDateTime.now());
        }
    }

    private static class Mapper {

        private static Order map(MealOrderRecord rec, List<OrderPositionRecord> rawPositions) {
            var positions = rawPositions == null ? List.<OrderPositionRecord>of() : rawPositions;

            return Order.builder()
                    .id(rec.getId())
                    .restaurantId(rec.getRestaurantId())
                    .orderState(map(rec.getState()))
                    .infos(
                            OrderInfos.builder()
                                    .orderer(rec.getOrderer())
                                    .fetcher(rec.getFetcher())
                                    .moneyCollectionType(map(rec.getMoneyCollectorType()))
                                    .moneyCollector(rec.getMoneyCollector())
                                    .orderClosingTime(rec.getOrderClosingTime())
                                    .build()
                    )
                    .date(rec.getTargetDate())
                    .orderPositions(
                            IntStream.range(0, positions.size())
                                    .mapToObj(idx -> {
                                                var r = positions.get(idx);

                                                return OrderPosition.builder()
                                                        .id(r.getId())
                                                        .index(idx)
                                                        .name(r.getName())
                                                        .meal(r.getMeal())
                                                        .price(map(r.getPrice()))
                                                        .paid(map(r.getPaid()))
                                                        .tip(map(r.getTip()))
                                                        .build();
                                            }
                                    )
                                    .toList()
                    )
                    .build();
        }

        private static OrderMoneyCollectionType map(MoneyCollectionType type) {
            return Optional.ofNullable(type)
                    .map(Enum::name)
                    .map(OrderMoneyCollectionType::valueOf)
                    .orElse(null);
        }

        private static MoneyCollectionType map(OrderMoneyCollectionType type) {
            return Optional.ofNullable(type)
                    .map(Enum::name)
                    .map(MoneyCollectionType::valueOf)
                    .orElse(null);
        }

        private static OrderState map(OrderStateType state) {
            return Optional.ofNullable(state)
                    .map(Enum::name)
                    .map(OrderState::valueOf)
                    .orElse(null);
        }

        private static OrderStateType map(OrderState state) {
            return Optional.ofNullable(state)
                    .map(Enum::name)
                    .map(OrderStateType::valueOf)
                    .orElse(null);
        }

        private static Float map(BigDecimal money) {
            return Optional.ofNullable(money)
                    .map(BigDecimal::floatValue)
                    .orElse(null);
        }

        private static BigDecimal map(Float money) {
            return Optional.ofNullable(money)
                    .map(BigDecimal::new)
                    .orElse(null);
        }
    }
}
