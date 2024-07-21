package de.sky.meal.ordering.mealordering.observers;

import generated.sky.meal.ordering.rest.model.Order;

import java.util.UUID;

public interface OnOrderChange {
    default void onNewOrder(Order order) {
    }

    default void onLockOrder(Order order) {
    }

    default void onOrderIsReopened(Order order) {
    }

    default void onOrderIsOrdered(Order order) {
    }

    default void onOrderDelivered(Order order) {
    }

    default void onOrderIsRevoked(Order order) {
    }

    default void onBeforeOrderArchive(UUID id) {
    }

    default void onBeforeOrderDelete(UUID id) {
    }
}
