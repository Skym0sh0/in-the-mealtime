package de.sky.meal.ordering.mealordering.observers;

import de.sky.meal.ordering.mealordering.config.NotificationConfiguration;
import de.sky.meal.ordering.mealordering.service.RestaurantRepository;
import de.sky.meal.ordering.mealordering.service.RocketChatService;
import de.sky.meal.ordering.mealordering.utils.TableFormatter;
import generated.sky.meal.ordering.rest.model.Order;
import generated.sky.meal.ordering.rest.model.OrderPosition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Comparator;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService implements OnOrderChange {

    private final NotificationConfiguration config;

    private final RestaurantRepository restaurantRepository;

    private final RocketChatService chatService;

    @Override
    public void onNewOrder(Order order) {
        log.info("Notification: New order {}", order.getId());

        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        chatService.sendMessage("""
                Neue [Bestellung](%s) beim Restaurant %s aufgemacht.
                """.formatted(getUrl(order), restaurant.getName())
        );
    }

    @Override
    public void onLockOrder(Order order) {
        log.info("Notification: Lock order {}", order.getId());

        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        chatService.sendMessage("""
                [Bestellung](%s) beim Restaurant %s ist jetzt gesperrt, um die Bestellung aufzugeben. Keine neuen Bestellungen möglich.
                """.formatted(getUrl(order), restaurant.getName())
        );
    }

    @Override
    public void onOrderIsReopened(Order order) {
        log.info("Notification: Reopen order {}", order.getId());

        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        chatService.sendMessage("""
                [Bestellung](%s) beim Restaurant %s ist wieder entsperrt. Bestellungen wieder möglich.
                """.formatted(getUrl(order), restaurant.getName())
        );
    }

    @Override
    public void onOrderIsOrdered(Order order) {
        log.info("Notification: Order order {}", order.getId());

        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        var formatter = new TableFormatter(" | ", "",
                new TableFormatter.ColumnDefinition("Name", TableFormatter.Alignment.Right, 16),
                new TableFormatter.ColumnDefinition("Gericht", TableFormatter.Alignment.Left, 32),
                new TableFormatter.ColumnDefinition("Preis", TableFormatter.Alignment.Center, 7),
                new TableFormatter.ColumnDefinition("Bezahlt", TableFormatter.Alignment.Center)
        );

        order.getOrderPositions()
                .stream()
                .sorted(Comparator.comparing(OrderPosition::getMeal))
                .forEach(pos -> formatter.addRow(
                        pos.getName(),
                        pos.getMeal(),
                        "%.2f€".formatted(pos.getPrice()),
                        Optional.ofNullable(pos.getPaid()).orElse(0.0f) > 0 ? "Ja" : "Nein"
                ));

        var table = formatter.format();

        var sumPrice = sumPositions(order.getOrderPositions(), OrderPosition::getPrice);
        var sumPaid = sumPositions(order.getOrderPositions(), OrderPosition::getPaid);
        var sumTip = sumPositions(order.getOrderPositions(), OrderPosition::getTip);

        chatService.sendMessage("""
                [Bestellung](%s) beim Restaurant %s ist jetzt bestellt. Keine Bestellungen mehr möglich.
                Folgendes wurde bestellt:
                ```
                %s
                ```
                ```
                Gesamtsumme: %6.2f €
                Bezahlt:     %6.2f €
                Trinkgeld:   %6.2f €
                ```
                """.formatted(getUrl(order), restaurant.getName(), table, sumPrice, sumPaid, sumTip)
        );
    }


    @Override
    public void onOrderDelivered(Order order) {
        log.info("Notification: Deliver order {}", order.getId());

        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        chatService.sendMessage("""
                @here Essen von der %s [Bestellung](%s) ist da!
                """.formatted(restaurant.getName(), getUrl(order))
        );
    }

    @Override
    public void onOrderIsRevoked(Order order) {
        log.info("Notification: Revoke order {}", order.getId());

        var restaurant = restaurantRepository.readRestaurant(order.getRestaurantId());

        chatService.sendMessage("""
                [Bestellung](%s) beim Restaurant %s ist geschlossen worden. Vielleicht ist der Laden geschlossen oder es gibt andere Probleme...
                """.formatted(getUrl(order), restaurant.getName())
        );
    }

    private static double sumPositions(Collection<OrderPosition> positions, Function<OrderPosition, Float> ex) {
        return positions.stream()
                .map(ex)
                .filter(Objects::nonNull)
                .mapToDouble(Float::doubleValue)
                .sum();
    }

    private String getUrl(Order order) {
        return getBaseUrl() + "/order/" + order.getId();
    }

    private String getBaseUrl() {
        if (!config.webBaseUrl().endsWith("/"))
            return config.webBaseUrl();

        return config.webBaseUrl().substring(0, config.webBaseUrl().length() - 1);
    }
}
