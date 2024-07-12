CREATE TABLE MENU_PAGE
(
    ID                    UUID PRIMARY KEY         NOT NULL,
    NAME                  TEXT                     NOT NULL CHECK (NAME <> ''),
    RESTAURANT_ID         UUID                     NOT NULL REFERENCES RESTAURANT (ID),

    CREATED_AT            TIMESTAMP WITH TIME ZONE NOT NULL,
    CREATED_BY            UUID                     NOT NULL,

    IMAGE_DATA_MEDIA_TYPE TEXT                     NOT NULL CHECK (MENU_PAGE.IMAGE_DATA_MEDIA_TYPE <> ''),
    IMAGE_DATA            BYTEA                    NOT NULL
);

CREATE INDEX IDX_MENU_PAGE_RESTAURANT_ID ON MENU_PAGE (RESTAURANT_ID);
