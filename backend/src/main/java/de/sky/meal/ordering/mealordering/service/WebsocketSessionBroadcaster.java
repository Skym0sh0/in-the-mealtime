package de.sky.meal.ordering.mealordering.service;

import de.sky.meal.ordering.mealordering.observers.MessageBroadcaster;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class WebsocketSessionBroadcaster extends AbstractWebSocketHandler implements MessageBroadcaster {

    private static final int MAX_NUMBER_OF_SESSIONS = 100;

    private final Map<String, ConcurrentWebSocketSessionDecorator> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        cleanup();

        if (sessions.size() >= MAX_NUMBER_OF_SESSIONS) {
            log.warn("Denying new websocket connection due to overload");
            session.close(CloseStatus.SERVICE_OVERLOAD);
            return;
        }

        var tmp = new ConcurrentWebSocketSessionDecorator(session, 1000, 1 << 16);
        sessions.put(tmp.getId(), tmp);

        log.info("New Websocket session added ...");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        log.info("Removing disconnecting websocket session ...");

        var removed = sessions.remove(session.getId());

        if (removed != null)
            removed.close();

        cleanup();
    }

    private void cleanup() {
        int oldSize = sessions.size();
        sessions.entrySet().removeIf(e -> !e.getValue().isOpen());
        int newSize = sessions.size();

        log.debug("Cleaned up {} websocket sessions", oldSize - newSize);
    }

    @Override
    public void sendMessage(String message) {
        var msg = new TextMessage(message);

        sessions.forEach((_, session) -> {
            try {
                session.sendMessage(msg);
            } catch (Exception e) {
                log.error("Failed to send message to websocket", e);
            }
        });
    }
}
