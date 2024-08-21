package de.sky.meal.ordering.mealordering.observers;

import generated.sky.meal.ordering.rest.model.Restaurant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class RestaurantChangeObserverAggregator implements RestaurantChangeObserver {

    private final List<RestaurantChangeObserver> delegates;

    public RestaurantChangeObserverAggregator(List<RestaurantChangeObserver> delegates) {
        this.delegates = Objects.requireNonNull(delegates);
    }

    @Autowired
    public RestaurantChangeObserverAggregator(RestaurantChangeObserver... delegates) {
        this(Arrays.asList(delegates));
    }

    @Override
    public void onBeforeDeleteRestaurant(UUID id) {
        for (var d : delegates) {
            try {
                d.onBeforeDeleteRestaurant(id);
            } catch (Exception e) {
                log.error("Error occurred in onBeforeDeleteRestaurant in {}", d, e);
            }
        }
    }

    @Override
    public void onRestaurantCreate(Restaurant restaurant) {
        for (var d : delegates) {
            try {
                d.onRestaurantCreate(restaurant);
            } catch (Exception e) {
                log.error("Error occurred in onRestaurantCreate in {}", d, e);
            }
        }
    }

    @Override
    public void onRestaurantUpdate(Restaurant restaurant) {
        for (var d : delegates) {
            try {
                d.onRestaurantUpdate(restaurant);
            } catch (Exception e) {
                log.error("Error occurred in onRestaurantUpdate in {}", d, e);
            }
        }
    }
}
