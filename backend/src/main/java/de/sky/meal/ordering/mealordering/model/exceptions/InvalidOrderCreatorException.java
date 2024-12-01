package de.sky.meal.ordering.mealordering.model.exceptions;

public class InvalidOrderCreatorException extends MealtimeException {
    public InvalidOrderCreatorException(String creator) {
        super("Invalid creator for new Order", "Order Creator must not be null, empty or blank: '%s'".formatted(creator));
    }
}
