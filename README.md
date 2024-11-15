## Description

This project attempts to provide a solution to the technical test for LeoVegas

## Project setup

Create .env file in root of project with the following data:

```bash
DB_HOST=MYSQL_HOST
DB_PORT=MYSQL_PORT
DB_USERNAME=MYSQL_USER
DB_PASSWORD=MYSQL_PASSWORD
DB_DATABASE=leovegas
JWT_SECRET=JWT_SECRET
```

Install dependencies

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test the API

Call every endpoint of this API with the next prefix:

```bash
http://localhost:3000/api/
```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```
