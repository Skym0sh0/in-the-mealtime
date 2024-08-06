package de.sky.meal.ordering.mealordering.model.exceptions;

import java.util.UUID;

public class ConcurrentUpdateException extends MealtimeException {
    public ConcurrentUpdateException(String entity, UUID version) {
        super("%s was concurrently updated".formatted(entity), "Entity %s was concurrently updated and is not in version %s anymore".formatted(entity, version));
    }
}
