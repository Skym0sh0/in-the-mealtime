package de.sky.meal.ordering.mealordering.endpoint;

import de.sky.meal.ordering.mealordering.model.DatabaseFile;
import de.sky.meal.ordering.mealordering.model.exceptions.FileTooBigException;
import de.sky.meal.ordering.mealordering.model.exceptions.TooManyEntitiesException;
import de.sky.meal.ordering.mealordering.service.RestaurantRepository;
import generated.sky.meal.ordering.rest.api.RestaurantApi;
import generated.sky.meal.ordering.rest.model.Restaurant;
import generated.sky.meal.ordering.rest.model.RestaurantPatch;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.core.HttpHeaders;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.InvalidMediaTypeException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Controller
@RequiredArgsConstructor
public class RestaurantController implements RestaurantApi {

    private static final int FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
    private static final int MAX_MENU_PAGES = 20;

    private final RestaurantRepository restaurantRepository;

    private final MeterRegistry meterRegistry;

    @Override
    public ResponseEntity<Restaurant> createRestaurant(RestaurantPatch restaurant) {
        var result = restaurantRepository.createRestaurant(restaurant);

        meterRegistry.counter("restaurant.create", "entity", "restaurant").increment();

        return toResponse(result);
    }

    @Override
    public ResponseEntity<Void> deleteRestaurant(UUID id, UUID etag) {
        restaurantRepository.deleteRestaurant(id, etag);

        meterRegistry.counter("restaurant.delete", "entity", "restaurant").increment();

        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Restaurant> fetchRestaurant(UUID id) {
        return toResponse(restaurantRepository.readRestaurant(id));
    }

    @Override
    public ResponseEntity<List<Restaurant>> fetchRestaurants() {
        var restaurants = restaurantRepository.readRestaurants();

        meterRegistry.gauge("restaurant.count", restaurants.size());

        return ResponseEntity.ok(restaurants);
    }

    @Override
    public ResponseEntity<Restaurant> updateRestaurant(UUID id, UUID etag, RestaurantPatch restaurant) {
        var result = restaurantRepository.updateRestaurant(id, etag, restaurant);

        meterRegistry.counter("restaurant.update", "entity", "restaurant").increment();

        return toResponse(result);
    }

    @Override
    public ResponseEntity<Restaurant> addRestaurantsMenuPage(UUID restaurantId, MultipartFile file) {
        if (file.getSize() > FILE_SIZE_LIMIT)
            throw new FileTooBigException("MenuPage File", file.getSize(), FILE_SIZE_LIMIT);

        var restaurant = restaurantRepository.readRestaurant(restaurantId);
        if (restaurant.getMenuPages().size() > MAX_MENU_PAGES)
            throw new TooManyEntitiesException("MenuPages for Restaurant", restaurant.getMenuPages().size(), MAX_MENU_PAGES);

        var result = restaurantRepository.addMenuPageToRestaurant(restaurantId, convertFile(file));

        meterRegistry.counter("restaurant.update", "entity", "restaurant").increment();
        meterRegistry.counter("restaurant.menupage.add", "entity", "restaurant").increment();

        return toResponse(result);

    }

    @Override
    public ResponseEntity<Resource> fetchRestaurantsMenuPage(UUID restaurantId, UUID pageId, Boolean thumbnail) {
        var result = restaurantRepository.readMenuPage(restaurantId, pageId);

        return ResponseEntity.ok()
                .contentType(result.contentType())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.name() + "\"")
                .body(new ByteArrayResource(result.data()));
    }

    @Override
    public ResponseEntity<Restaurant> deleteRestaurantsMenuPage(UUID restaurantId, UUID pageId) {
        var result = restaurantRepository.deleteMenuPageForRestaurant(restaurantId, pageId);

        meterRegistry.counter("restaurant.update", "entity", "restaurant").increment();
        meterRegistry.counter("restaurant.menupage.delete", "entity", "restaurant").increment();

        return toResponse(result);
    }

    private static ResponseEntity<Restaurant> toResponse(Restaurant restaurant) {
        return ResponseEntity.ok().header(HttpHeaders.ETAG, restaurant.getVersion().toString()).body(restaurant);
    }

    private static DatabaseFile convertFile(MultipartFile file) {
        try {
            return new DatabaseFile(
                    Optional.ofNullable(file.getOriginalFilename()).orElse("file-" + System.currentTimeMillis()),
                    file.getContentType(),
                    file.getBytes()
            );
        } catch (IOException e) {
            throw new BadRequestException("File could not be read: " + file.getName(), e);
        } catch (InvalidMediaTypeException e) {
            throw new BadRequestException("ContentType of file could not be read: " + file.getContentType(), e);
        }
    }
}
