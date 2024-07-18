package de.sky.meal.ordering.mealordering.service;

import generated.sky.meal.ordering.rest.model.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final RocketChatService chatService;

    public void onNewOrder(Order order) {
        chatService.sendMessage(
                """
                        Neue Bestellung %s beim Restaurant %s aufgemacht.
                        """.formatted(order.getId(), order.getRestaurantId())
        );
    }

    public void onLockOrder(Order order) {
        chatService.sendMessage(
                """
                        Bestellung %s beim Restaurant %s ist jetzt gesperrt. Keine neuen Bestellungen möglich.
                        """.formatted(order.getId(), order.getRestaurantId())
        );
    }

    public void onOrderIsReopened(Order order) {
        chatService.sendMessage(
                """
                        Bestellung %s beim Restaurant %s ist wieder entsperrt. Weitere Bestellungen möglich.
                        """.formatted(order.getId(), order.getRestaurantId())
        );
    }

    public void onOrderIsOrdered(Order order) {
        chatService.sendMessage(
                """
                        Bestellung %s beim Restaurant %s ist jetzt bestellt. Keine neuen Bestellungen möglich.
                        """.formatted(order.getId(), order.getRestaurantId())
        );
    }

    public void onOrderDelivered(Order order) {
        chatService.sendMessage(
                """
                        @all Essen ist da!
                        """
        );
    }

    public void onOrderIsRevoked(Order order) {
        chatService.sendMessage(
                """
                        Bestellung %s beim Restaurant %s ist geschlossen worden.
                        """.formatted(order.getId(), order.getRestaurantId())
        );
    }

    public void onOrderIsArchived(Order order) {
        chatService.sendMessage(
                """
                        Bestellung %s beim Restaurant %s ist archiviert worden.
                        """.formatted(order.getId(), order.getRestaurantId())
        );
    }
}
