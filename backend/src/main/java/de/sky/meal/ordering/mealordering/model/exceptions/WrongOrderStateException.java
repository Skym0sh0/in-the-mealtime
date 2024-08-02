package de.sky.meal.ordering.mealordering.model.exceptions;

import generated.sky.meal.ordering.schema.enums.OrderState;

import java.util.Collection;
import java.util.UUID;

public class WrongOrderStateException extends MealtimeException {
    public WrongOrderStateException(String message) {
        super(message, message);
    }

    public WrongOrderStateException(UUID orderId, OrderState state, Collection<OrderState> requiredStates) {
        super("Order %s is in wrong state %s".formatted(orderId, state), "Order %s is in state %s but required are states %s".formatted(orderId, state, requiredStates));
    }
}
