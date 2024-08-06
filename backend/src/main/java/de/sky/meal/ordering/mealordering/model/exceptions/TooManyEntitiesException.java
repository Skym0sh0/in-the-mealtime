package de.sky.meal.ordering.mealordering.model.exceptions;

public class TooManyEntitiesException extends MealtimeException {
    public TooManyEntitiesException(String whatEntities, int count, int maxCount) {
        super("Too many entities in %s".formatted(whatEntities), "There are %d of %s, but allowed are only %d".formatted(count, whatEntities, maxCount));
    }
}
