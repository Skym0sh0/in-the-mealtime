package de.sky.meal.ordering.mealordering.model.exceptions;

public class OrderInfoIsNotCompleteException extends MealtimeException {
    public OrderInfoIsNotCompleteException(String whatIsMissing) {
        super("OrderInfo is incomplete", "OrderInfo is lacking info for '%s'".formatted(whatIsMissing));
    }
}
