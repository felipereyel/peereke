CREATE TABLE users (
    username varchar unique,
    connection_id uuid,
    password VARCHAR NOT NULL,
    PRIMARY KEY (username)
);
