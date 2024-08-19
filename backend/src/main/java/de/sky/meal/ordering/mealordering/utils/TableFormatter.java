package de.sky.meal.ordering.mealordering.utils;

import lombok.Getter;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

public class TableFormatter {
    private final String delimiter;
    private final String nullValue;
    private final List<ColumnInfo> columns;

    public TableFormatter(String delimiter, String nullValue, List<ColumnDefinition> columns) {
        this.delimiter = Objects.requireNonNull(delimiter);
        this.nullValue = Objects.requireNonNull(nullValue);
        this.columns = columns.stream().map(ColumnInfo::new).toList();
    }

    public TableFormatter(String delimiter, String nullValue, ColumnDefinition... cols) {
        this(delimiter, nullValue, List.of(cols));
    }

    public TableFormatter(String delimiter, String nullValue, String... cols) {
        this(delimiter,
                nullValue,
                Stream.of(cols)
                        .map(c -> new ColumnDefinition(c, Alignment.Left))
                        .toList()
        );
    }

    private final List<List<String>> rows = new ArrayList<>();

    public TableFormatter addRow(String... data) {
        if (data.length != columns.size())
            throw new IllegalArgumentException("Expected %d columns, but only got %d".formatted(columns.size(), data.length));

        var tmp = new ArrayList<String>(data.length);
        for (int i = 0; i < data.length; i++) {
            var cell = Optional.ofNullable(data[i]).orElse(nullValue);

            tmp.add(cell);
            columns.get(i).add(cell);
        }
        rows.add(tmp);

        return this;
    }

    public String format() {
        Function<List<String>, String> rowFormatter = row -> {
            return IntStream.range(0, row.size())
                    .mapToObj(i -> {
                        var info = columns.get(i);
                        var cell = row.get(i);

                        var frmt = switch (info.getDefinition().align()) {
                            case Left -> StringUtils.rightPad(cell, info.getWidth());
                            case Right -> StringUtils.leftPad(cell, info.getWidth());
                            case Center -> StringUtils.center(cell, info.getWidth());
                            default ->
                                    throw new AssertionError("Unsupported alignment " + info.getDefinition().align());
                        };

                        return StringUtils.abbreviate(frmt, info.getDefinition().maxWidth());
                    })
                    .collect(Collectors.joining(delimiter));
        };

        return Stream.<List<String>>concat(
                        Stream.of(columns.stream().map(ColumnInfo::getDefinition).map(ColumnDefinition::name).toList()),
                        rows.stream()
                )
                .map(rowFormatter)
                .collect(Collectors.joining("\n"));
    }

    public record ColumnDefinition(String name, Alignment align, int minWidth, int maxWidth) {

        public ColumnDefinition(String name, Alignment align, int minWidth) {
            this(name, align, minWidth, Integer.MAX_VALUE);
        }

        public ColumnDefinition(String name, Alignment align) {
            this(name, align, 0);
        }
    }

    @Getter
    public static class ColumnInfo {
        private final ColumnDefinition definition;
        private int count = 1;
        private int minLength = 0;
        private int maxLength = 0;

        public ColumnInfo(ColumnDefinition definition) {
            this.definition = Objects.requireNonNull(definition);
            minLength = definition.name().length();
            maxLength = definition.name().length();
        }

        public int getWidth() {
            return Math.min(Math.max(maxLength, definition.minWidth()), definition.maxWidth());
        }

        public void add(String str) {
            int length = str.length();

            count++;
            minLength = Math.min(minLength, length);
            maxLength = Math.max(maxLength, length);
        }
    }

    public enum Alignment {
        Left, Right, Center
    }
}
