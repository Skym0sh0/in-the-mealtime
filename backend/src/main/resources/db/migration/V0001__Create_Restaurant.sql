CREATE TABLE RESTAURANT
(
    ID                UUID PRIMARY KEY         NOT NULL,
    NAME              VARCHAR                  NOT NULL UNIQUE,

    VERSION           UUID                     NOT NULL,
    CREATED_AT        TIMESTAMP WITH TIME ZONE NOT NULL,
    CREATED_BY        VARCHAR,
    UPDATED_AT        TIMESTAMP WITH TIME ZONE NOT NULL,
    UPDATED_BY        VARCHAR,

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

