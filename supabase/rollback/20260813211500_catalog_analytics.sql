begin;

drop policy if exists analytics_daily_events_admin_read
  on public.analytics_daily_events;
drop function if exists public.record_catalog_event(text, text, text);
drop table if exists public.analytics_daily_events;

commit;
