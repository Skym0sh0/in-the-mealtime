package de.sky.meal.ordering.mealordering.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app.config")
public record AppConfig(boolean devModeEnabled, TechnicalConfig technicalConfig) {
    public record TechnicalConfig(List<String> allowedOrigins) {
    }
}
