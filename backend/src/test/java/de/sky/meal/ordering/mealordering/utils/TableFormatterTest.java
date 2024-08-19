package de.sky.meal.ordering.mealordering.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TableFormatterTest {
    @Nested
    class CompleteExample {
        private final TableFormatter formatter = new TableFormatter(" | ", "<null>",
                new TableFormatter.ColumnDefinition("col1", TableFormatter.Alignment.Left, 12),
                new TableFormatter.ColumnDefinition("col2", TableFormatter.Alignment.Right),
                new TableFormatter.ColumnDefinition("c3", TableFormatter.Alignment.Center),
                new TableFormatter.ColumnDefinition("Special Column 4", TableFormatter.Alignment.Left,0, 18)
        );

        @BeforeEach
        void setUp() {
            formatter.addRow("v01", "v11", "v21", "v31")
                    .addRow("value02", "value12", "value22", "value32")
                    .addRow("value  03", "value  13", "value    23", "xx value  xx  33 xx")
                    .addRow("value  04", null, null, null);
        }

        @Test
        void checkThatFormattingWorksLineByLine() {
            var result = formatter.format();

            assertThat(result)
                    .hasLineCount(5)
                    .contains(
                            "col1         |      col2 |     c3      | Special Column 4  ",
                            "v01          |       v11 |     v21     | v31               ",
                            "value02      |   value12 |   value22   | value32           ",
                            "value  03    | value  13 | value    23 | xx value  xx  3...",
                            "value  04    |    <null> |   <null>    | <null>            "
                    );
        }

        @Test
        void checkThatFormattingWorks() {
            var result = formatter.format();

            assertThat(result)
                    .hasLineCount(5)
                    .isEqualTo(
                            """
                                    col1         |      col2 |     c3      | Special Column 4 \s
                                    v01          |       v11 |     v21     | v31              \s
                                    value02      |   value12 |   value22   | value32          \s
                                    value  03    | value  13 | value    23 | xx value  xx  3...
                                    value  04    |    <null> |   <null>    | <null>           \s"""
                    );
        }
    }
}
