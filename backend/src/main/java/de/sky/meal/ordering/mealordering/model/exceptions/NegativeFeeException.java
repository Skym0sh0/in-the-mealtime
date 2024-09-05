package de.sky.meal.ordering.mealordering.model.exceptions;

public class NegativeFeeException extends MealtimeException {
    public NegativeFeeException(String message, long fee) {
        super("Negative fee is invalid", "%s. Fee was %d.%d".formatted(message, fee / 100, fee%100));
    }
}
