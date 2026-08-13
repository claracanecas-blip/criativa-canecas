begin;

create table public.testimonials (
  id bigint generated always as identity primary key,
  author_display_name text not null check (char_length(trim(author_display_name)) between 2 and 60),
  quote text not null check (char_length(trim(quote)) between 10 and 500),
  rating smallint not null check (rating between 1 and 5),
  photo_path text,
  photo_consent_reference text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  check (photo_path is null or (photo_consent_reference is not null and char_length(trim(photo_consent_reference)) >= 3))
);

create trigger testimonials_touch_updated_at
before update on public.testimonials
for each row execute function public.set_catalog_updated_at();

create trigger testimonials_set_actor
before insert or update on public.testimonials
for each row execute function public.set_catalog_actor();

alter table public.testimonials enable row level security;
revoke all on public.testimonials from anon, authenticated;
grant select (id, author_display_name, quote, rating, photo_path, display_order) on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;
grant select on public.testimonials to authenticated;

create policy testimonials_public_read
on public.testimonials for select
to anon, authenticated
using (status = 'published');

create policy testimonials_admin_insert
on public.testimonials for insert
to authenticated
with check ((select public.is_catalog_admin()));

create policy testimonials_admin_update
on public.testimonials for update
to authenticated
using ((select public.is_catalog_admin()))
with check ((select public.is_catalog_admin()));

create policy testimonials_admin_delete
on public.testimonials for delete
to authenticated
using ((select public.is_catalog_admin()));

commit;
