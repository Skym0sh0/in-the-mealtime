package de.sky.meal.ordering.mealordering;

import de.sky.meal.ordering.mealordering.service.RestaurantRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Profile("dev")
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {
    private final RestaurantRepository restaurantRepository;

    @PostConstruct
    public void doSeeding() {
        if (!restaurantRepository.readRestaurants().isEmpty()) {
            log.info("Restaurant Data is present. No seeding of initial restaurants");
            return;
        }

        addThai();

        addJaegerhof();
    }

    private void addThai() {
        var thai = generated.sky.meal.ordering.rest.model.RestaurantPatch.builder()
                .name("Chok Dee Thaiküche")
                .style("thailändisch/asiatisch")
                .kind("Abholen/Sitzen")
                .phone("0221 / 47 68 48 99")
                .website("https://www.chok-dee-rath.de/")
                .address(
                        generated.sky.meal.ordering.rest.model.Address.builder()
                                .street("Rösrather Straße")
                                .housenumber("575")
                                .postal("51107")
                                .city("Köln")
                                .build()
                )
                .build();

        restaurantRepository.createRestaurant(thai);
    }

    private void addJaegerhof() {
        var jaegerhof = generated.sky.meal.ordering.rest.model.RestaurantPatch.builder()
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
                .build();

        restaurantRepository.createRestaurant(jaegerhof);
    }
}
