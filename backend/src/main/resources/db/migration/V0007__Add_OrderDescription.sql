ALTER TABLE MEAL_ORDER
    ADD COLUMN MAXIMUM_COUNT_MEALS INTEGER CHECK ( MAXIMUM_COUNT_MEALS IS NULL OR MAXIMUM_COUNT_MEALS > 0 ),
    ADD COLUMN ORDER_TEXT          TEXT;
