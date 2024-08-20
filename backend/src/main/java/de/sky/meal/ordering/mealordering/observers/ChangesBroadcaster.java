package de.sky.meal.ordering.mealordering.observers;

import generated.sky.meal.ordering.rest.model.ChangeEvent;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.rest.model.Restaurant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChangesBroadcaster implements OnOrderChange, RestaurantChangeObserver {

    private final JsonMessageBroadcaster broadcaster;

    public void notifyOrdersChanged(UUID id) {
        notifyOrdersChanged(List.of(id));
    }

    public void notifyOrdersChanged(Collection<UUID> ids) {
        var changeEvent = ChangeEvent.builder()
                .eventType(ChangeEvent.EventTypeEnum.ORDERS_CHANGED)
                .subjects(new ArrayList<>(ids))
                .build();

        log.info("Broadcasting orders change event {}", changeEvent);

        broadcaster.send(changeEvent);
    }

    public void notifyOrderUpdated(UUID id) {
        notifyOrderUpdated(List.of(id));
    }

    public void notifyOrderUpdated(Collection<UUID> id) {
        var changeEvent = ChangeEvent.builder()
                .eventType(ChangeEvent.EventTypeEnum.ORDER_UPDATED)
                .subjects(new ArrayList<>(id))
                .build();

        log.info("Broadcasting order update event {}", changeEvent);

        broadcaster.send(changeEvent);
    }

    public void notifyRestaurantsChanged(UUID id) {
        notifyRestaurantsChanged(List.of(id));
    }

    public void notifyRestaurantsChanged(Collection<UUID> ids) {
        var changeEvent = ChangeEvent.builder()
                .eventType(ChangeEvent.EventTypeEnum.RESTAURANTS_CHANGED)
                .subjects(new ArrayList<>(ids))
                .build();

        log.info("Broadcasting restaurants change event {}", changeEvent);

        broadcaster.send(changeEvent);
    }

    public void notifyRestaurantUpdated(UUID id) {
        notifyRestaurantUpdated(List.of(id));
    }

    public void notifyRestaurantUpdated(Collection<UUID> ids) {
        var changeEvent = ChangeEvent.builder()
                .eventType(ChangeEvent.EventTypeEnum.RESTAURANT_UPDATED)
                .subjects(new ArrayList<>(ids))
                .build();

        log.info("Broadcasting restaurant update event {}", changeEvent);

        broadcaster.send(changeEvent);
    }

    @Override
    public void onBeforeDeleteRestaurant(UUID id) {
        notifyRestaurantsChanged(id);
    }

    @Override
    public void onRestaurantCreate(Restaurant restaurant) {
        notifyRestaurantsChanged(restaurant.getId());
    }

    @Override
    public void onRestaurantUpdate(Restaurant restaurant) {
        notifyRestaurantUpdated(restaurant.getId());
    }

    @Override
    public void onNewOrder(Order order) {
        notifyOrdersChanged(order.getId());
    }

    @Override
    public void onOrderInfoUpdated(Order order) {
        notifyOrderUpdated(order.getId());
    }

    @Override
    public void onLockOrder(Order order) {
        notifyOrderUpdated(order.getId());
    }

    @Override
    public void onOrderIsReopened(Order order) {
        notifyOrderUpdated(order.getId());
    }

    @Override
    public void onOrderIsOrdered(Order order) {
        notifyOrderUpdated(order.getId());
    }

    @Override
    public void onOrderDelivered(Order order) {
        notifyOrderUpdated(order.getId());
    }

    @Override
    public void onOrderIsRevoked(Order order) {
        notifyOrderUpdated(order.getId());
    }

    @Override
    public void onOrderPositionCreated(Order order) {
        notifyOrderUpdated(order.getId());
    }

    @Override
    public void onOrderPositionUpdated(Order order) {
        notifyOrderUpdated(order.getId());
    }

    @Override
    public void onOrderPositionDeleted(Order order) {
        notifyOrderUpdated(order.getId());
    }

    @Override
    public void onBeforeOrderArchive(UUID id) {
        notifyOrderUpdated(id);
    }

    @Override
    public void onBeforeOrderDelete(UUID id) {
        notifyOrdersChanged(id);
    }
}
