WITH numbered_restaurants AS (SELECT id,
                                     name,
                                     row_number() OVER (PARTITION BY lower(name) ORDER BY id) AS row_num
                              FROM restaurant)
UPDATE restaurant r
SET name = CASE WHEN n.row_num = 1 THEN r.name ELSE r.name || ' (' || n.row_num || ')' END
FROM numbered_restaurants n
WHERE r.id = n.id;

-- DROP INDEX restaurant_name_key;

ALTER TABLE restaurant
    DROP CONSTRAINT restaurant_name_key;

CREATE UNIQUE INDEX uq_restaurant_name ON restaurant (lower(name));
