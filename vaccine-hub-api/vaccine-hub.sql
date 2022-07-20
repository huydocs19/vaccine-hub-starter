\echo 'Delete and recreate vaccine_hub db?'
\prompt 'Return for yes or control-C to cancel > ' answer

DROP DATABASE IF EXISTS vaccine_hub;
CREATE DATABASE vaccine_hub;
\connect vaccine_hub;

\i vaccine-hub-schema.sql