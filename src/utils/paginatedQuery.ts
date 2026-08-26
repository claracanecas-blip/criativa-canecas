export const SUPABASE_PAGE_SIZE = 1_000

interface QueryPageResult<T> {
  data: T[] | null
  error: { message: string } | null
}

export async function fetchAllQueryPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<QueryPageResult<T>>,
  pageSize = SUPABASE_PAGE_SIZE,
): Promise<T[]> {
  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new Error('O tamanho da página deve ser um inteiro positivo.')
  }

  const rows: T[] = []

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await fetchPage(from, from + pageSize - 1)
    if (error) throw new Error(error.message)

    const page = data ?? []
    rows.push(...page)
    if (page.length < pageSize) return rows
  }
}
