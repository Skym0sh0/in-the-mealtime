package de.sky.meal.ordering.mealordering.model.exceptions;

public class FeeNotSatisfiedException extends MealtimeException {
    public FeeNotSatisfiedException(String message, float paid, float required) {
        super("Fee could not be paid", "%s. Fee was %f but only %f was paid".formatted(message, required, paid));
    }
}
