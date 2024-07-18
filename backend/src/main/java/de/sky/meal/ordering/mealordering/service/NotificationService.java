package de.sky.meal.ordering.mealordering.service;

import de.sky.meal.ordering.mealordering.config.NotificationConfiguration;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.rest.model.Restaurant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationConfiguration config;

    private final RestaurantRepository restaurantRepository;

    private final RocketChatService chatService;

    private String getUrl(Order order) {
        return config.webBaseUrl() + "/order/" + order.getId();
    }

    private String getUrl(Restaurant restaurant) {
        return config.webBaseUrl() + "/restaurant/" + restaurant.getId();
    }

    public void onNewOrder(Order order) {
        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        chatService.sendMessage("""
                Neue [Bestellung](%s) beim Restaurant [%s](%s) aufgemacht.
                """.formatted(getUrl(order), restaurant.getName(), getUrl(restaurant))
        );
    }

    public void onLockOrder(Order order) {
        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        chatService.sendMessage("""
                [Bestellung](%s) beim Restaurant [%s](%s) ist jetzt gesperrt, um die Bestellung aufzugeben. Keine neuen Bestellungen möglich.
                """.formatted(getUrl(order), restaurant.getName(), getUrl(restaurant))
        );
    }

    public void onOrderIsReopened(Order order) {
        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        chatService.sendMessage("""
                [Bestellung](%s) beim Restaurant [%s](%s) ist wieder entsperrt. Bestellungen wieder möglich.
                """.formatted(getUrl(order), restaurant.getName(), getUrl(restaurant))
        );
    }

    public void onOrderIsOrdered(Order order) {
        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        chatService.sendMessage("""
                [Bestellung](%s) beim Restaurant [%s](%s) ist jetzt bestellt. Keine Bestellungen mehr möglich.
                """.formatted(getUrl(order), restaurant.getName(), getUrl(restaurant))
        );
    }

    public void onOrderDelivered(Order order) {
        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        chatService.sendMessage("""
                @all Essen von der [%s](%s) [Bestellung](%s) ist da!
                """.formatted(restaurant.getName(), getUrl(restaurant), getUrl(order))
        );
    }

    public void onOrderIsRevoked(Order order) {
        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        chatService.sendMessage("""
                [Bestellung](%s) beim Restaurant [%s](%s) ist geschlossen worden. Vielleicht ist der Laden geschlossen oder es gibt andere Probleme...
                """.formatted(restaurant.getName(), getUrl(restaurant), getUrl(order))
        );
    }
}
