package de.sky.meal.ordering.mealordering.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.config")
public record AppConfig(boolean devModeEnabled) {
}
