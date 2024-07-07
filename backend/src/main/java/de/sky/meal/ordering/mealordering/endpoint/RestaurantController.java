package de.sky.meal.ordering.mealordering.endpoint;

import generated.sky.meal.ordering.rest.model.Restaurant;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Controller
public class RestaurantController implements generated.sky.meal.ordering.rest.api.RestaurantApi {
    private final List<Restaurant> restaurants = IntStream.range(0, 25)
            .mapToObj(idx ->
                    Restaurant.builder()
                            .id(UUID.randomUUID())
                            .name("Restaurant #" + idx)
                            .build()
            )
            .collect(Collectors.toCollection(ArrayList::new));

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
