package de.sky.meal.ordering.mealordering.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.config.orders")
public record OrderConfiguration(
        Duration closedOrderLingering
) {

}
