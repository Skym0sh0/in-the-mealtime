package de.sky.meal.ordering.mealordering.model.exceptions;

public class WrongMealCountException extends MealtimeException {
    public WrongMealCountException(String message, int allowedMeals) {
        super("Count of meals is invalid", "%s. Allowed meals are %d".formatted(message, allowedMeals));
    }
}
