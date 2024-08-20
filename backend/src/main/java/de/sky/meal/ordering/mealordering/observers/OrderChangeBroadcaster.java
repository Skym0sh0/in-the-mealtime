package de.sky.meal.ordering.mealordering.observers;

import generated.sky.meal.ordering.rest.model.ChangeEvent;
import generated.sky.meal.ordering.rest.model.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderChangeBroadcaster implements OnOrderChange {

    private final JsonMessageBroadcaster broadcaster;

    public void onOrdersChanged(UUID id) {
        var changeEvent = ChangeEvent.builder()
                .eventType(ChangeEvent.EventTypeEnum.ORDERS_CHANGED)
                .subjects(List.of(id))
                .build();

        log.info("Broadcasting orders change event {}", changeEvent);

        broadcaster.send(changeEvent);
    }

    public void onOrderUpdated(UUID id) {
        var changeEvent = ChangeEvent.builder()
                .eventType(ChangeEvent.EventTypeEnum.ORDER_UPDATED)
                .subjects(List.of(id))
                .build();

        log.info("Broadcasting order update event {}", changeEvent);

        broadcaster.send(changeEvent);
    }

    @Override
    public void onNewOrder(Order order) {
        onOrdersChanged(order.getId());
    }

    @Override
    public void onOrderInfoUpdated(Order order) {
        onOrderUpdated(order.getId());
    }

    @Override
    public void onLockOrder(Order order) {
        onOrderUpdated(order.getId());
    }

    @Override
    public void onOrderIsReopened(Order order) {
        onOrderUpdated(order.getId());
    }

    @Override
    public void onOrderIsOrdered(Order order) {
        onOrderUpdated(order.getId());
    }

    @Override
    public void onOrderDelivered(Order order) {
        onOrderUpdated(order.getId());
    }

    @Override
    public void onOrderIsRevoked(Order order) {
        onOrderUpdated(order.getId());
    }

    @Override
    public void onOrderPositionCreated(Order order) {
        onOrderUpdated(order.getId());
    }

    @Override
    public void onOrderPositionUpdated(Order order) {
        onOrderUpdated(order.getId());
    }

    @Override
    public void onOrderPositionDeleted(Order order) {
        onOrderUpdated(order.getId());
    }

    @Override
    public void onBeforeOrderArchive(UUID id) {
        onOrderUpdated(id);
    }

    @Override
    public void onBeforeOrderDelete(UUID id) {
        onOrdersChanged(id);
    }
}
