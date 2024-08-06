package de.sky.meal.ordering.mealordering.model.exceptions;

import java.util.UUID;

public class RecordNotFoundException extends MealtimeException {
    public RecordNotFoundException(String entity, UUID id) {
        super("%s not found".formatted(entity), "Entity %s with id %s not found".formatted(entity, id));
    }

    public RecordNotFoundException(String parentEntity, UUID parentId, String entity, UUID id) {
        super("%s not found in %s".formatted(entity, parentEntity), "Entity %s with id %s not found in parent Entity %s with parenId %s".formatted(entity, id, parentEntity, parentId));
    }
}
