create extension if not exists vector;

create or replace function immutable_text_vector(text_value text)
    returns tsvector
    language sql
    immutable
as
'select to_tsvector(''simple'', coalesce(text_value, ''''))';

create table if not exists titles
(
    id              bigserial primary key,
    type            varchar(16)      not null,
    title           text             not null,
    overview        text,
    release_date    date,
    runtime_minutes integer,
    season_count    integer,
    rating          double precision not null default 6.5,
    rating_count    integer          not null default 0,
    rating_weighted double precision generated always as ( -- Bayesian average with 6.5 as prior
        (rating_count * rating + 50.0 * 6.5) / (rating_count + 50.0)) stored,
    popularity      double precision,
    poster_url      text,
    backdrop_url    text,
    embedding       vector(256) not null default (array_fill(0::real, ARRAY[256])::vector),
    title_vector    tsvector generated always as (immutable_text_vector(title)) stored,
    overview_vector tsvector generated always as (immutable_text_vector(overview)) stored
);

create table if not exists genres
(
    id   bigserial primary key,
    name text not null,
    constraint uq_genres_name unique (name)
);

create table if not exists people
(
    id          bigserial primary key,
    name        text not null,
    profile_url text
);

create table if not exists title_genres
(
    title_id bigint not null references titles (id) on delete cascade,
    genre_id bigint not null references genres (id) on delete cascade,
    primary key (title_id, genre_id)
);

create table if not exists cast_members
(
    id             bigserial primary key,
    title_id       bigint  not null references titles (id) on delete cascade,
    person_id      bigint  not null references people (id) on delete cascade,
    character_name text,
    billing_order  integer not null,
    constraint uq_cast_members_title_person_order unique (title_id, person_id, billing_order)
);

create table if not exists users
(
    id            bigserial primary key,
    name          text        not null,
    email         text        not null,
    password_hash text        not null,
    created_at    timestamptz not null default now(),
    constraint uq_users_email unique (email)
);

create table if not exists reviews
(
    id         bigserial primary key,
    title_id   bigint      not null references titles (id) on delete cascade,
    user_id    bigint      not null references users (id) on delete cascade,
    rating     integer     not null,
    review     text        not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_reviews_title_user unique (title_id, user_id),
    constraint chk_reviews_rating check (rating between 1 and 10)
);

create index if not exists idx_titles_type on titles (type);
create index if not exists idx_titles_rating on titles (rating desc);
create index if not exists idx_titles_popularity_sort on titles (popularity desc nulls last, id);
create index if not exists idx_titles_release_sort on titles (release_date desc nulls last, id);
create index if not exists idx_titles_rating_weighted_sort on titles (rating_weighted desc nulls last, id);
create index if not exists idx_titles_title_vector on titles using gin (title_vector) with (fastupdate = off);
create index if not exists idx_titles_overview_vector on titles using gin (overview_vector) with (fastupdate = off);
create index if not exists idx_titles_embedding on titles using hnsw (embedding vector_cosine_ops);

create index if not exists idx_title_genres_genre on title_genres (genre_id);
create index if not exists idx_cast_members_title on cast_members (title_id);
create index if not exists idx_cast_members_person on cast_members (person_id);

create index if not exists idx_reviews_user on reviews (user_id);
create index if not exists idx_reviews_title_updated on reviews (title_id, updated_at desc);

create unique index if not exists idx_users_email_ci on users (lower(email));
