package de.sky.meal.ordering.mealordering.model.exceptions;

public class FeeNotSatisfiedException extends MealtimeException {
    public FeeNotSatisfiedException(String message, long paid, long required) {
        super("Fee could not be paid", "%s. Fee was %d.%d but only %d.%d was paid".formatted(message, required / 100, required % 100, paid / 100, paid % 100));
    }
}
