#!/usr/bin/env python3
"""
Convert raw TMDB JSONL files (from tmdb_fetch_top.py) into CSVs with text
embeddings, ready for direct Postgres import via \\copy (see tmdb_load.sql).

Example:
    python3 scripts/tmdb_convert.py --input-dir data --output-dir data
"""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

import polars as pl
from polars import col, lit

IMAGE_BASE = "https://image.tmdb.org/t/p/"
EMBEDDING_MODEL = "sentence-transformers/static-similarity-mrl-multilingual-v1"
EMBEDDING_DIM = 256


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Convert TMDB JSONL to CSVs")
    p.add_argument("--input-dir", type=Path, help="Directory with JSONL files")
    p.add_argument("--output-dir", type=Path)
    p.add_argument(
        "--max-release-date",
        type=date.fromisoformat,
        default=date.today(),
        help="Exclude titles with release_date after this date (default: today)",
    )
    return p.parse_args()


def embed(titles: pl.DataFrame) -> pl.Series:
    from sentence_transformers import SentenceTransformer

    model = SentenceTransformer(EMBEDDING_MODEL, truncate_dim=EMBEDDING_DIM)
    texts = (titles["title"] + " " + titles["overview"]).to_list()
    vecs = model.encode(texts, show_progress_bar=True)
    # pgvector expects [0.1,0.2,...] string format
    return pl.Series(
        "embedding", ["[" + ",".join(f"{float(v):.8f}" for v in e) + "]" for e in vecs]
    )


def img(size: str, path_col: str) -> pl.Expr:
    return (
        pl.when(col(path_col).is_not_null())
        .then(lit(f"{IMAGE_BASE}{size}") + col(path_col))
        .otherwise(lit(None))
    )


def main() -> int:
    args = parse_args()
    inp, out = args.input_dir, args.output_dir
    out.mkdir(parents=True, exist_ok=True)

    title_parts, credit_parts = [], []  # Movie + TV Show dataframes
    if (path := inp / "tmdb_movies.jsonl").exists():
        raw = pl.read_ndjson(path)
        title_parts.append(
            raw.filter(
                col("title").is_not_null() | col("original_title").is_not_null()
            ).select(
                col("id").alias("tmdb_id"),
                lit("MOVIE").alias("type"),
                pl.coalesce("title", "original_title").alias("title"),
                col("overview"),
                col("release_date").cast(pl.Utf8).replace("", None),
                col("runtime").alias("runtime_minutes"),
                lit(None).cast(pl.Int64).alias("season_count"),
                col("vote_average").cast(pl.Float64, strict=False).fill_null(6.5).alias("rating"),
                col("vote_count").cast(pl.Int64, strict=False).fill_null(0).alias("rating_count"),
                col("popularity"),
                img("w500", "poster_path").alias("poster_url"),
                img("w1280", "backdrop_path").alias("backdrop_url"),
                col("genres"),
            )
        )
        if (path := inp / "tmdb_movie_credits.jsonl").exists():
            credit_parts.append(
                pl.read_ndjson(path)
                .select(col("id").alias("tmdb_id"), lit("MOVIE").alias("type"), "cast")
                .explode("cast")
                .filter(col("cast").is_not_null())
                .select(
                    "tmdb_id",
                    "type",
                    col("cast").struct.field("id").alias("person_id"),
                    col("cast").struct.field("name").alias("person_name"),
                    col("cast").struct.field("original_name").alias("orig_name"),
                    col("cast").struct.field("character").alias("character_name"),
                    col("cast").struct.field("order").alias("billing_order"),
                    col("cast").struct.field("profile_path"),
                )
            )
    if (path := inp / "tmdb_tv.jsonl").exists():
        raw = pl.read_ndjson(path)
        title_parts.append(
            raw.filter(
                col("name").is_not_null() | col("original_name").is_not_null()
            ).select(
                col("id").alias("tmdb_id"),
                lit("TV").alias("type"),
                pl.coalesce("name", "original_name").alias("title"),
                col("overview"),
                col("first_air_date").cast(pl.Utf8).replace("", None).alias("release_date"),
                col("episode_run_time").list.first().alias("runtime_minutes"),
                col("number_of_seasons").alias("season_count"),
                col("vote_average").cast(pl.Float64, strict=False).fill_null(6.5).alias("rating"),
                col("vote_count").cast(pl.Int64, strict=False).fill_null(0).alias("rating_count"),
                col("popularity"),
                img("w500", "poster_path").alias("poster_url"),
                img("w1280", "backdrop_path").alias("backdrop_url"),
                col("genres"),
            )
        )
        if (path := inp / "tmdb_tv_credits.jsonl").exists():
            credit_parts.append(
                pl.read_ndjson(path)
                .select(col("id").alias("tmdb_id"), lit("TV").alias("type"), "cast")
                .explode("cast")
                .filter(col("cast").is_not_null())
                .select(
                    "tmdb_id",
                    "type",
                    col("cast").struct.field("id").alias("person_id"),
                    col("cast").struct.field("name").alias("person_name"),
                    col("cast").struct.field("original_name").alias("orig_name"),
                    col("cast").struct.field("character").alias("character_name"),
                    col("cast").struct.field("order").alias("billing_order"),
                    col("cast").struct.field("profile_path"),
                )
            )

    if not title_parts or not credit_parts:
        print("Input files missing", file=sys.stderr)
        return 2

    titles = pl.concat(title_parts)

    # Filter out future releases
    if args.max_release_date:
        before = len(titles)
        titles = titles.filter(
            col("release_date").is_null()
            | (col("release_date").str.to_date() <= args.max_release_date)
        )
        print(f"Filtered {before - len(titles)} titles with release_date > {args.max_release_date}")

    titles = titles.with_row_index("id", offset=1)
    id_map = titles.select("tmdb_id", "type", "id")

    g = (
        titles.select("id", "genres")
        .explode("genres")
        .filter(col("genres").is_not_null())
        .with_columns(
            col("genres").struct.field("id").alias("genre_id"),
            col("genres").struct.field("name").alias("genre_name"),
        )
    )
    title_genres = g.select(col("id").alias("title_id"), "genre_id").unique()
    genres = (
        g.select(col("genre_id").alias("id"), col("genre_name").alias("name"))
        .unique("id")
        .sort("id")
    )

    cast = (
        pl.concat(credit_parts)
        .join(id_map, on=["tmdb_id", "type"])
        .filter(
            col("character_name").is_not_null()
            & (col("character_name") != "")
            & col("person_id").is_not_null()
        )
        .sort("id", "billing_order")
        .unique(subset=["id", "person_id"], keep="first")
    )
    cast_members = cast.select(
        col("id").alias("title_id"), "person_id", "character_name", "billing_order"
    )
    people = (
        cast.unique("person_id", keep="first")
        .select(
            col("person_id").alias("id"),
            pl.coalesce("person_name", "orig_name").alias("name"),
            img("w185", "profile_path").alias("profile_url"),
        )
        .sort("id")
    )

    titles = titles.with_columns(embed(titles))

    # Write CSVs
    title_cols = [
        "id",
        "type",
        "title",
        "overview",
        "release_date",
        "runtime_minutes",
        "season_count",
        "rating",
        "rating_count",
        "popularity",
        "poster_url",
        "backdrop_url",
        "embedding",
    ]
    titles.select(title_cols).write_csv(out / "titles.csv")
    genres.write_csv(out / "genres.csv")
    people.write_csv(out / "people.csv")
    title_genres.write_csv(out / "title_genres.csv")
    cast_members.write_csv(out / "cast_members.csv")

    return 0


if __name__ == "__main__":
    sys.exit(main())
