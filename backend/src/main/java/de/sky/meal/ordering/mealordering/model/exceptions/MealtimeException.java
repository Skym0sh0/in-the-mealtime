package de.sky.meal.ordering.mealordering.model.exceptions;

import lombok.Getter;

@Getter
public class MealtimeException extends RuntimeException {
    private final String detailMessage;

    public MealtimeException(String message, String detailMessage) {
        super(message);
        this.detailMessage = detailMessage;
    }

    public MealtimeException(String message) {
        this(message, message);
    }
}
