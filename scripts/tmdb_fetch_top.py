#!/usr/bin/env python3
"""
Fetches the most popular movie and TV show data from TMDB's API. Requires a recent
dump of title IDs from TMDB: https://developer.themoviedb.org/docs/daily-id-exports

Writes raw JSON responses to 4 JSONL files: movies, movie credits, tv, tv credits.
Resumes automatically by skipping IDs already present in the output files.

Example:
  TMDB_API_KEY=... python3 scripts/tmdb_fetch_top.py \
    --movie-ids-file data/movie_ids_02_03_2026.json \
    --tv-ids-file data/tv_series_ids_02_03_2026.json \
    --output-dir data
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Literal

import polars as pl
from polars import col
import requests

API_BASE = "https://api.themoviedb.org/3"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Fetch top TMDB movies and TV into JSONL.")
    p.add_argument("--movie-ids-file", type=Path)
    p.add_argument("--tv-ids-file", type=Path)
    p.add_argument("--movie-limit", type=int, default=100_000, help="Top N movies")
    p.add_argument("--tv-limit", type=int, default=20_000, help="Top N TV series")
    p.add_argument("--output-dir", default="data")
    p.add_argument("--sleep", type=float, default=0.20, help="Seconds between requests")
    p.add_argument(
        "--overwrite",
        action="store_true",
        help="Delete existing output and start fresh",
    )
    return p.parse_args()


def tmdb_get(path: str, api_key: str, session: requests.Session) -> dict[str, Any]:
    resp = session.get(
        f"{API_BASE}{path}",
        params={"language": "en-US"},
        headers={"Accept": "application/json", "Authorization": f"Bearer {api_key}"},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def load_top_ids(path: Path, limit: int) -> list[int]:
    if not path.exists():
        print(f"ID file not found: {path}", file=sys.stderr)
        sys.exit(2)
    df = (
        pl.scan_ndjson(path)
        .select(col.id.cast(pl.Int64), col.popularity.fill_null(0.0).cast(pl.Float64))
        .sort("popularity", descending=True)
        .limit(limit)
        .collect()
    )
    return df.get_column("id").to_list()


def load_existing_ids(path: Path) -> set[int]:
    if not path.exists():
        return set()
    return set(pl.read_ndjson(path).get_column("id").cast(pl.Int64).to_list())


def fetch_items(
    ids: list[int],
    media_type: Literal["movie", "tv"],
    title_path: Path,
    credits_path: Path,
    api_key: str,
    session: requests.Session,
    sleep: float,
) -> int:
    title_done = load_existing_ids(title_path)
    credits_done = load_existing_ids(credits_path)
    failures = 0
    fetched = 0

    with (
        title_path.open("a", encoding="utf-8") as title_f,
        credits_path.open("a", encoding="utf-8") as credits_f,
    ):
        for tmdb_id in ids:
            if tmdb_id in title_done and tmdb_id in credits_done:
                continue

            fetched += 1
            if fetched % 500 == 0:
                print(f"  {media_type}: {fetched} fetched", file=sys.stderr)

            if tmdb_id not in title_done:
                try:
                    data = tmdb_get(f"/{media_type}/{tmdb_id}", api_key, session)
                    title_f.write(json.dumps(data, ensure_ascii=False) + "\n")
                    title_f.flush()
                    title_done.add(tmdb_id)
                except requests.RequestException as err:
                    failures += 1
                    print(f"Error {media_type}/{tmdb_id}: {err}", file=sys.stderr)

            if tmdb_id not in credits_done:
                try:
                    data = tmdb_get(
                        f"/{media_type}/{tmdb_id}/credits", api_key, session
                    )
                    credits_f.write(json.dumps(data, ensure_ascii=False) + "\n")
                    credits_f.flush()
                    credits_done.add(tmdb_id)
                except requests.RequestException as err:
                    failures += 1
                    print(
                        f"Error {media_type}/{tmdb_id}/credits: {err}", file=sys.stderr
                    )

            if failures >= 100:
                print("Too many errors, stopping.", file=sys.stderr)
                break

            time.sleep(sleep)

    return failures


def main() -> int:
    args = parse_args()

    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        print("Missing TMDB_API_KEY in environment.", file=sys.stderr)
        return 2

    session = requests.Session()
    movie_ids = load_top_ids(args.movie_ids_file, args.movie_limit)
    tv_ids = load_top_ids(args.tv_ids_file, args.tv_limit)

    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)

    movies_path = out / "tmdb_movies.jsonl"
    movie_credits_path = out / "tmdb_movie_credits.jsonl"
    tv_path = out / "tmdb_tv.jsonl"
    tv_credits_path = out / "tmdb_tv_credits.jsonl"

    if args.overwrite:
        for p in [movies_path, movie_credits_path, tv_path, tv_credits_path]:
            p.unlink(missing_ok=True)

    print(f"Fetching movies...", file=sys.stderr)
    mf = fetch_items(
        movie_ids,
        "movie",
        movies_path,
        movie_credits_path,
        api_key,
        session,
        args.sleep,
    )
    print(f"Fetching tv shows...", file=sys.stderr)
    tf = fetch_items(
        tv_ids, "tv", tv_path, tv_credits_path, api_key, session, args.sleep
    )

    print(f"Done. Movie failures: {mf}, TV failures: {tf}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
