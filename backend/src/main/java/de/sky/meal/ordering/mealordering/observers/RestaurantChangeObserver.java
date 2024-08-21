package de.sky.meal.ordering.mealordering.observers;

import generated.sky.meal.ordering.rest.model.Restaurant;

import java.util.UUID;

public interface RestaurantChangeObserver {

    default void onBeforeDeleteRestaurant(UUID id) {
    }

    default void onRestaurantCreate(Restaurant restaurant) {
    }

    default void onRestaurantUpdate(Restaurant restaurant) {
    }
}
