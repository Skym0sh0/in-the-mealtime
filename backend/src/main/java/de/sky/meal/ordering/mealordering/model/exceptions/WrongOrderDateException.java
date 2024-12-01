package de.sky.meal.ordering.mealordering.model.exceptions;

import java.time.LocalDate;

public class WrongOrderDateException extends MealtimeException{
    public WrongOrderDateException(LocalDate date) {
        super("TargetDate for Order is invalid", "TargetDate for Order is either null or in the past: %s".formatted(date));
    }
}
