package de.sky.meal.ordering.mealordering;

import de.sky.meal.ordering.mealordering.config.AppConfig;
import de.sky.meal.ordering.mealordering.service.OrderRepository;
import de.sky.meal.ordering.mealordering.service.RestaurantRepository;
import generated.sky.meal.ordering.rest.model.Address;
import generated.sky.meal.ordering.rest.model.OrderInfosPatch;
import generated.sky.meal.ordering.rest.model.OrderMoneyCollectionType;
import generated.sky.meal.ordering.rest.model.OrderPositionPatch;
import generated.sky.meal.ordering.rest.model.Restaurant;
import generated.sky.meal.ordering.rest.model.RestaurantPatch;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;

@Profile("dev")
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {
    private final AppConfig appConfig;

    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;

    @PostConstruct
    public void doSeeding() {
        if (!appConfig.devModeEnabled()) {
            log.debug("Dev mode disabled, no data seeding");
            return;
        }

        if (!restaurantRepository.readRestaurants().isEmpty()) {
            log.info("Restaurant Data is present. No seeding of initial restaurants");
            return;
        }

        log.info("Seeding Restaurants ...");
        var restaurants = List.of(addThai(), addJaegerhof());

        log.info("Seeding archived orders ...");
        addRandomOrders(restaurants, 365, 3, 12);

        log.info("Seeding finished");
    }

    private Restaurant addThai() {
        var thai = RestaurantPatch.builder()
                .name("Chok Dee Thaiküche")
                .style("thailändisch/asiatisch")
                .kind("Abholen/Sitzen")
                .phone("0221 / 47 68 48 99")
                .website("https://www.chok-dee-rath.de/")
                .address(
                        Address.builder()
                                .street("Rösrather Straße")
                                .housenumber("575")
                                .postal("51107")
                                .city("Köln")
                                .build()
                )
                .build();

        return restaurantRepository.createRestaurant(thai);
    }

    private Restaurant addJaegerhof() {
        var jaegerhof = RestaurantPatch.builder()
                .name("Gaststätte Jägerhof")
                .style("gutbürgerlich/deutsch")
                .style("Sitzen")
                .phone("0221 866831")
                .address(
                        Address.builder()
                                .street("Rösrather Str.")
                                .housenumber("661")
                                .postal("51107")
                                .city("Köln")
                                .build()
                )
                .build();

        return restaurantRepository.createRestaurant(jaegerhof);
    }


    private void addRandomOrders(List<Restaurant> restaurants, int count, int minPositions, int maxPositions) {
        var rng = ThreadLocalRandom.current();

        IntStream.range(0, count)
                .mapToObj(idx -> {
                    var restaurant = restaurants.get(rng.nextInt(0, restaurants.size()));
                    int positions = rng.nextInt(minPositions, maxPositions);

                    var order = orderRepository.createNewEmptyOrder(LocalDate.now().minusDays((idx + 1) * 2L), restaurant.getId());

                    for (int i = 0; i < positions; i++) {
                        var meal = randomMeal(rng);

                        var pos = OrderPositionPatch.builder()
                                .name(randomName(rng))
                                .meal(meal.name())
                                .price(meal.price())
                                .paid(meal.paid())
                                .tip(meal.tip())
                                .build();

                        order = orderRepository.addOrderPosition(order.getId(), pos);
                    }

                    var info = OrderInfosPatch.builder()
                            .orderer(order.getOrderPositions().getFirst().getName())
                            .fetcher(order.getOrderPositions().getFirst().getName())
                            .moneyCollector(order.getOrderPositions().getFirst().getName())
                            .moneyCollectionType(OrderMoneyCollectionType.values()[rng.nextInt(0, OrderMoneyCollectionType.values().length)])
                            .build();

                    order = orderRepository.updateOrderInfos(order.getId(), order.getVersion(), info);

                    order = orderRepository.lockOrder(order.getId(), order.getVersion());
                    order = orderRepository.setOrderToIsOrdered(order.getId(), order.getVersion());
                    order = orderRepository.setOrderToDelivered(order.getId(), order.getVersion());
                    order = orderRepository.archiveOrder(order.getId(), order.getVersion());

                    return order;
                })
                .forEach(order -> log.debug("Seeded order {} on {}", order.getId(), order.getDate()));
    }

    private record Meal(String name, float price, float paid, float tip) {

    }

    private static Meal randomMeal(Random rng) {
        var adds = List.of("Ente", "Tofu", "Rind", "Hühnchen", "", "", "");

        var name = "M" + rng.nextInt(30, 40) + " " + adds.get(rng.nextInt(0, adds.size()));

        var price = rng.nextInt(2 * 8, 2 * 14) / 2.0f;
        var tip = rng.nextInt(0, 5) / 2.0f;
        var change = rng.nextInt(0, 10) / 2.0f;

        return new Meal(name, price, price + tip + change, tip);
    }

    private static String randomName(Random rng) {
        var names = List.of("Kristine", "Victoria", "Hauke", "Swen", "Inga", "Hans-Dieter", "Helen", "Ekaterina", "Gaby", "Hanni", "Karl-Friedrich", "Halina", "Gerold", "Laura", "Annelie", "Igor", "Thorsten", "Wilhelm", "Helga", "Thekla", "Gertraud", "Bert", "Hertha", "Rosa", "Mandy", "Marcus", "Cäcilia", "Hansjörg", "Mehmet", "Karla", "Jean", "Annika", "Lotte", "August", "Heidi", "Giuseppe", "Hasan", "Melanie", "Hannah", "Vladimir", "Elmar", "Sebastian", "Karin", "Hans-Jürgen", "Helma", "Natalie", "Alois", "Dominik", "Friedhelm", "Victor");

        return names.get(rng.nextInt(0, names.size()));
    }
}
