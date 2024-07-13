package de.sky.meal.ordering.mealordering.endpoint;

import de.sky.meal.ordering.mealordering.service.OrderRepository;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.rest.model.OrderInfos;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class OrderController implements generated.sky.meal.ordering.rest.api.OrderApi {
    private final OrderRepository orderRepository;

    @Override
    public ResponseEntity<Order> createOrder(UUID restaurantId) {
        return ResponseEntity.ok(orderRepository.createNewEmptyOrder(restaurantId));
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
    public ResponseEntity<Order> setOrderInfo(UUID orderId, OrderInfos orderInfos) {
        return ResponseEntity.ok(orderRepository.updateOrderInfos(orderId, orderInfos));
    }

    @Override
    public ResponseEntity<Void> deleteOrder(UUID id) {
        orderRepository.deleteOrder(id);

        return ResponseEntity.ok()
                .build();
    }

    @Override
    public ResponseEntity<Order> createOrderPosition(UUID orderId, generated.sky.meal.ordering.rest.model.OrderPosition orderPosition) {
        return ResponseEntity.ok(orderRepository.addOrderPosition(orderId, orderPosition));
    }

    @Override
    public ResponseEntity<Order> updateOrderPosition(UUID orderId, UUID orderPositionId, generated.sky.meal.ordering.rest.model.OrderPosition orderPosition) {
        return ResponseEntity.ok(orderRepository.updateOrderPosition(orderId, orderPositionId, orderPosition));
    }

    @Override
    public ResponseEntity<Order> deleteOrderPosition(UUID orderId, UUID orderPositionId) {
        return ResponseEntity.ok(orderRepository.removeOrderPosition(orderId, orderPositionId));
    }

    @Override
    public ResponseEntity<Order> lockOrder(UUID id) {
        return ResponseEntity.ok(orderRepository.lockOrder(id));
    }

    @Override
    public ResponseEntity<Order> orderIsNowDelivered(UUID id) {
        return ResponseEntity.ok(orderRepository.setOrderToDelivered(id));
    }

    @Override
    public ResponseEntity<Order> orderIsNowOrdered(UUID id) {
        return ResponseEntity.ok(orderRepository.setOrderToIsOrdered(id));
    }

    @Override
    public ResponseEntity<Order> reopenOrder(UUID id) {
        return ResponseEntity.ok(orderRepository.reopenOrder(id));
    }

    @Override
    public ResponseEntity<Order> revokeOrder(UUID id) {
        return ResponseEntity.ok(orderRepository.revokeOrder(id));
    }

    @Override
    public ResponseEntity<Order> archiveOrder(UUID id) {
        return ResponseEntity.ok(orderRepository.archiveOrder(id));
    }
}
