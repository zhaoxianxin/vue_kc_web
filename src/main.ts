import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

async function bootstrap() {
  document.documentElement.classList.add('js')
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
  }
  createApp(App).use(router).mount('#app')
}
bootstrap().catch(error => {
  console.error(error)
  const root = document.getElementById('app')!
  root.textContent = '页面初始化失败，请刷新重试。'
})
