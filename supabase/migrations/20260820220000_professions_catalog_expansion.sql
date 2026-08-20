begin;

do $$
begin
  if not exists (
    select 1
    from public.collections
    where id = 'profissoes'
      and is_published
  ) then
    raise exception 'A coleção publicada profissoes é obrigatória.';
  end if;
end;
$$;

create temporary table selected_profession_products (
  number integer primary key,
  theme text not null
) on commit drop;

insert into selected_profession_products (number, theme)
values
  (1, 'Administração'), (2, 'Agronomia'), (3, 'Arquitetura'), (4, 'Artesã'), (5, 'Barbeiro'),
  (6, 'Biologia'), (7, 'Biomedicina'), (8, 'Bombeiro'), (9, 'Caminhoneiro'), (10, 'Ciência da Computação'),
  (11, 'Contabilidade'), (12, 'Costureira'), (13, 'Cuidadora'), (14, 'Design de Interiores'), (15, 'Design Gráfico'),
  (16, 'Direito'), (17, 'Educação Física'), (18, 'Enfermagem'), (19, 'Engenharia Civil'), (20, 'Engenharia de Produção'),
  (21, 'Engenharia Elétrica'), (22, 'Engenharia Mecânica'), (23, 'Esteticista'), (24, 'Farmácia'), (25, 'Fisioterapia'),
  (26, 'Fotografia'), (27, 'Gastronomia'), (28, 'Comissária de Bordo'), (29, 'Logística'), (30, 'Manicure'),
  (31, 'Maquiadora'), (32, 'Eletricista'), (33, 'Mecânico'), (34, 'Medicina'), (35, 'Nutrição'),
  (36, 'Odontologia'), (37, 'Pedagogia'), (38, 'Polícia'), (39, 'Professor'), (40, 'Programador'),
  (41, 'Psicologia'), (42, 'Publicidade'), (43, 'Química'), (44, 'Radiologia'), (45, 'Recursos Humanos'),
  (46, 'Secretária'), (47, 'Segurança do Trabalho'), (48, 'Serviço Social'), (49, 'Técnico de Informática'), (50, 'Veterinária');

insert into public.products (
  id,
  slug,
  sku,
  name,
  theme,
  description,
  price,
  status,
  is_featured,
  display_order,
  seo_title,
  seo_description
)
select
  'profissoes-' || lpad(number::text, 2, '0'),
  'profissoes-' || lpad(number::text, 2, '0'),
  'CC-PROFISSOES-' || lpad(number::text, 2, '0'),
  theme || ' 01',
  theme,
  'Caneca personalizada ' || theme || ' 01, tema Profissões.',
  39.90,
  'published',
  false,
  number - 1,
  theme || ' 01 | Criativa Canecas',
  'Conheça a caneca ' || theme || ' 01 personalizada pela Criativa Canecas.'
from selected_profession_products
on conflict (id) do update set
  slug = excluded.slug,
  sku = excluded.sku,
  name = excluded.name,
  theme = excluded.theme,
  description = excluded.description,
  price = excluded.price,
  status = excluded.status,
  is_featured = excluded.is_featured,
  display_order = excluded.display_order,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;

insert into public.product_collections (product_id, collection_id, display_order)
select
  'profissoes-' || lpad(number::text, 2, '0'),
  'profissoes',
  number - 1
from selected_profession_products
on conflict (product_id, collection_id) do update set
  display_order = excluded.display_order;

insert into public.product_images (
  id,
  product_id,
  storage_path,
  variant,
  alt_text,
  width,
  height,
  display_order
)
select
  product_id || '--' || image.variant,
  product_id,
  image.directory || product_id || '.webp',
  image.variant,
  selected.theme || ' 01',
  image.width,
  image.height,
  0
from selected_profession_products as selected
cross join lateral (
  select 'profissoes-' || lpad(selected.number::text, 2, '0') as product_id
) as product
cross join (
  values
    ('original', '', 1000, 1000),
    ('card-320', 'card/320/', 320, 320),
    ('card-640', 'card/640/', 640, 640),
    ('social', 'social/', 1200, 630)
) as image(variant, directory, width, height)
on conflict (id) do update set
  product_id = excluded.product_id,
  storage_path = excluded.storage_path,
  variant = excluded.variant,
  alt_text = excluded.alt_text,
  width = excluded.width,
  height = excluded.height,
  display_order = excluded.display_order;

commit;
