package de.sky.meal.ordering.mealordering.endpoint;

import de.sky.meal.ordering.mealordering.observers.OrderChangeAggregator;
import de.sky.meal.ordering.mealordering.service.OrderRepository;
import generated.sky.meal.ordering.rest.api.OrderApi;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.rest.model.OrderCreationData;
import generated.sky.meal.ordering.rest.model.OrderInfosPatch;
import generated.sky.meal.ordering.rest.model.OrderPositionPatch;
import io.micrometer.core.instrument.MeterRegistry;
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

    private final MeterRegistry meterRegistry;

    @Override
    public ResponseEntity<List<UUID>> fetchOrderableRestaurants() {
        var ids = orderRepository.readOrderableRestaurantIds(LocalDate.now());

        meterRegistry.gauge("restaurant.orderable.count", ids.size());

        return ResponseEntity.ok(ids);
    }

    @Override
    public ResponseEntity<Order> createOrder(UUID restaurantId, OrderCreationData orderCreationData) {
        var order = orderRepository.createNewEmptyOrder(restaurantId, orderCreationData);

        observer.onNewOrder(order);

        meterRegistry.counter("order.create", "entity", "order").increment();

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> fetchOrder(UUID id) {
        return toResponse(orderRepository.readOrder(id));
    }

    @Override
    public ResponseEntity<List<Order>> fetchOrders() {
        var orders = orderRepository.readOrders();

        meterRegistry.gauge("order.count", orders.size());

        return ResponseEntity.ok(orders);
    }

    @Override
    public ResponseEntity<Order> setOrderInfo(UUID orderId, UUID etag, OrderInfosPatch orderInfos) {
        var order = orderRepository.updateOrderInfos(orderId, etag, orderInfos);

        observer.onOrderInfoUpdated(order);

        meterRegistry.counter("order.info.update", "entity", "order").increment();

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Void> deleteOrder(UUID id, UUID etag) {
        observer.onBeforeOrderDelete(id);

        orderRepository.deleteOrder(id, etag);

        meterRegistry.counter("order.delete", "entity", "order").increment();

        return ResponseEntity.ok()
                .build();
    }

    @Override
    public ResponseEntity<Order> createOrderPosition(UUID orderId, OrderPositionPatch orderPosition) {
        var order = orderRepository.addOrderPosition(orderId, orderPosition);

        observer.onOrderPositionCreated(order);

        meterRegistry.counter("order.position.add", "entity", "order").increment();

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> updateOrderPosition(UUID orderId, UUID orderPositionId, OrderPositionPatch orderPosition) {
        var order = orderRepository.updateOrderPosition(orderId, orderPositionId, orderPosition);

        observer.onOrderPositionUpdated(order);

        meterRegistry.counter("order.position.update", "entity", "order").increment();

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> deleteOrderPosition(UUID orderId, UUID orderPositionId) {
        var order = orderRepository.removeOrderPosition(orderId, orderPositionId);

        observer.onOrderPositionDeleted(order);

        meterRegistry.counter("order.position.delete", "entity", "order").increment();

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> lockOrder(UUID id, UUID etag) {
        var order = orderRepository.lockOrder(id, etag);

        meterRegistry.counter("order.state.lock", "entity", "order").increment();

        observer.onLockOrder(order);

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> orderIsNowOrdered(UUID id, UUID etag) {
        var order = orderRepository.setOrderToIsOrdered(id, etag);

        meterRegistry.counter("order.state.ordered", "entity", "order").increment();

        observer.onOrderIsOrdered(order);

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> orderIsNowDelivered(UUID id, UUID etag) {
        var order = orderRepository.setOrderToDelivered(id, etag);

        meterRegistry.counter("order.state.delivered", "entity", "order").increment();

        observer.onOrderDelivered(order);

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> reopenOrder(UUID id, UUID etag) {
        var order = orderRepository.reopenOrder(id, etag);

        meterRegistry.counter("order.state.reopen", "entity", "order").increment();

        observer.onOrderIsReopened(order);

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> revokeOrder(UUID id, UUID etag) {
        var order = orderRepository.revokeOrder(id, etag);

        meterRegistry.counter("order.state.revoke", "entity", "order").increment();

        observer.onOrderIsRevoked(order);

        return toResponse(order);
    }

    @Override
    public ResponseEntity<Order> archiveOrder(UUID id, UUID etag) {
        observer.onBeforeOrderArchive(id);

        var order = orderRepository.archiveOrder(id, etag);

        meterRegistry.counter("order.state.archived", "entity", "order").increment();

        return toResponse(order);
    }

    private static ResponseEntity<Order> toResponse(Order order) {
        return ResponseEntity.ok()
                .header(HttpHeaders.ETAG, order.getVersion().toString())
                .body(order);
    }
}
