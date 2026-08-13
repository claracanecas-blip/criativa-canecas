import { onMounted, ref } from 'vue'
import { getSupabaseClient } from '@/services/supabase'
import type { Tables } from '@/types/database'

type PublicTestimonial = Pick<Tables<'testimonials'>, 'id' | 'author_display_name' | 'quote' | 'rating' | 'photo_path' | 'display_order'>

export function useTestimonials() {
  const testimonials = ref<PublicTestimonial[]>([])
  onMounted(async () => {
    try {
      const { data, error } = await getSupabaseClient()
        .from('testimonials')
        .select('id,author_display_name,quote,rating,photo_path,display_order')
        .order('display_order')
        .limit(6)
      if (!error) testimonials.value = data ?? []
    } catch {
      testimonials.value = []
    }
  })
  return { testimonials }
}
