-- Fase 4: Diario delle bevute + Wishlist

-- Diario: registra ogni bottiglia bevuta (indipendente dallo stock attuale)
create table if not exists diary_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  wine_id bigint references wines(id) on delete set null,
  bottle_id bigint references bottles(id) on delete set null,
  wine_name text not null,
  producer text,
  year int,
  drunk_at date not null default current_date,
  rating int check (rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);

alter table diary_entries enable row level security;

create policy "diary_entries_select_own" on diary_entries
  for select using (auth.uid() = user_id);
create policy "diary_entries_insert_own" on diary_entries
  for insert with check (auth.uid() = user_id);
create policy "diary_entries_update_own" on diary_entries
  for update using (auth.uid() = user_id);
create policy "diary_entries_delete_own" on diary_entries
  for delete using (auth.uid() = user_id);

-- Wishlist: vini desiderati, non ancora posseduti
create table if not exists wishlist_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  producer text,
  region text,
  country text,
  color text,
  year int,
  notes text,
  created_at timestamptz not null default now()
);

alter table wishlist_items enable row level security;

create policy "wishlist_items_select_own" on wishlist_items
  for select using (auth.uid() = user_id);
create policy "wishlist_items_insert_own" on wishlist_items
  for insert with check (auth.uid() = user_id);
create policy "wishlist_items_update_own" on wishlist_items
  for update using (auth.uid() = user_id);
create policy "wishlist_items_delete_own" on wishlist_items
  for delete using (auth.uid() = user_id);
