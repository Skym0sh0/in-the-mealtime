CREATE TABLE RESTAURANT
(
    ID                UUID PRIMARY KEY         NOT NULL,
    NAME              TEXT                     NOT NULL UNIQUE CHECK (NAME <> ''),

    VERSION           UUID                     NOT NULL,
    CREATED_AT        TIMESTAMP WITH TIME ZONE NOT NULL,
    CREATED_BY        UUID                     NOT NULL,
    UPDATED_AT        TIMESTAMP WITH TIME ZONE NOT NULL,
    UPDATED_BY        UUID                     NOT NULL,

    STYLE             TEXT,
    KIND              TEXT,

    PHONE             TEXT,
    WEBSITE           TEXT,
    EMAIL             TEXT,

    STREET            TEXT,
    HOUSENUMBER       TEXT,
    POSTAL            TEXT,
    CITY              TEXT,

    SHORT_DESCRIPTION TEXT,
    LONG_DESCRIPTION  TEXT
);

