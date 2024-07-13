package de.sky.meal.ordering.mealordering.service;

import de.sky.meal.ordering.mealordering.config.DefaultUser;
import generated.sky.meal.ordering.rest.model.OrderInfos;
import generated.sky.meal.ordering.schema.Tables;
import generated.sky.meal.ordering.schema.enums.OrderState;
import generated.sky.meal.ordering.schema.tables.records.MealOrderRecord;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.tools.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
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

    private final DSLContext ctx;
    private final TransactionTemplate transactionTemplate;

    public generated.sky.meal.ordering.rest.model.Order readOrder(UUID id) {
        return transactionTemplate.execute(status -> fetchOrder(id));
    }

    public List<generated.sky.meal.ordering.rest.model.Order> readOrders() {
        return transactionTemplate.execute(status -> fetchOrders());
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

    public generated.sky.meal.ordering.rest.model.Order addOrderPosition(UUID orderId, generated.sky.meal.ordering.rest.model.OrderPosition position) {
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

    public generated.sky.meal.ordering.rest.model.Order updateOrderPosition(UUID orderId, UUID positionId, generated.sky.meal.ordering.rest.model.OrderPosition position) {
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

    public generated.sky.meal.ordering.rest.model.Order removeOrderPosition(UUID orderId, UUID positionId) {
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

    public generated.sky.meal.ordering.rest.model.Order lockOrder(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            if (rec.getState() != OrderState.OPEN)
                throw new BadRequestException("Order %s is not in State %s".formatted(orderId, OrderState.OPEN));

            if (Stream.of(rec.getOrderer(), rec.getFetcher(), rec.getMoneyCollector()).anyMatch(StringUtils::isBlank))
                throw new BadRequestException("Order %s has no order, fetcher or money collector".formatted(orderId));

            rec.setState(OrderState.LOCKED);
            rec.setLockedAt(updater.timestamp());
        });
    }

    public generated.sky.meal.ordering.rest.model.Order reopenOrder(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            if (rec.getState() != OrderState.LOCKED)
                throw new BadRequestException("Order %s is not in State %s".formatted(orderId, OrderState.LOCKED));

            rec.setState(OrderState.OPEN);
            rec.setLockedAt(updater.timestamp());
        });
    }

    public generated.sky.meal.ordering.rest.model.Order setOrderToIsOrdered(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            if (rec.getState() != OrderState.LOCKED)
                throw new BadRequestException("Order %s is not in State %s".formatted(orderId, OrderState.LOCKED));

            rec.setState(OrderState.ORDERED);
            rec.setOrderedAt(updater.timestamp());
        });
    }

    public generated.sky.meal.ordering.rest.model.Order setOrderToDelivered(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            if (rec.getState() != OrderState.ORDERED)
                throw new BadRequestException("Order %s is not in State %s".formatted(orderId, OrderState.ORDERED));

            rec.setState(OrderState.DELIVERED);
            rec.setDeliveredAt(updater.timestamp());
        });
    }

    public generated.sky.meal.ordering.rest.model.Order revokeOrder(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            var requiredStates = Set.of(OrderState.OPEN, OrderState.LOCKED, OrderState.ORDERED);
            if (!requiredStates.contains(rec.getState()))
                throw new BadRequestException("Order %s is not one of States %s".formatted(orderId, requiredStates));

            rec.setState(OrderState.REVOKED);
            rec.setRevokedAt(updater.timestamp());
        });
    }

    public generated.sky.meal.ordering.rest.model.Order archiveOrder(UUID orderId) {
        return changeOrderRecord(orderId, (updater, rec) -> {
            var requiredStates = Set.of(OrderState.DELIVERED, OrderState.ORDERED);
            if (!requiredStates.contains(rec.getState()))
                throw new BadRequestException("Order %s is not one of States %s".formatted(orderId, requiredStates));

            rec.setState(OrderState.ARCHIVED);
            rec.setArchivedAt(updater.timestamp());
        });
    }

    private generated.sky.meal.ordering.rest.model.Order changeOrderRecord(UUID orderId, BiConsumer<Updater, MealOrderRecord> callback) {
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

    private List<generated.sky.meal.ordering.rest.model.Order> fetchOrders() {
        var positionsByOrderId = ctx.selectFrom(Tables.ORDER_POSITION)
                .orderBy(Tables.ORDER_POSITION.CREATED_AT.asc())
                .fetch()
                .intoGroups(Tables.ORDER_POSITION.ORDER_ID);

        return ctx.selectFrom(Tables.MEAL_ORDER)
                .where(Tables.MEAL_ORDER.STATE.notIn(OrderState.ARCHIVED, OrderState.REVOKED))
                .orderBy(Tables.MEAL_ORDER.CREATED_AT.desc())
                .fetch()
                .map(rec -> Mapper.map(rec, positionsByOrderId.get(rec.getId())));
    }

    private generated.sky.meal.ordering.rest.model.Order fetchOrder(UUID id) {
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
        private static generated.sky.meal.ordering.rest.model.Order map(MealOrderRecord rec, List<generated.sky.meal.ordering.schema.tables.records.OrderPositionRecord> rawPositions) {
            var positions = rawPositions == null ? List.<generated.sky.meal.ordering.schema.tables.records.OrderPositionRecord>of() : rawPositions;

            return generated.sky.meal.ordering.rest.model.Order.builder()
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

        private static generated.sky.meal.ordering.rest.model.OrderMoneyCollectionType map(generated.sky.meal.ordering.schema.enums.MoneyCollectionType type) {
            return Optional.ofNullable(type)
                    .map(Enum::name)
                    .map(generated.sky.meal.ordering.rest.model.OrderMoneyCollectionType::valueOf)
                    .orElse(null);
        }

        private static generated.sky.meal.ordering.schema.enums.MoneyCollectionType map(generated.sky.meal.ordering.rest.model.OrderMoneyCollectionType type) {
            return Optional.ofNullable(type)
                    .map(Enum::name)
                    .map(generated.sky.meal.ordering.schema.enums.MoneyCollectionType::valueOf)
                    .orElse(null);
        }

        private static generated.sky.meal.ordering.schema.enums.OrderState map(generated.sky.meal.ordering.rest.model.OrderState state) {
            return generated.sky.meal.ordering.schema.enums.OrderState.valueOf(state.name());
        }

        private static generated.sky.meal.ordering.rest.model.OrderState map(generated.sky.meal.ordering.schema.enums.OrderState state) {
            return generated.sky.meal.ordering.rest.model.OrderState.valueOf(state.name());
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
