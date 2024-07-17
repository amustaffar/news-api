# Northcoders News API

Author: Ahmad Mustaffar

## Link to the hosted version:

https://news-api-xu59.onrender.com

## Project summary:

Back end - building an API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as Reddit) which should provide this information to the front end architecture. The database is PostgreSQL, interacted with node-postgres.

## Instructions:

- To clone the project in this repo and run it locally:
  You will need to create two .env files for your project: .env.test and .env.development. Into each, add PGDATABASE=, with the correct database name for that environment (see /db/setup.sql for the database names). Double check that these .env files are .gitignored. As an example: in the .env-file_name_here file, write PGDATABASE=database_name_here (an example file of .env-example is included in the repo).
- Install dependencies:
  After the previous is complete, run "npm install" to install the required dependencies.
- Database setup:
  You have also been provided with a db folder with some data, a setup.sql file and a seeds folder.

## Minimum requirements:

- Node.js version: v18.20.2
- psql (PostgreSQL) 14.12

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
