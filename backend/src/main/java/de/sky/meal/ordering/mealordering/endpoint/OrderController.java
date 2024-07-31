package de.sky.meal.ordering.mealordering.endpoint;

import de.sky.meal.ordering.mealordering.observers.OrderChangeAggregator;
import de.sky.meal.ordering.mealordering.service.OrderRepository;
import generated.sky.meal.ordering.rest.api.OrderApi;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.rest.model.OrderInfosPatch;
import generated.sky.meal.ordering.rest.model.OrderPositionPatch;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
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

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> fetchOrder(UUID id) {
        return toResponse(orderRepository.readOrder(id));
    }

    @Override
    public ResponseEntity<List<Order>> fetchOrders() {
        return ResponseEntity.ok(orderRepository.readOrders());
    }

    @Override
    public ResponseEntity<Order> setOrderInfo(UUID orderId, UUID etag, OrderInfosPatch orderInfos) {
        return toResponse(orderRepository.updateOrderInfos(orderId, orderInfos));
    }

    @Override
    public ResponseEntity<Void> deleteOrder(UUID id, UUID etag) {
        observer.onBeforeOrderDelete(id);

        orderRepository.deleteOrder(id);

        return ResponseEntity.ok()
                .build();
    }

    @Override
    public ResponseEntity<Order> createOrderPosition(UUID orderId, OrderPositionPatch orderPosition) {
        return toResponse(orderRepository.addOrderPosition(orderId, orderPosition));
    }

    @Override
    public ResponseEntity<Order> updateOrderPosition(UUID orderId, UUID orderPositionId, OrderPositionPatch orderPosition) {
        return toResponse(orderRepository.updateOrderPosition(orderId, orderPositionId, orderPosition));
    }

    @Override
    public ResponseEntity<Order> deleteOrderPosition(UUID orderId, UUID orderPositionId) {
        return toResponse(orderRepository.removeOrderPosition(orderId, orderPositionId));
    }

    @Override
    public ResponseEntity<Order> lockOrder(UUID id, UUID etag) {
        var order = orderRepository.lockOrder(id);

        observer.onLockOrder(order);

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> orderIsNowOrdered(UUID id, UUID etag) {
        var order = orderRepository.setOrderToIsOrdered(id);

        observer.onOrderIsOrdered(order);

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> orderIsNowDelivered(UUID id, UUID etag) {
        var order = orderRepository.setOrderToDelivered(id);

        observer.onOrderDelivered(order);

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> reopenOrder(UUID id, UUID etag) {
        var order = orderRepository.reopenOrder(id);

        observer.onOrderIsReopened(order);

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> revokeOrder(UUID id, UUID etag) {
        var order = orderRepository.revokeOrder(id);

        observer.onOrderIsRevoked(order);

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> archiveOrder(UUID id, UUID etag) {
        observer.onBeforeOrderArchive(id);

        return toResponse(orderRepository.archiveOrder(id));
    }

    private static ResponseEntity<Order> toResponse(Order order) {
        return ResponseEntity.ok()
                .header(HttpHeaders.ETAG, order.getVersion().toString())
                .body(order);
    }
}
