<script setup lang="ts">
import { Gift, MapPin, PackageCheck } from '@lucide/vue'
import { deliveryPolicy } from '@/data/site'

withDefaults(defineProps<{
  compact?: boolean
  showHeading?: boolean
}>(), {
  compact: false,
  showHeading: true,
})
</script>

<template>
  <section class="delivery-options" :class="{ compact }">
    <header v-if="showHeading">
      <small>Entrega com clareza</small>
      <h2>Escolha como receber</h2>
      <p>{{ deliveryPolicy.priceNote }}</p>
    </header>
    <p v-else class="price-note">{{ deliveryPolicy.priceNote }}</p>

    <div class="delivery-grid">
      <article>
        <span class="delivery-icon local"><MapPin :size="22" /></span>
        <div>
          <strong>{{ deliveryPolicy.local.title }}</strong>
          <b>{{ deliveryPolicy.local.subtitle }}</b>
          <p>{{ deliveryPolicy.local.description }}</p>
        </div>
        <Gift class="benefit-icon" :size="20" aria-hidden="true" />
      </article>

      <article>
        <span class="delivery-icon shipping"><PackageCheck :size="22" /></span>
        <div>
          <strong>{{ deliveryPolicy.shipping.title }}</strong>
          <b>{{ deliveryPolicy.shipping.subtitle }}</b>
          <p>{{ deliveryPolicy.shipping.description }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.delivery-options{padding:26px;border:1px solid #f0c6d5;border-radius:20px;background:linear-gradient(135deg,#fff7fa,#fff);box-shadow:0 10px 28px rgba(85,42,60,.07)}
header{text-align:center;margin-bottom:18px}header small{color:var(--pink-dark);font-size:11px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}header h2{margin:5px 0 4px;font-size:25px}header p,.price-note{margin:0;color:var(--muted);font-size:13px;line-height:1.5}.price-note{margin-bottom:12px;font-weight:750}
.delivery-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.delivery-grid article{position:relative;display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;padding:17px;border:1px solid var(--line);border-radius:15px;background:#fff}.delivery-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:50%}.delivery-icon.local{color:var(--pink-dark);background:var(--pink-soft)}.delivery-icon.shipping{color:#176b4a;background:#e8f7f0}.delivery-grid strong,.delivery-grid b{display:block}.delivery-grid strong{font-size:12px;color:var(--pink-dark);text-transform:uppercase;letter-spacing:.05em}.delivery-grid b{margin-top:2px;font-size:15px}.delivery-grid p{margin:5px 0 0;color:var(--muted);font-size:12px;line-height:1.5}.benefit-icon{position:absolute;top:15px;right:15px;color:var(--pink)}
.compact{padding:17px;border-radius:15px;box-shadow:none}.compact header{text-align:left;margin-bottom:12px}.compact header h2{font-size:19px}.compact .delivery-grid{grid-template-columns:1fr}.compact .delivery-grid article{padding:13px}.compact .delivery-icon{width:36px;height:36px}.compact .delivery-grid p{font-size:11px}
@media(max-width:700px){.delivery-options{padding:20px}.delivery-grid{grid-template-columns:1fr}header h2{font-size:22px}}
</style>
