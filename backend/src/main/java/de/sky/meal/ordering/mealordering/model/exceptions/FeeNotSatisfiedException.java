package de.sky.meal.ordering.mealordering.model.exceptions;

public class FeeNotSatisfiedException extends MealtimeException {
    public FeeNotSatisfiedException(String message, int paid, int required) {
        super("Fee could not be paid", "%s. Fee was %.2f but only %.2f was paid".formatted(message, required / 100.0, paid / 100.0));
    }
}
