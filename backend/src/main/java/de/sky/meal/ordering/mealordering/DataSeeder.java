package de.sky.meal.ordering.mealordering;

import de.sky.meal.ordering.mealordering.service.RestaurantService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {
    private final RestaurantService restaurantService;

    @PostConstruct
    public void doSeeding() {
        addThai();

        addJaegerhof();
    }

    private void addThai() {
        var thai = generated.sky.meal.ordering.rest.model.Restaurant.builder()
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
                .menuPages(List.of())
                .build();

        restaurantService.createRestaurant(thai);
    }

    private void addJaegerhof() {
        var jaegerhof = generated.sky.meal.ordering.rest.model.Restaurant.builder()
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
                .menuPages(List.of())
                .build();

        restaurantService.createRestaurant(jaegerhof);
    }
}
