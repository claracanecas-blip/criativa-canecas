import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { reportClientError, routeGroup } from '@/services/analytics'
import './assets/styles.css'

const app = createApp(App)

app.config.errorHandler = (error, _instance, info) => {
  reportClientError('vue_render', routeGroup(router.currentRoute.value.name))
  console.error('Erro de renderização Vue', { error, info })
}

window.addEventListener('error', () => {
  reportClientError('unhandled_error', routeGroup(router.currentRoute.value.name))
})

window.addEventListener('unhandledrejection', () => {
  reportClientError('unhandled_rejection', routeGroup(router.currentRoute.value.name))
})

app.use(router).mount('#app')
