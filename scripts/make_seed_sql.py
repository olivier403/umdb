#!/usr/bin/env python3
"""
Generate a self-contained data.sql seed file from CSVs produced by tmdb_convert.py.

Reads titles.csv, genres.csv, people.csv, title_genres.csv, and cast_members.csv,
filters the top N most popular movies/TV shows, and writes a Postgres-compatible
data.sql file to seed our application.

The generated SQL uses ON CONFLICT DO NOTHING for idempotent inserts,
compatible with Spring Boot's ;-based script splitting.

Example:
    python3 scripts/make_seed_sql.py --input-dir data
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import polars as pl
from polars import col


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Generate seed data.sql from CSVs")
    p.add_argument("--input-dir", type=Path, default=Path("data"))
    p.add_argument(
        "--output",
        type=Path,
        default=Path("backend/src/main/resources/data.sql"),
    )
    p.add_argument("--movie-limit", type=int, default=100)
    p.add_argument("--tv-limit", type=int, default=50)
    return p.parse_args()


def sql_value(val: object) -> str:
    """Format a single Python value as a SQL literal."""
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    s = str(val)
    # Embedding vectors: keep as-is and cast
    if s.startswith("[") and s.endswith("]"):
        return f"'{s}'::vector"
    return "'" + s.replace("'", "''") + "'"


def insert_statement(table: str, columns: list[str], rows: pl.DataFrame) -> str:
    """Build a multi-row INSERT ... ON CONFLICT DO NOTHING statement."""
    col_list = ", ".join(columns)
    value_rows = []
    for row in rows.iter_rows():
        vals = ", ".join(sql_value(v) for v in row)
        value_rows.append(f"    ({vals})")
    values = ",\n".join(value_rows)
    return f"INSERT INTO {table} ({col_list}) VALUES\n{values}\nON CONFLICT DO NOTHING;\n"


def main() -> int:
    args = parse_args()
    inp: Path = args.input_dir
    output: Path = args.output

    # Read titles, pick top N movies + TV by popularity
    titles = pl.read_csv(inp / "titles.csv", infer_schema_length=0).with_columns(
        col("id").cast(pl.Int64),
        col("popularity").cast(pl.Float64),
        col("rating_count").cast(pl.Int64, strict=False).fill_null(0),
    )

    movies = (
        titles.filter(col("type") == "MOVIE")
        .sort("popularity", descending=True)
        .head(args.movie_limit)
    )
    tv = (
        titles.filter(col("type") == "TV")
        .sort("popularity", descending=True)
        .head(args.tv_limit)
    )
    selected = pl.concat([movies, tv])
    title_ids = set(selected["id"].to_list())

    # Filter join tables to selected title_ids
    title_genres = pl.read_csv(inp / "title_genres.csv").filter(
        col("title_id").is_in(list(title_ids))
    )
    genre_ids = set(title_genres["genre_id"].to_list())

    genres = pl.read_csv(inp / "genres.csv").filter(col("id").is_in(list(genre_ids)))

    cast_members = pl.read_csv(
        inp / "cast_members.csv", infer_schema_length=0
    ).with_columns(
        col("title_id").cast(pl.Int64),
        col("person_id").cast(pl.Int64),
        col("billing_order").cast(pl.Int64, strict=False),
    ).filter(col("title_id").is_in(list(title_ids)))
    person_ids = set(cast_members["person_id"].to_list())

    people = pl.read_csv(inp / "people.csv", infer_schema_length=0).with_columns(
        col("id").cast(pl.Int64),
    ).filter(col("id").is_in(list(person_ids)))

    # Cast columns to correct types for null handling
    selected = selected.with_columns(
        col("runtime_minutes").cast(pl.Int64, strict=False),
        col("season_count").cast(pl.Int64, strict=False),
        col("rating").cast(pl.Float64, strict=False).fill_null(6.5),
    )

    # Build SQL
    parts: list[str] = []
    parts.append("-- Auto-generated seed data. Do not edit.\n\n")

    genre_cols = ["id", "name"]
    parts.append(insert_statement("genres", genre_cols, genres.select(genre_cols)))
    parts.append("\n")

    title_cols = [
        "id", "type", "title", "overview", "release_date", "runtime_minutes",
        "season_count", "rating", "rating_count", "popularity", "poster_url",
        "backdrop_url", "embedding",
    ]
    parts.append(insert_statement("titles", title_cols, selected.select(title_cols)))
    parts.append("\n")

    people_cols = ["id", "name", "profile_url"]
    parts.append(insert_statement("people", people_cols, people.select(people_cols)))
    parts.append("\n")

    tg_cols = ["title_id", "genre_id"]
    parts.append(insert_statement("title_genres", tg_cols, title_genres.select(tg_cols)))
    parts.append("\n")

    cm_cols = ["title_id", "person_id", "character_name", "billing_order"]
    parts.append(insert_statement("cast_members", cm_cols, cast_members.select(cm_cols)))
    parts.append("\n")

    # Reset sequences so future inserts don't collide with seeded IDs
    parts.append("SELECT setval(pg_get_serial_sequence('titles', 'id'), COALESCE((SELECT MAX(id) FROM titles), 1));\n")
    parts.append("SELECT setval(pg_get_serial_sequence('genres', 'id'), COALESCE((SELECT MAX(id) FROM genres), 1));\n")
    parts.append("SELECT setval(pg_get_serial_sequence('people', 'id'), COALESCE((SELECT MAX(id) FROM people), 1));\n")
    parts.append("SELECT setval(pg_get_serial_sequence('cast_members', 'id'), COALESCE((SELECT MAX(id) FROM cast_members), 1));\n")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("".join(parts))

    n_titles = selected.height
    n_genres = genres.height
    n_people = people.height
    n_cast = cast_members.height
    print(
        f"Wrote {output}: {n_titles} titles, {n_genres} genres, "
        f"{n_people} people, {n_cast} cast members"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
