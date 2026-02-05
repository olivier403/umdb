\set on_error_stop on

truncate table cast_members, title_genres, titles, people, genres
    restart identity cascade;

\copy genres (id, name) from 'genres.csv' with (format csv, header true);
\copy titles (id, type, title, overview, release_date, runtime_minutes, season_count, rating, rating_count, popularity, poster_url, backdrop_url, embedding) from 'titles.csv' with (format csv, header true);
\copy people (id, name, profile_url) from 'people.csv' with (format csv, header true);
\copy title_genres (title_id, genre_id) from 'title_genres.csv' with (format csv, header true);
\copy cast_members (title_id, person_id, character_name, billing_order) from 'cast_members.csv' with (format csv, header true);

select setval(pg_get_serial_sequence('titles', 'id'), (select coalesce(max(id), 1) from titles));
select setval(pg_get_serial_sequence('genres', 'id'), (select coalesce(max(id), 1) from genres));
select setval(pg_get_serial_sequence('people', 'id'), (select coalesce(max(id), 1) from people));
select setval(pg_get_serial_sequence('cast_members', 'id'), (select coalesce(max(id), 1) from cast_members));
