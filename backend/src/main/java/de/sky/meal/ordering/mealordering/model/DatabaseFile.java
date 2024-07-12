package de.sky.meal.ordering.mealordering.model;

import io.micrometer.common.util.StringUtils;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;

import java.util.Objects;

public record DatabaseFile(String name, MediaType contentType, byte[] data) {
    public DatabaseFile {
        Assert.isTrue(StringUtils.isNotBlank(name), "Name must not be blank");
        Objects.requireNonNull(contentType);
        Objects.requireNonNull(data);
    }

    public DatabaseFile(String name, String contentType, byte[] data) {
        this(name, MediaType.parseMediaType(contentType), data);
    }
}
