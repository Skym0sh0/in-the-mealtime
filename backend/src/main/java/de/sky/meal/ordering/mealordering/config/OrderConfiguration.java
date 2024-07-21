package de.sky.meal.ordering.mealordering.config;

import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.config.orders")
public record OrderConfiguration(
        String housekeepingCronExpression,
        @Positive
        Duration closedOrderLingering,
        OrderStateTimeouts stateTimeouts
) {

    public record OrderStateTimeouts(
            @Positive Duration maxOpenTime,
            @Positive Duration maxUntouchedTime,

            @Positive Duration lockedBeforeReopened,
            @Positive Duration orderedBeforeDelivered,
            @Positive Duration revokedBeforeDeleted,
            @Positive Duration deliveryBeforeArchive
    ) {
    }
}
