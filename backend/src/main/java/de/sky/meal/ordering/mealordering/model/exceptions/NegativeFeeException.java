package de.sky.meal.ordering.mealordering.model.exceptions;

public class NegativeFeeException extends MealtimeException {
    public NegativeFeeException(String message, int fee) {
        super("Negative fee is invalid", "%s. Fee was %.2f".formatted(message, fee / 100.0));
    }
}
