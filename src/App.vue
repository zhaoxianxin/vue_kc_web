<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import './styles/works.css'
const route = useRoute()
const home = computed(() => route.path === '/' || route.path === '/index.html')
</script>
<template>
  <div :class="['site-shell', { 'home-page': home }]">
    <SiteHeader />
    <RouterView v-slot="{ Component }"><component :is="Component" :key="route.fullPath.split('#')[0]" /></RouterView>
    <SiteFooter />
  </div>
</template>
