package de.sky.meal.ordering.mealordering.endpoint;

import generated.sky.meal.ordering.rest.model.*;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.rest.model.OrderInfos;
import generated.sky.meal.ordering.rest.model.OrderPosition;
import generated.sky.meal.ordering.rest.model.Restaurant;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.IntFunction;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Controller
@RequiredArgsConstructor
public class OrderController implements generated.sky.meal.ordering.rest.api.OrderApi {

    private final RestaurantController restaurants;

    private final List<Order> orders = new ArrayList<>();

    private Optional<List<Restaurant>> getRestaurants() {
        return Optional.ofNullable(this.restaurants.fetchRestaurants().getBody());
    }

    @PostConstruct
    public void init() {
        var rng = ThreadLocalRandom.current();

        IntFunction<OrderPosition> positionCreator = (idx) -> {
            String[] names = {
                    "Anna", "Max", "Erik", "Lisa", "Ben", "Nina", "Paul", "Sophie", "Lukas", "Marie",
                    "Julia", "Tim", "Laura", "Tom", "Sarah", "Jan", "Lea", "Jonas", "Mia", "Felix",
                    "Emma", "Leon", "Hannah", "Finn", "Clara", "Noah", "Lena", "Elias", "Mila", "Lara",
                    "Johannes", "Hanna", "Oscar", "Amy", "David", "Emily", "Leo", "Hanne", "Nick",
                    "Ella", "Alex", "Greta", "Markus", "Isabel", "Anton", "Nico", "Jana", "Matthias",
                    "Charlotte", "Fabian", "Tina", "Henri", "Leonard", "Kira", "Marlene", "Julius",
                    "Lilly", "Kai", "Alina", "Linus", "Dana", "Cedric", "Rosa", "Henry", "Fiona",
                    "Tobias", "Teresa", "Viktor", "Zoey", "Marco", "Nele", "Carl", "Romy", "Philipp",
                    "Valerie", "Sebastian", "Melina", "Emil", "Felicitas", "Samuel", "Ida", "Marius",
                    "Ronja", "Simon", "Katharina", "Bastian", "Helena", "Matthias", "Victoria", "Basti",
                    "Stefan", "Miriam", "Dominik", "Lina", "Daniel", "Carla"
            };
            String[] ext = {
                    "",
                    " mit Tofu",
                    " mit Ente",
                    " mit Hähnchen",
                    " mit Rind",
            };

            var hasPaid = rng.nextDouble() < 0.4;
            var price = rng.nextInt(5, 16) * 1.f;
            var tip = rng.nextInt(0, 5) / 2.0f;

            return OrderPosition.builder()
                    .id(UUID.randomUUID())
                    .index(idx)
                    .name(names[rng.nextInt(0, names.length)])
                    .meal("%s%s".formatted(rng.nextInt(20, 70), ext[rng.nextInt(0, ext.length)]))
                    .price(price)
                    .paid(!hasPaid ? null : price + tip)
                    .tip(tip)
                    .build();
        };

        IntStream.range(0, 0)
                .mapToObj(idx -> {
                            return getRestaurants()
                                    .filter(s -> !s.isEmpty())
                                    .map(restaurants -> {
                                        return Order.builder()
                                                .id(UUID.randomUUID())
                                                .restaurantId(
                                                        restaurants
                                                                .get(idx % restaurants.size())
                                                                .getId()
                                                )
                                                .date(LocalDate.now().minusDays(idx))
                                                .orderPositions(
                                                        rng.ints()
                                                                .limit(rng.nextInt(1, 10))
                                                                .mapToObj(positionCreator)
                                                                .collect(Collectors.toCollection(ArrayList::new))
                                                )
                                                .build();
                                    });
                        }
                )
                .filter(Optional::isPresent)
                .map(Optional::get)
                .forEach(orders::add);
    }

    @Override
    public ResponseEntity<Order> archiveOrder(UUID id) {
        return null;
    }

    @Override
    public ResponseEntity<Order> createOrder(UUID restaurantId) {
        if (getRestaurants().orElse(List.of())
                .stream()
                .map(Restaurant::getId)
                .filter(s -> s.equals(restaurantId))
                .findAny()
                .isEmpty())
            return ResponseEntity.notFound().build();

        var order = Order.builder()
                .id(UUID.randomUUID())
                .restaurantId(restaurantId)
                .infos(new OrderInfos())
                .orderState(generated.sky.meal.ordering.rest.model.OrderState.NEW)
                .date(LocalDate.now())
                .orderPositions(new ArrayList<>())
                .build();

        orders.add(order);
        return ResponseEntity.ok(order);
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
        orders.sort(Comparator.comparing(Order::getDate).reversed());

        return ResponseEntity.ok(orders);
    }

    @Override
    public ResponseEntity<Order> lockOrder(UUID id) {
        return null;
    }

    @Override
    public ResponseEntity<Order> orderIsNowDelivered(UUID id) {
        return null;
    }

    @Override
    public ResponseEntity<Order> orderIsNowOrdered(UUID id) {
        return null;
    }

    @Override
    public ResponseEntity<Order> reopenOrder(UUID id) {
        return null;
    }

    @Override
    public ResponseEntity<Order> revokeOrder(UUID id) {
        return null;
    }

    @Override
    public ResponseEntity<Order> setOrderInfo(UUID orderId, OrderInfos orderInfos) {
        return orders.stream()
                .filter(o -> o.getId().equals(orderId))
                .findAny()
                .map(o -> {
                    o.infos(orderInfos);
                    return o;
                })
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Order> createOrderPosition(UUID orderId, OrderPosition orderPosition) {
        orderPosition.id(UUID.randomUUID());

        return orders.stream()
                .filter(o -> o.getId().equals(orderId))
                .findAny()
                .map(o -> {
                    o.addOrderPositionsItem(orderPosition);
                    return o;
                })
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteOrder(UUID id) {
        return null;
    }

    @Override
    public ResponseEntity<Order> updateOrderPosition(UUID orderId, UUID orderPositionId, OrderPosition orderPosition) {
        if (!orderPositionId.equals(orderPosition.getId()))
            return ResponseEntity.badRequest().build();

        return orders.stream()
                .filter(o -> o.getId().equals(orderId))
                .findAny()
                .map(o -> {
                    o.getOrderPositions().removeIf(p -> p.getId().equals(orderPositionId));
                    o.addOrderPositionsItem(orderPosition);
                    return o;
                })
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Order> deleteOrderPosition(UUID orderId, UUID orderPositionId) {
        return orders.stream()
                .filter(o -> o.getId().equals(orderId))
                .findAny()
                .map(o -> {
                    o.getOrderPositions().removeIf(p -> p.getId().equals(orderPositionId));
                    return o;
                })
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
