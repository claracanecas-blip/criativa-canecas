import { computed, onMounted, ref } from 'vue'
import {
  fallbackInformationContent,
  normalizePublicInformationContent,
  type PublicInformationContent,
} from '@/data/informationContent'
import { getSupabaseClient } from '@/services/supabase'

export function useInformationContent() {
  const sections = ref<PublicInformationContent[]>([...fallbackInformationContent])
  const source = ref<'loading' | 'supabase' | 'fallback'>('loading')

  onMounted(async () => {
    try {
      const { data, error } = await getSupabaseClient()
        .from('site_content_sections')
        .select('content_key,kind,title,body,icon_name,display_order')
        .order('display_order')
      if (error) throw error
      sections.value = normalizePublicInformationContent(data ?? [])
      source.value = 'supabase'
    } catch {
      sections.value = [...fallbackInformationContent]
      source.value = 'fallback'
    }
  })

  return {
    cards: computed(() => sections.value.filter((section) => section.kind === 'card')),
    faq: computed(() => sections.value.filter((section) => section.kind === 'faq')),
    source,
  }
}
