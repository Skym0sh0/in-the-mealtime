package de.sky.meal.ordering.mealordering.endpoint;

import generated.sky.meal.ordering.rest.model.Restaurant;
import jakarta.ws.rs.core.HttpHeaders;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@Controller
public class RestaurantController implements generated.sky.meal.ordering.rest.api.RestaurantApi {
    private final List<Restaurant> restaurants = new ArrayList<>();

    private final Map<UUID, Page> menuPagesById = new HashMap<>();

    private record TmpFile(String name, byte[] data) {
    }

    private record Page(UUID id, TmpFile thumbnail, TmpFile fullsize) {
    }

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
        var old = restaurants.stream()
                .filter(r -> r.getId().equals(id))
                .findAny();

        if (!restaurants.removeIf(r -> r.getId().equals(id)))
            throw new NoSuchElementException("No Restaurant with ID " + id);

        restaurant.setId(id);
        restaurants.add(restaurant);
        restaurant.setMenuPages(old.orElseThrow().getMenuPages());
        if (restaurant.getMenuPages() == null)
            restaurant.setMenuPages(new ArrayList<>());

        return ResponseEntity.ok(restaurant);
    }

    @Override
    public ResponseEntity<Resource> fetchRestaurantsMenuPage(UUID restaurantId, UUID pageId, Boolean thumbnail) {
        return restaurants.stream()
                .filter(r -> r.getId().equals(restaurantId))
                .map(Restaurant::getMenuPages)
                .flatMap(Collection::stream)
                .filter(p -> p.getId().equals(pageId))
                .findAny()
                .map(p -> menuPagesById.get(p.getId()))
                .filter(Objects::nonNull)
                .map(p -> Boolean.TRUE.equals(thumbnail) ? p.thumbnail() : p.fullsize())
                .map(file -> {
                    var type = switch (file.name().toLowerCase().substring(file.name().lastIndexOf('.') + 1)) {
                        case "jpg" -> MediaType.IMAGE_JPEG;
                        case "jpeg" -> MediaType.IMAGE_JPEG;
                        case "gif" -> MediaType.IMAGE_GIF;
                        case "webp" -> MediaType.parseMediaType("image/webp");
                        case "png" -> MediaType.IMAGE_PNG;
                        default -> MediaType.ALL;
                    };

                    return ResponseEntity.ok()
                            .contentType(type)
                            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.name() + "\"")
                            .body((Resource) new ByteArrayResource(file.data()));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Restaurant> addRestaurantsMenuPage(UUID restaurantId, MultipartFile file) {
        return restaurants.stream()
                .filter(r -> r.getId().equals(restaurantId))
                .findAny()
                .map(r -> {
                    UUID id = UUID.randomUUID();

                    try (var is = file.getInputStream()) {
                        var data = StreamUtils.copyToByteArray(is);

                        menuPagesById.put(id, new Page(
                                id,
                                new TmpFile(file.getOriginalFilename(), data),
                                new TmpFile(file.getOriginalFilename(), data)
                        ));

                        r.getMenuPages()
                                .add(
                                        generated.sky.meal.ordering.rest.model.MenuPage.builder()
                                                .id(id)
                                                .index(r.getMenuPages().size() + 1)
                                                .name(file.getOriginalFilename())
                                                .build()
                                );
                    } catch (Exception e) {
                        throw new RuntimeException("Konnte file nicht lesen", e);
                    }

                    return r;
                })
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Restaurant> deleteRestaurantsMenuPage(UUID restaurantId, UUID pageId) {
        var cnt = restaurants.stream()
                .map(Restaurant::getMenuPages)
                .flatMap(Collection::stream)
                .filter(p -> p.getId().equals(pageId))
                .count();

        return restaurants.stream()
                .filter(r -> r.getId().equals(restaurantId))
                .findAny()
                .map(r -> {
                    r.getMenuPages().removeIf(p -> p.getId().equals(pageId));
                    return r;
                })
                .map(s -> {
                    if (cnt == 1)
                        menuPagesById.remove(pageId);

                    return s;
                })
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
