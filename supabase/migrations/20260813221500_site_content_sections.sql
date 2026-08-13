begin;

create table public.site_content_sections (
  content_key text primary key check (content_key ~ '^[a-z][a-z0-9_]{2,63}$'),
  kind text not null check (kind in ('card', 'faq')),
  title text not null check (char_length(trim(title)) between 2 and 120),
  body text not null check (char_length(trim(body)) between 10 and 1000),
  icon_name text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  check (
    (kind = 'faq' and icon_name is null)
    or
    (kind = 'card' and icon_name in ('Sparkles', 'PackageCheck', 'Coffee', 'ShieldCheck'))
  )
);

create trigger site_content_sections_touch_updated_at
before update on public.site_content_sections
for each row execute function public.set_catalog_updated_at();

create trigger site_content_sections_set_actor
before insert or update on public.site_content_sections
for each row execute function public.set_catalog_actor();

insert into public.site_content_sections
  (content_key, kind, title, body, icon_name, status, display_order)
values
  ('card_personalization', 'card', 'Personalização', 'Compartilhe a ideia e revise a prévia. A produção começa somente depois da confirmação combinada no atendimento.', 'Sparkles', 'published', 10),
  ('card_production_delivery', 'card', 'Produção e entrega', 'Prazo, disponibilidade, embalagem, forma de envio e custo de entrega são informados antes da confirmação.', 'PackageCheck', 'published', 20),
  ('card_materials_care', 'card', 'Materiais e cuidados', 'As características variam conforme o modelo. Use lavagem suave e confirme compatibilidade com micro-ondas/lava-louças no atendimento.', 'Coffee', 'published', 30),
  ('card_service_rights', 'card', 'Atendimento e direitos', 'Dúvidas, correções e solicitações pós-venda são tratadas pelo mesmo WhatsApp. Guarde as mensagens e a confirmação do pedido.', 'ShieldCheck', 'published', 40),
  ('faq_personalization', 'faq', 'Como funciona a personalização?', 'Envie sua ideia, foto, frase ou arte pelo WhatsApp. Antes da produção, confirme no atendimento o modelo, a composição visual, o valor e o prazo.', null, 'published', 100),
  ('faq_price', 'faq', 'O valor mostrado já é o total final?', 'Não. O catálogo e o orçamento exibem estimativas. Personalização, quantidade, embalagem e entrega podem alterar o valor; tudo é confirmado antes do pedido.', null, 'published', 110),
  ('faq_timing', 'faq', 'Quanto tempo leva para produzir e entregar?', 'O prazo depende da arte, quantidade, disponibilidade e destino. Peça a estimativa atual no WhatsApp antes de confirmar.', null, 'published', 120),
  ('faq_care', 'faq', 'Como cuidar da caneca?', 'Para conservar a estampa, use esponja macia e sabão neutro. Evite abrasivos e impactos. Confirme no atendimento as orientações específicas do modelo escolhido.', null, 'published', 130),
  ('faq_after_sales', 'faq', 'Como solicitar correção, troca ou cancelamento?', 'Entre em contato pelo WhatsApp com os dados do atendimento e fotos, quando aplicável. A situação será analisada conforme o pedido e os direitos previstos na legislação de consumo.', null, 'published', 140);

alter table public.site_content_sections enable row level security;
revoke all on public.site_content_sections from anon, authenticated;
grant select (content_key, kind, title, body, icon_name, display_order)
on public.site_content_sections to anon, authenticated;
grant insert, update, delete on public.site_content_sections to authenticated;

create policy site_content_sections_public_read
on public.site_content_sections for select
to anon, authenticated
using (status = 'published');

create policy site_content_sections_admin_read
on public.site_content_sections for select
to authenticated
using ((select public.is_catalog_admin()));

create policy site_content_sections_admin_insert
on public.site_content_sections for insert
to authenticated
with check ((select public.is_catalog_admin()));

create policy site_content_sections_admin_update
on public.site_content_sections for update
to authenticated
using ((select public.is_catalog_admin()))
with check ((select public.is_catalog_admin()));

create policy site_content_sections_admin_delete
on public.site_content_sections for delete
to authenticated
using ((select public.is_catalog_admin()));

create or replace function public.get_admin_site_content()
returns setof public.site_content_sections
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_catalog_admin()) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  return query select * from public.site_content_sections order by display_order, content_key;
end;
$$;

revoke all on function public.get_admin_site_content() from public, anon;
grant execute on function public.get_admin_site_content() to authenticated;

commit;
