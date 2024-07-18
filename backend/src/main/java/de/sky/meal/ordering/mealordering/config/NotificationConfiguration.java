package de.sky.meal.ordering.mealordering.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.config.notifications")
public record NotificationConfiguration(RocketChatConfig rocketChat, String webBaseUrl) {

    public record RocketChatConfig(boolean enabled, String baseUrl, String user, String password,
                                   String targetChannel) {

    }
}
