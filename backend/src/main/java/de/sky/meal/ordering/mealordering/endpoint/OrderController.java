package de.sky.meal.ordering.mealordering.endpoint;

import de.sky.meal.ordering.mealordering.observers.OrderChangeAggregator;
import de.sky.meal.ordering.mealordering.service.OrderRepository;
import generated.sky.meal.ordering.rest.api.OrderApi;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.rest.model.OrderInfosPatch;
import generated.sky.meal.ordering.rest.model.OrderPositionPatch;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class OrderController implements OrderApi {

    private final OrderRepository orderRepository;
    private final OrderChangeAggregator observer;

    @Override
    public ResponseEntity<List<UUID>> fetchOrderableRestaurants() {
        return ResponseEntity.ok(orderRepository.readOrderableRestaurantIds(LocalDate.now()));
    }

    @Override
    public ResponseEntity<Order> createOrder(UUID restaurantId) {
        var order = orderRepository.createNewEmptyOrder(LocalDate.now(), restaurantId);

        observer.onNewOrder(order);

        return ResponseEntity.ok(order);
    }

    @Override
    public ResponseEntity<Order> fetchOrder(UUID id) {
        return ResponseEntity.ok(orderRepository.readOrder(id));
    }

    @Override
    public ResponseEntity<List<Order>> fetchOrders() {
        return ResponseEntity.ok(orderRepository.readOrders());
    }

    @Override
    public ResponseEntity<Order> setOrderInfo(UUID orderId, OrderInfosPatch orderInfos) {
        return ResponseEntity.ok(orderRepository.updateOrderInfos(orderId, orderInfos));
    }

    @Override
    public ResponseEntity<Void> deleteOrder(UUID id) {
        observer.onBeforeOrderDelete(id);

        orderRepository.deleteOrder(id);

        return ResponseEntity.ok()
                .build();
    }

    @Override
    public ResponseEntity<Order> createOrderPosition(UUID orderId, OrderPositionPatch orderPosition) {
        return ResponseEntity.ok(orderRepository.addOrderPosition(orderId, orderPosition));
    }

    @Override
    public ResponseEntity<Order> updateOrderPosition(UUID orderId, UUID orderPositionId, OrderPositionPatch orderPosition) {
        return ResponseEntity.ok(orderRepository.updateOrderPosition(orderId, orderPositionId, orderPosition));
    }

    @Override
    public ResponseEntity<Order> deleteOrderPosition(UUID orderId, UUID orderPositionId) {
        return ResponseEntity.ok(orderRepository.removeOrderPosition(orderId, orderPositionId));
    }

    @Override
    public ResponseEntity<Order> lockOrder(UUID id) {
        var order = orderRepository.lockOrder(id);

        observer.onLockOrder(order);

        return ResponseEntity.ok(order);
    }

    @Override
    public ResponseEntity<Order> orderIsNowOrdered(UUID id) {
        var order = orderRepository.setOrderToIsOrdered(id);

        observer.onOrderIsOrdered(order);

        return ResponseEntity.ok(order);
    }

    @Override
    public ResponseEntity<Order> orderIsNowDelivered(UUID id) {
        var order = orderRepository.setOrderToDelivered(id);

        observer.onOrderDelivered(order);

        return ResponseEntity.ok(order);
    }

    @Override
    public ResponseEntity<Order> reopenOrder(UUID id) {
        var order = orderRepository.reopenOrder(id);

        observer.onOrderIsReopened(order);

        return ResponseEntity.ok(order);
    }

    @Override
    public ResponseEntity<Order> revokeOrder(UUID id) {
        var order = orderRepository.revokeOrder(id);

        observer.onOrderIsRevoked(order);

        return ResponseEntity.ok(order);
    }

    @Override
    public ResponseEntity<Order> archiveOrder(UUID id) {
        observer.onBeforeOrderArchive(id);

        return ResponseEntity.ok(orderRepository.archiveOrder(id));
    }
}
