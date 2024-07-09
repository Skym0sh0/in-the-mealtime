package de.sky.meal.ordering.mealordering.endpoint;

import generated.sky.meal.ordering.rest.model.Restaurant;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Controller
public class RestaurantController implements generated.sky.meal.ordering.rest.api.RestaurantApi {
    private final List<Restaurant> restaurants = new ArrayList<>();

    {
        restaurants.add(
                Restaurant.builder()
                        .id(UUID.randomUUID())
                        .name("Chok Dee Thaiküche")
                        .style("thailändisch/asiatisch")
                        .kind("Abholen/Sitzen")
                        .phone("0221 / 47 68 48 99")
                        .website("https://www.chok-dee-rath.de/")
                        .shortDescription("Sehr guter Thai zum Abholen")
                        .description("Sehr guter Thai\n".repeat(10))
                        .address(
                                generated.sky.meal.ordering.rest.model.Address.builder()
                                        .street("Rösrather Straße")
                                        .housenumber("575")
                                        .postal("51107")
                                        .city("Köln")
                                        .build()
                        )
                        .build()
        );

        restaurants.add(
                Restaurant.builder()
                        .id(UUID.randomUUID())
                        .name("Gaststätte Jägerhof")
                        .style("gutbürgerlich/deutsch")
                        .style("Sitzen")
                        .phone("0221 866831")
                        .address(generated.sky.meal.ordering.rest.model.Address.builder()
                                .street("Rösrather Str.")
                                .housenumber("661")
                                .postal("51107")
                                .city("Köln")
                                .build())
                        .build()
        );
    }


    @Override
    public ResponseEntity<Restaurant> createRestaurant(Restaurant restaurant) {
        restaurant.setId(UUID.randomUUID());
        restaurants.add(restaurant);

        return ResponseEntity.ok(restaurant);
    }

    @Override
    public ResponseEntity<Void> deleteRestaurant(UUID id) {
        restaurants.removeIf(r -> r.getId().equals(id));

        return ResponseEntity.ok(null);
    }

    @Override
    public ResponseEntity<Restaurant> fetchRestaurant(UUID id) {
        return restaurants.stream()
                .filter(r -> r.getId().equals(id))
                .findAny()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<List<Restaurant>> fetchRestaurants() {
        restaurants.sort(Comparator.comparing(Restaurant::getName));

        return ResponseEntity.ok(restaurants);
    }

    @Override
    public ResponseEntity<Restaurant> updateRestaurant(UUID id, Restaurant restaurant) {
        if (!restaurants.removeIf(r -> r.getId().equals(id)))
            throw new NoSuchElementException("No Restaurant with ID " + id);

        restaurant.setId(id);
        restaurants.add(restaurant);

        return ResponseEntity.ok(restaurant);
    }
}
