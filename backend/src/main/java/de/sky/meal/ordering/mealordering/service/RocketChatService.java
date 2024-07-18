package de.sky.meal.ordering.mealordering.service;

import de.sky.meal.ordering.mealordering.config.NotificationConfiguration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
@RequiredArgsConstructor
public class RocketChatService {

    private final NotificationConfiguration config;

    public void sendMessage(String message) {
        var conf = config.rocketChat();

        if (!conf.enabled())
            return;

        try {
            var client = RestClient.builder()
                    .baseUrl(conf.baseUrl())
                    .build();

            var tokenResponse = client.post()
                    .uri("/api/v1/login")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(new UserCredentials(conf.user(), conf.password()))
                    .retrieve()
                    .body(RocketChatTokenResponse.class);

            if (tokenResponse == null || !"success".equalsIgnoreCase(tokenResponse.status()) || tokenResponse.data() == null) {
                log.error("Failed to login to rocket chat: {}", tokenResponse);
                return;
            }

            var response = client.post()
                    .uri("api/v1/chat.postMessage")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("X-Auth-Token", tokenResponse.data().authToken())
                    .header("X-User-Id", tokenResponse.data().userId())
                    .body(new RocketChatMessage(conf.targetChannel(), message))
                    .retrieve();

            log.info("RocketCHat message successfully sent: {}", response.toEntity(String.class));
        } catch (Exception e) {
            log.error("Message to RocketChat could not be sent", e);
        }
    }

    private record UserCredentials(String user, String password) {

    }

    private record RocketChatMessage(String channel, String text) {

    }

    private record RocketChatTokenResponse(String status, RocketChatTokenDataResponse data) {

    }

    private record RocketChatTokenDataResponse(String userId, String authToken) {

    }
}
