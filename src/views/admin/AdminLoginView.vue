<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LockKeyhole, Mail } from '@lucide/vue'
import { currentAdmin } from '@/services/adminAuth'
import { getSupabaseClient } from '@/services/supabase'

const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')
const errorMessage = ref('')
const unauthorized = computed(() => route.query.reason === 'unauthorized')

async function login() {
  loading.value = true
  message.value = ''
  errorMessage.value = ''
  try {
    const { error } = await getSupabaseClient().auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    })
    if (error) throw error

    if (!await currentAdmin()) {
      await getSupabaseClient().auth.signOut()
      errorMessage.value = 'Esta conta não possui acesso administrativo.'
      return
    }

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
    await router.replace(redirect)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível entrar.'
  } finally {
    loading.value = false
  }
}

async function recoverPassword() {
  errorMessage.value = ''
  message.value = ''
  if (!email.value.trim()) {
    errorMessage.value = 'Informe o e-mail para receber a recuperação.'
    return
  }

  loading.value = true
  try {
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email.value.trim(), {
      redirectTo: `${window.location.origin}/admin/definir-senha`,
    })
    if (error) throw error
    message.value = 'Se a conta existir, o Supabase enviará as instruções de recuperação.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao solicitar recuperação.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="admin-login section container">
    <div class="login-card">
      <div class="login-icon"><LockKeyhole :size="30" /></div>
      <h1>Painel administrativo</h1>
      <p>Entre com a conta autorizada para manter o catálogo.</p>

      <p v-if="unauthorized" class="feedback error" role="alert">Sua sessão não possui permissão de administrador.</p>
      <p v-if="errorMessage" class="feedback error" role="alert">{{ errorMessage }}</p>
      <p v-if="message" class="feedback success" role="status">{{ message }}</p>

      <form @submit.prevent="login">
        <label>
          E-mail
          <span class="field"><Mail :size="18" /><input v-model="email" type="email" autocomplete="username" required></span>
        </label>
        <label>
          Senha
          <span class="field"><LockKeyhole :size="18" /><input v-model="password" type="password" autocomplete="current-password" required minlength="8"></span>
        </label>
        <button class="btn" type="submit" :disabled="loading">{{ loading ? 'Entrando…' : 'Entrar' }}</button>
        <button class="recover" type="button" :disabled="loading" @click="recoverPassword">Esqueci minha senha</button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.admin-login{display:grid;place-items:center;min-height:62vh}
.login-card{width:min(440px,100%);padding:32px;border:1px solid var(--line);border-radius:22px;background:#fff;box-shadow:var(--shadow)}
.login-icon{width:54px;height:54px;display:grid;place-items:center;margin:auto;border-radius:16px;background:var(--pink-soft);color:var(--pink)}
h1{text-align:center;margin:16px 0 6px;font-size:27px}p{text-align:center;color:var(--muted);margin:0 0 22px}
form{display:grid;gap:15px}label{display:grid;gap:6px;font-size:13px;font-weight:850}.field{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:10px;padding:0 12px;color:var(--muted)}
.field:focus-within{border-color:var(--pink);box-shadow:0 0 0 3px var(--pink-soft)}input{width:100%;border:0;outline:0;padding:12px 0;background:transparent}.btn{width:100%;border-radius:10px}.btn:disabled,.recover:disabled{opacity:.55}
.recover{border:0;background:transparent;color:var(--pink-dark);font-weight:800;cursor:pointer}.feedback{padding:10px;border-radius:9px;font-size:13px}.feedback.error{color:#91243d;background:#fff0f3}.feedback.success{color:#146c43;background:#eaf9f1}
</style>
