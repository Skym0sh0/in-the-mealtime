package de.sky.meal.ordering.mealordering.endpoint;

import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.rest.model.Restaurant;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.IntStream;

@Controller
@RequiredArgsConstructor
public class OrderController implements generated.sky.meal.ordering.rest.api.OrderApi {

    private final RestaurantController restaurants;

    private final List<Order> orders = new ArrayList<>();

    @PostConstruct
    public void init() {
        IntStream.range(0, 15)
                .mapToObj(idx -> {
                            List<Restaurant> restaurants = this.restaurants.fetchRestaurants().getBody();

                            if (restaurants == null || restaurants.isEmpty())
                                return null;

                            return Order.builder()
                                    .id(UUID.randomUUID())
                                    .restaurantId(
                                            restaurants
                                                    .get(idx % restaurants.size())
                                                    .getId()
                                    )
                                    .date(LocalDate.now().minusDays(idx))
                                    .build();
                        }
                )
                .filter(Objects::nonNull)
                .forEach(orders::add);
    }

    @Override
    public ResponseEntity<Order> fetchOrder(UUID id) {
        return orders.stream()
                .filter(o -> o.getId().equals(id))
                .findAny()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<List<Order>> fetchOrders() {
        return ResponseEntity.ok(orders);
    }
}
