package de.sky.meal.ordering.mealordering.model.exceptions;

public class NegativeFeeException extends MealtimeException {
    public NegativeFeeException(String message, float fee) {
        super("Negative fee is invalid", "%s. Fee was %f".formatted(message, fee));
    }
}
