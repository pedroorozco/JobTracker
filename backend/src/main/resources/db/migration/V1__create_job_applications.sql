CREATE TABLE job_applications
(
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    company    VARCHAR(255) NOT NULL,
    job_title  VARCHAR(255) NOT NULL,
    status     VARCHAR(20)  NOT NULL,
    applied_on DATE         NOT NULL,
    PRIMARY KEY (id)
);