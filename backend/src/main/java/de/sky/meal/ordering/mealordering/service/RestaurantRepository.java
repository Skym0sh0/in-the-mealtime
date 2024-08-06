package de.sky.meal.ordering.mealordering.service;

import de.sky.meal.ordering.mealordering.config.DefaultUser;
import de.sky.meal.ordering.mealordering.model.DatabaseFile;
import de.sky.meal.ordering.mealordering.model.exceptions.AlreadyExistsException;
import de.sky.meal.ordering.mealordering.model.exceptions.ConcurrentUpdateException;
import de.sky.meal.ordering.mealordering.model.exceptions.RecordNotFoundException;
import de.sky.meal.ordering.mealordering.model.exceptions.WrongOrderStateException;
import generated.sky.meal.ordering.rest.model.Address;
import generated.sky.meal.ordering.rest.model.MenuPage;
import generated.sky.meal.ordering.rest.model.Restaurant;
import generated.sky.meal.ordering.rest.model.RestaurantPatch;
import generated.sky.meal.ordering.schema.Tables;
import generated.sky.meal.ordering.schema.enums.OrderState;
import generated.sky.meal.ordering.schema.tables.records.MenuPageRecord;
import generated.sky.meal.ordering.schema.tables.records.RestaurantRecord;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.IntStream;

import static org.jooq.impl.DSL.select;

@Service
@RequiredArgsConstructor
public class RestaurantRepository {
    private final DSLContext ctx;
    private final TransactionTemplate transactionTemplate;


    public Restaurant createRestaurant(RestaurantPatch restaurant) {
        return transactionTemplate.execute(status -> {
            checkIfNameIsUnique(status, restaurant.getName());

            var id = UUID.randomUUID();
            var now = OffsetDateTime.now();

            var dbRestaurant = ctx.newRecord(Tables.RESTAURANT);

            dbRestaurant.setId(id)
                    .setVersion(UUID.randomUUID())
                    .setCreatedAt(now)
                    .setUpdatedAt(now)
                    .setCreatedBy(DefaultUser.DEFAULT_USER)
                    .setUpdatedBy(DefaultUser.DEFAULT_USER);

            dbRestaurant.setName(restaurant.getName())
                    .setStyle(restaurant.getStyle())
                    .setKind(restaurant.getKind())
                    .setPhone(restaurant.getPhone())
                    .setEmail(restaurant.getEmail())
                    .setShortDescription(restaurant.getShortDescription())
                    .setLongDescription(restaurant.getDescription());

            Optional.ofNullable(restaurant.getAddress())
                    .ifPresent(add -> {
                        dbRestaurant.setStreet(add.getStreet())
                                .setHousenumber(add.getHousenumber())
                                .setPostal(add.getPostal())
                                .setCity(add.getCity());
                    });

            dbRestaurant.insert();

            return fetchRestaurant(status, id);
        });
    }

