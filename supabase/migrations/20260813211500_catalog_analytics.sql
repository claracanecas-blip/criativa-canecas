begin;

create table public.analytics_daily_events (
  event_date date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  event_name text not null check (event_name in (
    'product_view',
    'search',
    'collection_select',
    'whatsapp_click',
    'client_error'
  )),
  dimension_1 text not null default 'none' check (char_length(dimension_1) between 1 and 80),
  dimension_2 text not null default 'none' check (char_length(dimension_2) between 1 and 80),
  event_count bigint not null default 1 check (event_count > 0),
  last_seen_at timestamptz not null default now(),
  primary key (event_date, event_name, dimension_1, dimension_2)
);

alter table public.analytics_daily_events enable row level security;
revoke all on public.analytics_daily_events from anon, authenticated;
grant select on public.analytics_daily_events to authenticated;

create policy analytics_daily_events_admin_read
on public.analytics_daily_events for select
to authenticated
using ((select public.is_catalog_admin()));

create or replace function public.record_catalog_event(
  p_event_name text,
  p_dimension_1 text default 'none',
  p_dimension_2 text default 'none'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_name_value text := lower(trim(coalesce(p_event_name, '')));
  dimension_1_value text := lower(trim(coalesce(p_dimension_1, 'none')));
  dimension_2_value text := lower(trim(coalesce(p_dimension_2, 'none')));
begin
  if event_name_value = 'product_view' then
    if dimension_2_value not in ('direct', 'home', 'collection', 'search', 'related', 'external', 'other')
      or not exists (
        select 1 from public.products
        where slug = dimension_1_value and status = 'published'
      ) then
      raise exception 'invalid analytics dimensions' using errcode = '22023';
    end if;
  elsif event_name_value = 'search' then
    if dimension_1_value not in ('1', '2-3', '4-10', '11+')
      or dimension_2_value not in ('0', '1', '2-5', '6-20', '21+') then
      raise exception 'invalid analytics dimensions' using errcode = '22023';
    end if;
  elsif event_name_value = 'collection_select' then
    if dimension_2_value not in ('direct', 'home', 'collections', 'search', 'menu', 'product', 'external', 'other')
      or not exists (
        select 1 from public.collections
        where slug = dimension_1_value and is_published
      ) then
      raise exception 'invalid analytics dimensions' using errcode = '22023';
    end if;
  elsif event_name_value = 'whatsapp_click' then
    if dimension_2_value not in (
      'header_help', 'header_order', 'floating', 'footer', 'product_card',
      'product_page', 'empty_state', 'personalized', 'gifts', 'campaign'
    ) or (
      dimension_1_value <> 'general'
      and not exists (
        select 1 from public.products
        where slug = dimension_1_value and status = 'published'
      )
    ) then
      raise exception 'invalid analytics dimensions' using errcode = '22023';
    end if;
  elsif event_name_value = 'client_error' then
    if dimension_1_value not in (
      'vue_render', 'unhandled_error', 'unhandled_rejection',
      'catalog_load', 'analytics_delivery'
    ) or dimension_2_value not in (
      'home', 'collections', 'collection', 'search', 'product',
      'content', 'admin', 'not_found', 'other'
    ) then
      raise exception 'invalid analytics dimensions' using errcode = '22023';
    end if;
  else
    raise exception 'invalid analytics event' using errcode = '22023';
  end if;

  insert into public.analytics_daily_events (
    event_name,
    dimension_1,
    dimension_2
  ) values (
    event_name_value,
    dimension_1_value,
    dimension_2_value
  )
  on conflict (event_date, event_name, dimension_1, dimension_2)
  do update set
    event_count = public.analytics_daily_events.event_count + 1,
    last_seen_at = now();
end;
$$;

revoke all on function public.record_catalog_event(text, text, text) from public;
grant execute on function public.record_catalog_event(text, text, text) to anon, authenticated;

commit;
