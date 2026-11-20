import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', alias: '/index.html', component: HomeView },
    ...(['reverse', 'review', 'tools'] as const).map(category => ({
      path: `/works/${category}.html`, component: () => import('./views/WorksView.vue'), props: { category },
    })),
    { path: '/works/detail.html', component: () => import('./views/PostView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('./views/NotFoundView.vue') },
  ],
  async scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})
