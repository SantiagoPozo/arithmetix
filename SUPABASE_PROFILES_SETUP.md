# Supabase profile setup

Esta app necesita una tabla `public.profiles` para completar el onboarding del primer acceso.

## Paso a paso

1. Entra en tu proyecto de Supabase.
2. Abre `SQL Editor`.
3. Crea una consulta nueva.
4. Pega el SQL de abajo y ejecútalo.
5. Ve a `Table Editor` y comprueba que existe `public.profiles`.
6. No hace falta insertar filas a mano: la app creara o actualizara el perfil del usuario autenticado.

## SQL

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  alias text not null,
  birth_year integer,
  country_code text,
  bio text,
  school_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_alias_format
    check (alias ~ '^[a-z0-9](?:[a-z0-9_-]{2,23})$'),
  constraint profiles_birth_year_check
    check (
      birth_year is null
      or birth_year between 1900 and extract(year from now())::integer
    ),
  constraint profiles_country_code_check
    check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint profiles_bio_length_check
    check (bio is null or char_length(bio) <= 280),
  constraint profiles_school_name_length_check
    check (school_name is null or char_length(school_name) <= 120)
);

create unique index if not exists profiles_alias_lower_key
  on public.profiles (lower(alias));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by authenticated users" on public.profiles;
create policy "Profiles are readable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```

## Como queda asociado con Supabase Auth

- `profiles.id` usa el mismo UUID que `auth.users.id`.
- Cada usuario autenticado solo puede crear o editar su propia fila.
- Si borras un usuario en `auth.users`, su perfil se borra tambien por `on delete cascade`.
