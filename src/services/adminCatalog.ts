import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from '@/types/database'
import { prepareProductImageVariants, uploadProductImageVariants } from '@/utils/adminImages'

export type ProductStatus = 'draft' | 'published' | 'archived'

type AdminCollection = Omit<Tables<'collections'>, 'created_by' | 'updated_by'>

export interface AdminProduct extends Omit<Tables<'products'>, 'created_by' | 'updated_by'> {
  collectionIds: string[]
  imagePath: string | null
}

export interface AdminCatalog {
  collections: AdminCollection[]
  products: AdminProduct[]
}

export interface CollectionForm {
  id?: string
  slug: string
  name: string
  description: string
  icon_name: string
  display_order: number
  is_published: boolean
  is_listed: boolean
  seo_title: string
  seo_description: string
}

export interface ProductForm {
  id: string
  slug: string
  sku: string
  name: string
  theme: string
  description: string
  price: number
  status: ProductStatus
  is_featured: boolean
  display_order: number
  seo_title: string
  seo_description: string
  collectionIds: string[]
  existingImagePath: string | null
}

function assertQuery(error: { message: string } | null): void {
  if (error) throw new Error(error.message)
}

export async function loadAdminCatalog(client: SupabaseClient<Database>): Promise<AdminCatalog> {
  const [collections, products, relations, images] = await Promise.all([
    client.from('collections').select('id,slug,name,description,icon_name,image_path,display_order,is_published,is_listed,seo_title,seo_description,created_at,updated_at').order('display_order'),
    client.from('products').select('id,slug,sku,name,theme,description,price,status,is_featured,display_order,seo_title,seo_description,created_at,updated_at').order('updated_at', { ascending: false }).range(0, 999),
    client.from('product_collections').select('*').range(0, 999),
    client.from('product_images').select('*').eq('variant', 'original').range(0, 999),
  ])
  assertQuery(collections.error)
  assertQuery(products.error)
  assertQuery(relations.error)
  assertQuery(images.error)

  const relationMap = new Map<string, string[]>()
  for (const relation of relations.data ?? []) {
    const ids = relationMap.get(relation.product_id) ?? []
    ids.push(relation.collection_id)
    relationMap.set(relation.product_id, ids)
  }
  const imageMap = new Map((images.data ?? []).map((image) => [image.product_id, image.storage_path]))

  return {
    collections: collections.data ?? [],
    products: (products.data ?? []).map((product) => ({
      ...product,
      collectionIds: relationMap.get(product.id) ?? [],
      imagePath: imageMap.get(product.id) ?? null,
    })),
  }
}

export async function saveCollection(
  client: SupabaseClient<Database>,
  form: CollectionForm,
): Promise<void> {
  const id = form.id || form.slug
  const { error } = await client.from('collections').upsert({
    id,
    slug: form.slug,
    name: form.name.trim(),
    description: form.description.trim(),
    icon_name: form.icon_name,
    display_order: form.display_order,
    is_published: form.is_published,
    is_listed: form.is_listed,
    seo_title: form.seo_title.trim() || null,
    seo_description: form.seo_description.trim() || null,
  }, { onConflict: 'id' })
  assertQuery(error)
}

export async function saveProduct(
  client: SupabaseClient<Database>,
  form: ProductForm,
  imageFile: File | null,
): Promise<void> {
  if (!form.collectionIds.length) throw new Error('Selecione ao menos uma coleção.')
  if (form.status === 'published' && !form.existingImagePath && !imageFile) {
    throw new Error('Um produto publicado precisa ter imagem.')
  }

  const requestedStatus = form.status
  const productRecord = {
    id: form.id,
    slug: form.slug,
    sku: form.sku.trim(),
    name: form.name.trim(),
    theme: form.theme.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    status: imageFile ? 'draft' : requestedStatus,
    is_featured: form.is_featured,
    display_order: form.display_order,
    seo_title: form.seo_title.trim() || null,
    seo_description: form.seo_description.trim() || null,
  }

  const previousRelations = await client
    .from('product_collections')
    .select('collection_id, display_order')
    .eq('product_id', form.id)
  assertQuery(previousRelations.error)

  const { error: productError } = await client.from('products').upsert(productRecord, { onConflict: 'id' })
  assertQuery(productError)

  const { error: deleteRelationsError } = await client.from('product_collections').delete().eq('product_id', form.id)
  assertQuery(deleteRelationsError)
  const newRelations = form.collectionIds.map((collectionId, index) => ({
    product_id: form.id,
    collection_id: collectionId,
    display_order: index,
  }))
  const { error: relationsError } = await client.from('product_collections').insert(newRelations)
  if (relationsError) {
    if (previousRelations.data?.length) {
      await client.from('product_collections').insert(previousRelations.data.map((relation) => ({
        product_id: form.id,
        collection_id: relation.collection_id,
        display_order: relation.display_order,
      })))
    }
    throw new Error(relationsError.message)
  }

  if (imageFile) {
    const variants = await prepareProductImageVariants(imageFile, form.slug)
    await uploadProductImageVariants(client, form.id, form.name, variants)
    if (requestedStatus !== 'draft') {
      const { error } = await client.from('products').update({ status: requestedStatus }).eq('id', form.id)
      assertQuery(error)
    }
  }
}

export async function deleteProduct(client: SupabaseClient<Database>, productId: string): Promise<void> {
  const { error } = await client.from('products').delete().eq('id', productId)
  assertQuery(error)
}

export async function deleteCollection(client: SupabaseClient<Database>, collectionId: string): Promise<void> {
  const references = await client
    .from('product_collections')
    .select('*', { count: 'exact', head: true })
    .eq('collection_id', collectionId)
  assertQuery(references.error)
  if ((references.count ?? 0) > 0) {
    throw new Error(`Esta coleção ainda possui ${references.count} produto(s) relacionado(s).`)
  }

  const { error } = await client.from('collections').delete().eq('id', collectionId)
  assertQuery(error)
}
