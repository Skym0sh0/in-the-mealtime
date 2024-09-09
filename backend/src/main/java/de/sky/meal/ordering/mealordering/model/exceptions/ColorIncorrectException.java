package de.sky.meal.ordering.mealordering.model.exceptions;

public class ColorIncorrectException extends MealtimeException {
    public ColorIncorrectException(String message, String color) {
        super(message, "Color does not fit into format like '#aa00ff': %s".formatted(color));
    }
}
