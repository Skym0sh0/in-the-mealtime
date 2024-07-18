package de.sky.meal.ordering.mealordering.service;

import de.sky.meal.ordering.mealordering.config.NotificationConfiguration;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.rest.model.OrderPosition;
import generated.sky.meal.ordering.rest.model.Restaurant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationConfiguration config;

    private final RestaurantRepository restaurantRepository;

    private final RocketChatService chatService;

    private String getUrl(Order order) {
        var baseUrl = !config.webBaseUrl().endsWith("/")
                ? config.webBaseUrl()
                : config.webBaseUrl().substring(0, config.webBaseUrl().length() - 1);

        return baseUrl + "/order/" + order.getId();
    }

    private String getUrl(Restaurant restaurant) {
        var baseUrl = !config.webBaseUrl().endsWith("/")
                ? config.webBaseUrl()
                : config.webBaseUrl().substring(0, config.webBaseUrl().length() - 1);
        return baseUrl + "/restaurant/" + restaurant.getId();
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

        var table = order.getOrderPositions()
                .stream()
                .sorted(Comparator.comparing(OrderPosition::getMeal))
                .map(p -> "%16s | %-32s | %6.2f€ | %4s".formatted(
                        p.getName(),
                        p.getMeal(),
                        p.getPrice(),
                        Optional.ofNullable(p.getPaid()).orElse(0.0f) > 0 ? "Ja" : "Nein"
                ))
                .collect(Collectors.joining(
                        "\n",
                        "%16s | %32s | %7s | %4s\n".formatted("Name", "Gericht", "Preis", "Bezahlt"),
                        "\n"
                ));

        var sumPrice = order.getOrderPositions()
                .stream()
                .map(OrderPosition::getPrice)
                .filter(Objects::nonNull)
                .mapToDouble(Float::doubleValue)
                .sum();
        var sumPaid = order.getOrderPositions()
                .stream()
                .map(OrderPosition::getPaid)
                .filter(Objects::nonNull)
                .mapToDouble(Float::doubleValue)
                .sum();
        var sumTip = order.getOrderPositions()
                .stream()
                .map(OrderPosition::getTip)
                .filter(Objects::nonNull)
                .mapToDouble(Float::doubleValue)
                .sum();

        chatService.sendMessage("""
                [Bestellung](%s) beim Restaurant [%s](%s) ist jetzt bestellt. Keine Bestellungen mehr möglich.
                Folgendes wurde bestellt:
                ```
                %s
                ```
                ```
                Gesamtsumme: %6.2f €
                Bezahlt:     %6.2f €
                Trinkgeld:   %6.2f €
                ```
                """.formatted(getUrl(order), restaurant.getName(), getUrl(restaurant), table, sumPrice, sumPaid, sumTip)
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
