package de.sky.meal.ordering.mealordering.model.exceptions;

public class FileTooBigException extends MealtimeException {
    public FileTooBigException(String whatThing, long size, long maxSize) {
        super("Filesize too big", "Only %d bytes allowed, but %s was %d".formatted(maxSize, whatThing, size));
    }
}
