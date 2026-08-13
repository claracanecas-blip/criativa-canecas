<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { KeyRound } from '@lucide/vue'
import { getSupabaseClient } from '@/services/supabase'

const router = useRouter()
const password = ref('')
const confirmation = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function savePassword() {
  errorMessage.value = ''
  if (password.value.length < 10) {
    errorMessage.value = 'Use pelo menos 10 caracteres.'
    return
  }
  if (password.value !== confirmation.value) {
    errorMessage.value = 'As senhas não coincidem.'
    return
  }

  loading.value = true
  try {
    const { error } = await getSupabaseClient().auth.updateUser({ password: password.value })
    if (error) throw error
    await router.replace('/admin')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível definir a senha.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="password-page section container">
    <form class="password-card" @submit.prevent="savePassword">
      <div class="icon"><KeyRound :size="30" /></div>
      <h1>Defina sua senha</h1>
      <p>Crie uma senha exclusiva para o painel administrativo.</p>
      <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
      <label>Nova senha<input v-model="password" type="password" autocomplete="new-password" minlength="10" required></label>
      <label>Confirmar senha<input v-model="confirmation" type="password" autocomplete="new-password" minlength="10" required></label>
      <button class="btn" type="submit" :disabled="loading">{{ loading ? 'Salvando…' : 'Salvar senha e entrar' }}</button>
    </form>
  </section>
</template>

<style scoped>
.password-page{display:grid;place-items:center;min-height:62vh}.password-card{width:min(440px,100%);display:grid;gap:14px;padding:32px;border:1px solid var(--line);border-radius:22px;background:#fff;box-shadow:var(--shadow)}.icon{width:54px;height:54px;display:grid;place-items:center;margin:auto;border-radius:16px;background:var(--pink-soft);color:var(--pink)}h1{text-align:center;margin:2px 0 0;font-size:27px}p{text-align:center;color:var(--muted);margin:0 0 4px}label{display:grid;gap:6px;font-size:13px;font-weight:850}input{border:1px solid var(--line);border-radius:10px;padding:12px}input:focus{outline:2px solid #f5a8c1;outline-offset:1px}.btn{width:100%;border-radius:10px}.error{padding:10px;border-radius:9px;color:#91243d;background:#fff0f3;font-size:13px}
</style>
