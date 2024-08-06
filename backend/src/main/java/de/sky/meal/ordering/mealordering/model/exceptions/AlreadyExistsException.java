package de.sky.meal.ordering.mealordering.model.exceptions;

public class AlreadyExistsException extends MealtimeException {
    public AlreadyExistsException(String entity, String message) {
        super("Entity %s already exists".formatted(entity), "%s: %s".formatted(entity, message));
    }
}
