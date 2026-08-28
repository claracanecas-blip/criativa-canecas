<script setup lang="ts">
import { computed } from 'vue'
import { Star } from '@lucide/vue'
import { useTestimonials } from '@/composables/useTestimonials'

const { testimonials } = useTestimonials()
const visibleTestimonials = computed(() => testimonials.value.slice(0, 3))

function safePhotoUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('/') || /^https:\/\//i.test(path)) return path
  return null
}
</script>

<template>
  <section v-if="visibleTestimonials.length" class="social-proof">
    <header>
      <small>Experiências reais</small>
      <h2>Quem já encomendou recomenda</h2>
      <p>Somente depoimentos publicados após moderação.</p>
    </header>
    <div class="testimonial-grid">
      <blockquote v-for="item in visibleTestimonials" :key="item.id">
        <img v-if="safePhotoUrl(item.photo_path)" :src="safePhotoUrl(item.photo_path) ?? ''" :alt="`Foto autorizada de ${item.author_display_name}`" loading="lazy">
        <div class="stars" :aria-label="`${item.rating} de 5 estrelas`"><Star v-for="star in item.rating" :key="star" :size="17" fill="currentColor" /></div>
        <p>“{{ item.quote }}”</p>
        <cite>{{ item.author_display_name }}</cite>
      </blockquote>
    </div>
  </section>
</template>

<style scoped>
.social-proof{margin-top:48px}.social-proof header{text-align:center;margin-bottom:20px}.social-proof header small{color:var(--pink-dark);font-size:11px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.social-proof h2{margin:5px 0 4px;font-size:28px}.social-proof header p{margin:0;color:var(--muted);font-size:13px}.testimonial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.testimonial-grid blockquote{margin:0;padding:20px;border:1px solid var(--line);border-radius:16px;background:#fff7fa}.testimonial-grid img{width:58px;height:58px;border-radius:50%;object-fit:cover;margin-bottom:10px}.stars{display:flex;color:#a86800;gap:2px}.testimonial-grid p{line-height:1.6}.testimonial-grid cite{font-style:normal;color:var(--pink-dark);font-weight:850}
@media(max-width:800px){.testimonial-grid{grid-template-columns:1fr}.social-proof h2{font-size:24px}}
</style>
