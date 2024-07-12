package de.sky.meal.ordering.mealordering.service;

import de.sky.meal.ordering.mealordering.config.DefaultUser;
import de.sky.meal.ordering.mealordering.model.DatabaseFile;
import generated.sky.meal.ordering.schema.Tables;
import generated.sky.meal.ordering.schema.tables.records.RestaurantRecord;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantService {
    private final DSLContext ctx;
    private final TransactionTemplate transactionTemplate;

    public generated.sky.meal.ordering.rest.model.Restaurant createRestaurant(generated.sky.meal.ordering.rest.model.Restaurant restaurant) {
        return transactionTemplate.execute(status -> {
            var id = UUID.randomUUID();
            var now = OffsetDateTime.now();

            var dbRestaurant = ctx.newRecord(Tables.RESTAURANT);

            dbRestaurant.setId(id)
                    .setVersion(UUID.randomUUID())
                    .setCreatedAt(now)
                    .setUpdatedAt(now)
                    .setCreatedBy(DefaultUser.DEFAULT_USER_STR)
                    .setUpdatedBy(DefaultUser.DEFAULT_USER_STR);

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

            return readRestaurant(id);
        });
    }

    public generated.sky.meal.ordering.rest.model.Restaurant updateRestaurant(UUID id, generated.sky.meal.ordering.rest.model.Restaurant restaurant) {
        return transactionTemplate.execute(status -> {
            var rec = ctx.selectFrom(Tables.RESTAURANT)
                    .where(Tables.RESTAURANT.ID.eq(id))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new NotFoundException("Restaurant not found with id: " + id));

            rec.setName(restaurant.getName())
                    .setStyle(restaurant.getStyle())
                    .setKind(restaurant.getKind())
                    .setPhone(restaurant.getPhone())
                    .setEmail(restaurant.getEmail())
                    .setShortDescription(restaurant.getShortDescription())
                    .setLongDescription(restaurant.getDescription());

            Optional.ofNullable(restaurant.getAddress())
                    .ifPresent(add -> {
                        rec.setStreet(add.getStreet())
                                .setHousenumber(add.getHousenumber())
                                .setPostal(add.getPostal())
                                .setCity(add.getCity());
                    });

            rec.setUpdatedAt(OffsetDateTime.now());
            rec.setVersion(UUID.randomUUID());

            rec.update();

            return readRestaurant(id);
        });
    }

    public List<generated.sky.meal.ordering.rest.model.Restaurant> readRestaurants() {
        return ctx.selectFrom(Tables.RESTAURANT)
                .orderBy(Tables.RESTAURANT.NAME)
                .fetch()
                .map(RestaurantService::map);
    }

    public generated.sky.meal.ordering.rest.model.Restaurant readRestaurant(UUID id) {
        return ctx.fetchOptional(Tables.RESTAURANT, Tables.RESTAURANT.ID.eq(id))
                .map(RestaurantService::map)
                .orElseThrow(() -> new NotFoundException("No Restaurant found with id: " + id));
    }

    public void deleteRestaurant(UUID id) {
        transactionTemplate.executeWithoutResult(status -> {
            ctx.deleteFrom(Tables.MENU_PAGE)
                    .where(Tables.MENU_PAGE.RESTAURANT_ID.eq(id))
                    .execute();

            var deleted = ctx.deleteFrom(Tables.RESTAURANT)
                    .where(Tables.RESTAURANT.ID.eq(id))
                    .execute();

            if (deleted == 0)
                throw new NotFoundException("No Restaurant found with id: " + id);
        });
    }

    public generated.sky.meal.ordering.rest.model.Restaurant addMenuPageToRestaurant(UUID restaurantId, DatabaseFile file) {
        var ts = OffsetDateTime.now();
        var updater = DefaultUser.DEFAULT_USER_STR;

        return transactionTemplate.execute(status -> {
            var restaurantRec = ctx.selectFrom(Tables.RESTAURANT)
                    .where(Tables.RESTAURANT.ID.eq(restaurantId))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new NotFoundException("No Restaurant found with id: " + restaurantId));

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

            return readRestaurant(restaurantId);
        });
    }

    public generated.sky.meal.ordering.rest.model.Restaurant deleteMenuPageForRestaurant(UUID restaurantId, UUID pageId) {
        var ts = OffsetDateTime.now();
        var updater = DefaultUser.DEFAULT_USER_STR;

        return transactionTemplate.execute(status -> {
            var restaurantRec = ctx.selectFrom(Tables.RESTAURANT)
                    .where(Tables.RESTAURANT.ID.eq(restaurantId))
                    .forUpdate()
                    .fetchOptional()
                    .orElseThrow(() -> new NotFoundException("No Restaurant found with id: " + restaurantId));

            var deleted = ctx.deleteFrom(Tables.MENU_PAGE)
                    .where(Tables.MENU_PAGE.ID.eq(pageId))
                    .and(Tables.MENU_PAGE.RESTAURANT_ID.eq(restaurantId))
                    .execute();

            if (deleted == 0)
                throw new NotFoundException("No MenuPage found with id " + pageId + " for Restaurant with id " + restaurantId);

            restaurantRec.setVersion(UUID.randomUUID())
                    .setUpdatedAt(ts)
                    .setUpdatedBy(updater);

            restaurantRec.update();

            return readRestaurant(restaurantId);
        });
    }

    public DatabaseFile readMenuPage(UUID restaurantId, UUID pageId, boolean thumbnail) {
        var rec = ctx.fetchOptional(Tables.MENU_PAGE, Tables.MENU_PAGE.ID.eq(pageId).and(Tables.MENU_PAGE.RESTAURANT_ID.eq(restaurantId)))
                .orElseThrow(() -> new NotFoundException("No MenuPage found with id " + pageId + " for Restaurant with id " + restaurantId));

        return new DatabaseFile(
                rec.getName(),
                rec.getImageDataMediaType(),
                rec.getImageData()
        );
    }

    private static generated.sky.meal.ordering.rest.model.Restaurant map(RestaurantRecord rec) {
        return generated.sky.meal.ordering.rest.model.Restaurant.builder()
                .id(rec.getId())
                .name(rec.getName())
                .style(rec.getStyle())
                .kind(rec.getKind())
                .phone(rec.getPhone())
                .email(rec.getEmail())
                .website(rec.getWebsite())
                .address(
                        generated.sky.meal.ordering.rest.model.Address.builder()
                                .street(rec.getStreet())
                                .housenumber(rec.getHousenumber())
                                .postal(rec.getPostal())
                                .city(rec.getCity())
                                .build()
                )
                .shortDescription(rec.getShortDescription())
                .description(rec.getLongDescription())
                .build();
    }
}
