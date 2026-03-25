# API Design Assignment

## Project Name

Metacritic Game API

## Objective

This API serves the Metacritic Games Dataset with over 13,000 data points. It provides three main resources: games, genres, and platforms (the latter two are read-only). Users can filter by title, minimum metascore, and use pagination (limit/offset). Create, update, and delete operations require user authentication via JWT. 

## Implementation Type

GraphQL

## Links and Testing

| | URL / File |
|---|---|
| **Production API** | [Metacritic Game API](https://metacritic-game-api-production.up.railway.app/graphql) |
| **API Documentation** | [Postman Documentation](https://documenter.getpostman.com/view/40513152/2sBXikmqfg) |
| **GraphQL Playground** (GraphQL only) | [Metacritic Game API](https://metacritic-game-api-production.up.railway.app/graphql) |
| **Postman Collection** | [Postman Collection](https://github.com/ToveEk/metacritic-game-api/blob/main/postman/metacritic_game_api.postman_collection.json) |
| **Production Environment** | [Production Environment](https://github.com/ToveEk/metacritic-game-api/blob/main/postman/production.postman_environment.json)|

**Examiner can verify tests in one of the following ways:**

1. **CI/CD pipeline** — check the pipeline output for test results.
2. **Run manually** — no setup needed:
   ```
   npx newman run postman/metacritic_game_api.postman_collection.json -e postman/production.postman_environment.json
   ```

## Getting Started

1. Clone the repository
2. `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=3700
   BASE_URL=http://localhost:3700/graphql
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   METACRITIC_CSV_PATH=./data/metacritic_games.csv
   JWT_PRIVATE_KEY=your_base64_encoded_private_key
   JWT_PUBLIC_KEY=your_base64_encoded_public_key
   JWT_EXPIRES_IN=7d
   ```
   Note: Never commit `.env` to version control. Add it to `.gitignore`.
4. `npm run seed` to populate database
5. `npm start` to run the server

## Dataset

| Field | Description |
|---|---|
| **Dataset source** | [Metacritic Games Data](https://www.kaggle.com/datasets/mohamedasak/metacritic-games-dataset/data) |
| **Primary resource (CRUD)** | Games (id, title, description, developer, publisher, release_date, metascore, userscore) |
| **Secondary resource 1 (read-only)** | Genres (id, name) |
| **Secondary resource 2 (read-only)** | Platforms (id, name) |

## Design Decisions

### Authentication

Implemented JWT authentication with environment variables and base64 encoding for security. This approach evolved from a previous project that relied on file paths, which was a solution that proved problematic during deployment and lacked robustness.

### API Design

Schema organized into separate resolvers and type definitions, where resolvers handle business logic and type definitions define data structures. Queries fetch data while mutations handle CRUD operations. The single-endpoint GraphQL design simplified development by eliminating route management complexity.

### Error Handling

Errors are handled consistently by throwing GraphQLErrors, which provides a unified error format across the API.

Example:
```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
``` 

## Core Technologies Used

**Backend & API**
- **Node.js** — JavaScript runtime environment
- **Express.js** — HTTP server framework
- **Apollo Server** — GraphQL server with Express integration
- **GraphQL** — Query language and type system for API design

**Database**
- **MySQL** — Relational database for game, genre, and platform data

**Security & Authentication**
- **JWT** — JSON Web Token authentication
- **bcrypt** — Password hashing and encryption

**Utilities**
- **CORS** — Cross-origin resource sharing for API access
- **dotenv** — Environment variable configuration
- **CSV-parser** — Data parsing for database seeding

## Reflection

**Key learnings:** GraphQL was entirely new. This project provided valuable hands-on experience alongside continued work with MySQL. Deployment to Railway worked well overall, though the JWT authentication approach (initially file-based) required refactoring to use environment variables for the production environment.

**Future improvements:** Refactor code following clean code principles (separation of concerns, DRY) and introduce service layers to better organize business logic separately from resolver logic.

## Acknowledgements
- [Metacritic Games Data](https://www.kaggle.com/datasets/mohamedasak/metacritic-games-dataset/data) by Mohamed Adel
- Claude Sonnet 4.6
- W3Schools
- GraphQL Documentation
- Railway Documentation

## Requirements

### Functional Requirements — Common

| Requirement | Issue | Status |
|---|---|---|
| Data acquisition — choose and document a dataset (1000+ data points) | [#1](../../issues/1) | :white_check_mark: |
| Full CRUD for primary resource, read-only for secondary resources | [#2](../../issues/2) | :white_check_mark: |
| JWT authentication for write operations | [#3](../../issues/3) | :white_check_mark: |
| Error handling (400, 401, 404 with consistent format) | [#4](../../issues/4) | :white_check_mark: |
| Filtering and pagination for large result sets | [#17](../../issues/17) | :white_check_mark: |

### Functional Requirements — GraphQL

| Requirement | Issue | Status |
|---|---|---|
| Queries and mutations via single `/graphql` endpoint | [#14](../../issues/14) | :white_check_mark: |
| At least one nested query | [#15](../../issues/15) | :white_check_mark: |
| GraphQL Playground available | [#16](../../issues/16) | :white_check_mark: |

### Non-Functional Requirements

| Requirement | Issue | Status |
|---|---|---|
| API documentation (Swagger/OpenAPI or Postman) | [#6](../../issues/6) | :white_check_mark: |
| Automated Postman tests (20+ test cases, success + failure) | [#7](../../issues/7) | :white_check_mark: |
| CI/CD pipeline running tests on every commit/MR | [#8](../../issues/8) | :white_check_mark: |
| Seed script for sample data | [#5](../../issues/5) | :white_check_mark: |
| Code quality (consistent standard, modular, documented) | [#10](../../issues/10) | :white_check_mark: |
| Deployed and publicly accessible | [#9](../../issues/9) | :white_check_mark: |
| Peer review reflection submitted on merge request | [#11](../../issues/11) | :white_large_square: |
