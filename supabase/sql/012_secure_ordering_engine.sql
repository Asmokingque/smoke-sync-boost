alter table public.orders
  add column if not exists checkout_request_id uuid unique,
  add column if not exists status_lookup_token uuid default gen_random_uuid() unique,
  add column if not exists pickup_date date,
  add column if not exists internal_notes text;

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  previous_status text,
  new_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_pickup_date on public.orders(pickup_date);
create index if not exists idx_orders_checkout_request_id on public.orders(checkout_request_id);
create index if not exists idx_orders_status_lookup_token on public.orders(status_lookup_token);
create index if not exists idx_order_status_history_order_id on public.order_status_history(order_id, created_at desc);

alter table public.order_status_history enable row level security;

drop policy if exists "Anyone can place orders" on public.orders;
drop policy if exists "Place order as self or guest" on public.orders;
drop policy if exists "Users view own orders" on public.orders;
drop policy if exists "Admins view all orders" on public.orders;
drop policy if exists "Admins update orders" on public.orders;

drop policy if exists "Users view own order items" on public.order_items;
drop policy if exists "Admins view all order items" on public.order_items;
drop policy if exists "Insert order items for own order" on public.order_items;

drop policy if exists "Admins view order history" on public.order_status_history;

create policy "Authenticated users view own orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

create policy "Authenticated users view own order items"
on public.order_items for select
to authenticated
using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "Authenticated users view own order history"
on public.order_status_history for select
to authenticated
using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
