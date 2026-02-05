# Scripts

Couple of scripts to fetch movie data from TMDB (themoviedb.org) and load it into Postgres.

- **tmdb_fetch_top.py**: Fetches top movies/TV from TMDB API into JSONL files. Resumes automatically.
- **tmdb_convert.py**: Converts raw JSONL to CSVs matching our schema and generates embeddings.
- **make_seed_sql.py**: Generates a small `data.sql` seed dataset from the CSVs.
- **tmdb_load.sql**: Bulk-loads CSVs directly into Postgres via `\copy`.
