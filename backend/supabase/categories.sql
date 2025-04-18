-- This file is autogenerated from regen-schema.ts
create table if not exists
  categories (
    archived boolean default false not null,
    color text,
    created_time timestamp with time zone default now() not null,
    display_order integer default 0 not null,
    id bigint primary key generated always as identity not null,
    name text not null,
    user_id text not null
  );

-- Row Level Security
alter table categories enable row level security;

-- Indexes
drop index if exists categories_pkey;

create unique index categories_pkey on public.categories using btree (id);

drop index if exists categories_user_id_idx;

create index categories_user_id_idx on public.categories using btree (user_id);
