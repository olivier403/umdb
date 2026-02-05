# AGENTS.md

This file provides quick context and guidelines for AI agents working on this repo.

## Project info

- UMDB (Micro Movie Database): TMDB-inspired demo app for movie search and recommendations
- Frontend: React + Vite + Tailwind SPA in TypeScript (`frontend/`)
- Backend: Java Spring Boot API, JPA, Lombok (`backend/`)
- Database: Postgres + pgvector (via `docker-compose.yml`)
- Data import: TMDB API using Python (`scripts/`)
- Infrastructure: Ansible (`deploy/`)

## General guidelines

- Read the project and module `README.md` before working on a feature.
- When planning a feature, you can make suggestions or ask for feedback.
- But when implementing: make small, focused changes. Do not change unrelated code.
- Prefer simple, easy-to-read code over clever tricks.
- Keep responses brief and concrete. No filler, no restating what the user said.
- Organize the code in a way that makes it easy to understand, modify and test in isolation.
- Be consistent with the existing code style and practices.

## Security

- Although this is a demo, use production-grade care (security, correctness, safe defaults).
- Ensure endpoints have appropriate authentication and authorization.
- You run in a sandbox with limited network and file access. If a command is blocked, ask
  for permission to run it unsandboxed.

## Documentation

- Ensure documentation is in sync with the code after every change.
- Use inline comments for details that might be surprising or difficult to understand.
- Prefer fewer, high-level docs over quantity.
- No need to document a function when it's self-evident from its signature.
- Avoid large section header style comments. Prefer splitting files if necessary.

## Testing

- Ensure tests are in sync with the code after every change.
- Use testcontainers for backend integration tests.
- Avoid mocks unless absolutely necessary.
- You can assume the database, backend and frontend (with HMR) are already running.
- You can create temporary throwaway code or tests if needed.

## Java

- Use modern Java features if they improve readability.
- Consider if any libraries we're using (`pom.xml`) could simplify code.
- Use Lombok for boilerplate, builders.
- Assume we compile with `-parameters` and `jackson-module-parameter-names`.
- Try to avoid nullable attributes or parameters by design.
- Mark nullables with a `jakarta.annotation.Nullable` annotation.
- Prefer `Optional` for optional return values over `null`.
- Assume non-annotated values are not nullable.
- Use 4-space line continuation indents.
- Run `./mvnw test` to test relevant changes.

## Python

- Use modern Python features if they improve readability.
- Consider if any libraries we're using (`pyproject.toml`) could simplify code.
- Use type annotations.
- Do not use `"string"` type annotations for forward references, it's no longer necessary.
- Use `|` union type syntax over `Optional` and `Union`.
- Use `[T]` syntax for generics instead of `TypeVar` etc.
- Run `uv run ty check` to typecheck after major changes.
- Run `uv run ruff check` to check for formatting issues after major changes.
- Run `uv run ruff format` to auto-format.
- Run `uv run pytest` to test relevant changes.

## TypeScript

- I don't know what I'm doing.
- Do what you think is best.

## SQL

- Schema lives at `backend/src/main/resources/schema.sql`.
- Use lowercase for queries and ddl (`select x from ...`).
- Use null for missing values, never `0` or empty string `''`.
- Ensure the schema and entities are in sync after changes.

