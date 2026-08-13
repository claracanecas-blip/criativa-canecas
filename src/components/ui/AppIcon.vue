<script setup lang="ts">
import { computed } from 'vue'
import {
  BriefcaseBusiness,
  Cake,
  Camera,
  Church,
  Clapperboard,
  Coffee,
  CreditCard,
  Dog,
  Dumbbell,
  Gamepad2,
  Gift,
  Handshake,
  Heart,
  Image,
  MessageCircle,
  Palette,
  Search,
  Shirt,
  ShoppingBag,
  Smile,
  Sparkles,
  Truck,
  Tv,
  WandSparkles,
  type LucideIcon,
} from '@lucide/vue'
import type { IconName } from '@/types/catalog'

const props = withDefaults(defineProps<{
  name: IconName
  size?: number
  strokeWidth?: number
}>(), {
  size: 24,
  strokeWidth: 2,
})

const icons: Record<IconName, LucideIcon> = {
  BriefcaseBusiness,
  Cake,
  Camera,
  Church,
  Clapperboard,
  Coffee,
  CreditCard,
  Dog,
  Dumbbell,
  Gamepad2,
  Gift,
  Handshake,
  Heart,
  Image,
  MessageCircle,
  Palette,
  Search,
  Shirt,
  ShoppingBag,
  Smile,
  Sparkles,
  Truck,
  Tv,
  WandSparkles,
}

const icon = computed(() => icons[props.name])
</script>

<template>
  <component
    :is="icon"
    :size="size"
    :stroke-width="strokeWidth"
    aria-hidden="true"
  />
</template>
