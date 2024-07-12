CREATE TABLE RESTAURANT
(
    ID                UUID PRIMARY KEY         NOT NULL,
    NAME              VARCHAR                  NOT NULL UNIQUE CHECK (NAME <> ''),

    VERSION           UUID                     NOT NULL,
    CREATED_AT        TIMESTAMP WITH TIME ZONE NOT NULL,
    CREATED_BY        UUID                     NOT NULL,
    UPDATED_AT        TIMESTAMP WITH TIME ZONE NOT NULL,
    UPDATED_BY        UUID                     NOT NULL,

    STYLE             VARCHAR,
    KIND              VARCHAR,

    PHONE             VARCHAR,
    WEBSITE           VARCHAR,
    EMAIL             VARCHAR,

    STREET            VARCHAR,
    HOUSENUMBER       VARCHAR,
    POSTAL            VARCHAR,
    CITY              VARCHAR,

    SHORT_DESCRIPTION VARCHAR,
    LONG_DESCRIPTION  VARCHAR
);

