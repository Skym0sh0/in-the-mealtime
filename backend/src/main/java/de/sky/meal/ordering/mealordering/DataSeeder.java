package de.sky.meal.ordering.mealordering;

import de.sky.meal.ordering.mealordering.service.RestaurantService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {
    private final RestaurantService restaurantService;

    @PostConstruct
    public void doSeeding() {
        for (int i = 0; i < 10; i++)
            log.info("Doo seeding !" + restaurantService);
    }



    /*

    {
        Supplier<UUID> newMenupage = () -> {
            var menuPageId = UUID.randomUUID();
            try (var th = getClass().getResourceAsStream("/tmp/" + "thumbnail.jpg")) {
                try (var fs = getClass().getResourceAsStream("/tmp/" + "fullsize.webp")) {
                    menuPagesById.put(menuPageId, new Page(
                            menuPageId,
                            new TmpFile("thumbnail.jpg", StreamUtils.copyToByteArray(th)),
                            new TmpFile("fullsize.webp", StreamUtils.copyToByteArray(fs))
                    ));
                }
            } catch (Exception e) {
                throw new RuntimeException("Init failed", e);
            }
            return menuPageId;
        };

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
                        .menuPages(
                                IntStream.range(0, 3)
                                        .mapToObj(idx ->
                                                generated.sky.meal.ordering.rest.model.MenuPage.builder()
                                                        .id(newMenupage.get())
                                                        .name("Seite-" + idx)
                                                        .index(idx)
                                                        .build()
                                        )
                                        .collect(Collectors.toCollection(ArrayList::new))
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
                        .menuPages(
                                IntStream.range(0, 5)
                                        .mapToObj(idx ->
                                                generated.sky.meal.ordering.rest.model.MenuPage.builder()
                                                        .id(newMenupage.get())
                                                        .name("Page " + idx)
                                                        .index(idx)
                                                        .build()
                                        )
                                        .collect(Collectors.toCollection(ArrayList::new))
                        )
                        .build()
        );
    }

     */
}
