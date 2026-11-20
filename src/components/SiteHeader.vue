<template>
  <nav class="nav">
    <div class="nav-inner">
      <RouterLink class="logo" to="/#top">刘亿照<span>.sec</span></RouterLink>
      <ul class="nav-links">
        <li v-for="link in links" :key="link.id"><RouterLink :to="`/#${link.id}`">{{ link.label }}</RouterLink></li>
      </ul>
    </div>
  </nav>
</template>
<script setup lang="ts">
const links = [{ id: 'about', label: '关于' }, { id: 'skills', label: '擅长' }, { id: 'works', label: '作品' }, { id: 'contact', label: '联系' }]
</script>
