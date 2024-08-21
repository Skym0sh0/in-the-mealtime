package de.sky.meal.ordering.mealordering.observers;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class JsonMessageBroadcaster {

    private final MessageBroadcaster broadcaster;
    private final ObjectMapper mapper;

    public <T> void send(T message) {
        Objects.requireNonNull(message);

        try {
            broadcaster.sendMessage(mapper.writeValueAsString(message));
        } catch (Exception e) {
            log.error("Could not send JSON message with object: {}", message, e);
        }
    }
}