    public Restaurant updateRestaurant(UUID id, UUID etag, RestaurantPatch restaurant) {
        return transactionTemplate.execute(status -> {
            var rec = ctx.selectFrom(Tables.RESTAURANT)
                    .where(Tables.RESTAURANT.ID.eq(id))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new RecordNotFoundException("Restaurant", id));

            checkIfNameIsUnique(status, restaurant.getName());

            if (!rec.getVersion().equals(etag))
                throw new ConcurrentUpdateException("Restaurant", etag);

            rec.setName(restaurant.getName())
                    .setStyle(restaurant.getStyle())
                    .setKind(restaurant.getKind())
                    .setPhone(restaurant.getPhone())
                    .setEmail(restaurant.getEmail())
                    .setWebsite(restaurant.getWebsite())
                    .setShortDescription(restaurant.getShortDescription())
                    .setLongDescription(restaurant.getDescription());

            Optional.ofNullable(restaurant.getAddress())
                    .ifPresent(add -> {
                        rec.setStreet(add.getStreet())
                                .setHousenumber(add.getHousenumber())
                                .setPostal(add.getPostal())
                                .setCity(add.getCity());
                    });

            rec.setUpdatedBy(DefaultUser.DEFAULT_USER);
            rec.setUpdatedAt(OffsetDateTime.now());
            rec.setVersion(UUID.randomUUID());

            rec.update();

            return fetchRestaurant(status, id);
        });
    }

    public List<Restaurant> readRestaurants() {
        return transactionTemplate.execute(this::fetchRestaurants);
    }

    public Restaurant readRestaurant(UUID id) {
        return transactionTemplate.execute(status -> fetchRestaurant(status, id));
    }

    public void deleteRestaurant(UUID id, UUID etag) {
        transactionTemplate.executeWithoutResult(status -> {
            var rec = fetchRestaurant(status, id);
            if (!rec.getVersion().equals(etag))
                throw new ConcurrentUpdateException("Restaurant", etag);

            if (ctx.fetchExists(Tables.MEAL_ORDER, Tables.MEAL_ORDER.STATE.notIn(OrderState.NEW, OrderState.REVOKED, OrderState.ARCHIVED)))
                throw new WrongOrderStateException("Can not delete restaurant with open orders");

            ctx.deleteFrom(Tables.ORDER_POSITION)
                    .where(Tables.ORDER_POSITION.ORDER_ID.in(
                            select(Tables.MEAL_ORDER.ID)
                                    .from(Tables.MEAL_ORDER)
                                    .where(Tables.MEAL_ORDER.RESTAURANT_ID.eq(id))
                    ))
                    .execute();

            ctx.deleteFrom(Tables.MEAL_ORDER)
                    .where(Tables.MEAL_ORDER.RESTAURANT_ID.eq(id))
                    .execute();

            ctx.deleteFrom(Tables.MENU_PAGE)
                    .where(Tables.MENU_PAGE.RESTAURANT_ID.eq(id))
                    .execute();

            var deleted = ctx.deleteFrom(Tables.RESTAURANT)
                    .where(Tables.RESTAURANT.ID.eq(id))
                    .execute();

            if (deleted == 0)
                throw new RecordNotFoundException("Restaurant", id);
        });
    }

    public Restaurant addMenuPageToRestaurant(UUID restaurantId, DatabaseFile file) {
        var ts = OffsetDateTime.now();
        var updater = DefaultUser.DEFAULT_USER;

        return transactionTemplate.execute(status -> {
            var restaurantRec = ctx.selectFrom(Tables.RESTAURANT)
                    .where(Tables.RESTAURANT.ID.eq(restaurantId))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new RecordNotFoundException("Restaurant", restaurantId));

            var page = ctx.newRecord(Tables.MENU_PAGE);

            page.setId(UUID.randomUUID())
                    .setCreatedBy(updater)
                    .setCreatedAt(ts);
            page.setRestaurantId(restaurantId);

            page.setName(file.name())
                    .setImageData(file.data())
                    .setImageDataMediaType(file.contentType().toString());

            page.insert();

            restaurantRec.setVersion(UUID.randomUUID())
                    .setUpdatedAt(ts)
                    .setUpdatedBy(updater);

            restaurantRec.update();

            return fetchRestaurant(status, restaurantId);
        });
    }

    public Restaurant deleteMenuPageForRestaurant(UUID restaurantId, UUID pageId) {
        var ts = OffsetDateTime.now();
        var updater = DefaultUser.DEFAULT_USER;

        return transactionTemplate.execute(status -> {
            var restaurantRec = ctx.selectFrom(Tables.RESTAURANT)
                    .where(Tables.RESTAURANT.ID.eq(restaurantId))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new RecordNotFoundException("Restaurant", restaurantId));

            var deleted = ctx.deleteFrom(Tables.MENU_PAGE)
                    .where(Tables.MENU_PAGE.ID.eq(pageId))
                    .and(Tables.MENU_PAGE.RESTAURANT_ID.eq(restaurantId))
                    .execute();

            if (deleted == 0)
                throw new RecordNotFoundException("Restaurant", restaurantId, "MenuPage", pageId);

            restaurantRec.setVersion(UUID.randomUUID())
                    .setUpdatedAt(ts)
                    .setUpdatedBy(updater);

            restaurantRec.update();

            return fetchRestaurant(status, restaurantId);
        });
    }

    public DatabaseFile readMenuPage(UUID restaurantId, UUID pageId) {
        var rec = ctx.fetchOptional(Tables.MENU_PAGE, Tables.MENU_PAGE.ID.eq(pageId).and(Tables.MENU_PAGE.RESTAURANT_ID.eq(restaurantId)))
                .orElseThrow(() -> new RecordNotFoundException("Restaurant", restaurantId, "MenuPage", pageId));

        return new DatabaseFile(
                rec.getName(),
                rec.getImageDataMediaType(),
                rec.getImageData()
        );
    }

    private List<Restaurant> fetchRestaurants(TransactionStatus status) {
        var pagesByRestaurantId = ctx.selectFrom(Tables.MENU_PAGE)
                .orderBy(Tables.MENU_PAGE.CREATED_AT.desc())
                .fetch()
                .intoGroups(Tables.MENU_PAGE.RESTAURANT_ID);

        return ctx.selectFrom(Tables.RESTAURANT)
                .orderBy(Tables.RESTAURANT.NAME)
                .fetch()
                .map(rec -> map(rec, pagesByRestaurantId.get(rec.getId())));
    }

    private Restaurant fetchRestaurant(TransactionStatus status, UUID id) {
        var pages = ctx.selectFrom(Tables.MENU_PAGE)
                .where(Tables.MENU_PAGE.RESTAURANT_ID.eq(id))
                .orderBy(Tables.MENU_PAGE.CREATED_AT.desc())
                .fetch();

        return ctx.fetchOptional(Tables.RESTAURANT, Tables.RESTAURANT.ID.eq(id))
                .map(rec -> map(rec, pages))
                .orElseThrow(() -> new RecordNotFoundException("Restaurant", id));
    }

    private void checkIfNameIsUnique(TransactionStatus status, String name) {
        if (ctx.fetchExists(Tables.RESTAURANT, Tables.RESTAURANT.NAME.equalIgnoreCase(name)))
            throw new AlreadyExistsException("Restaurant", "Name is not unique");
    }

    private static Restaurant map(RestaurantRecord rec, List<MenuPageRecord> pages) {
        return Restaurant.builder()
                .id(rec.getId())
                .createdAt(rec.getCreatedAt())
                .createdBy(rec.getCreatedBy())
                .updatedAt(rec.getUpdatedAt())
                .updatedBy(rec.getUpdatedBy())
                .version(rec.getVersion())
                .name(rec.getName())
                .style(rec.getStyle())
                .kind(rec.getKind())
                .phone(rec.getPhone())
                .email(rec.getEmail())
                .website(rec.getWebsite())
                .address(
                        Address.builder()
                                .street(rec.getStreet())
                                .housenumber(rec.getHousenumber())
                                .postal(rec.getPostal())
                                .city(rec.getCity())
                                .build()
                )
                .shortDescription(rec.getShortDescription())
                .description(rec.getLongDescription())
                .menuPages(
                        IntStream.range(0, Optional.ofNullable(pages).map(List::size).orElse(0))
                                .mapToObj(idx -> {
                                    var p = pages.get(idx);
                                    return MenuPage.builder()
                                            .id(p.getId())
                                            .index(idx)
                                            .name(p.getName())
                                            .build();
                                })
                                .toList()
                )
                .build();
    }
}
