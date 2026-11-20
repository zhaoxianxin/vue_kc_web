<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { api } from '../api'
import type { Category, Work } from '../api/types'
import { useReveal } from '../composables/useReveal'
const props = defineProps<{ category: Category }>()
const info = {
  reverse: { title: '逆向项目', label: '01 / REVERSE', desc: 'JS 反混淆、反调试绕过与接口签名还原的实践记录，包含分析思路与关键代码片段。' },
  review: { title: '安全复盘', label: '02 / REVIEW', desc: '漏洞挖掘过程、渗透测试笔记与 CTF 题目复盘，记录从信息收集到验证的完整链路。' },
  tools: { title: '工具源码', label: '03 / TOOLS', desc: '自写的爬虫、自动化脚本与安全工具源码，注重实用性与可复用性。' },
}
const page = computed(() => info[props.category])
const entries = ref<Work[]>([])
const loading = ref(true)
const error = ref('')
const root = ref<HTMLElement>()
const toast = ref('')
const observe = useReveal(root)
let controller: AbortController | undefined
let timer: ReturnType<typeof setTimeout> | undefined
async function load() {
  controller?.abort()
  controller = new AbortController()
  const current = controller
  loading.value = true; error.value = ''
  try {
    entries.value = await api.works(props.category, current.signal)
    loading.value = false
    await nextTick(); observe()
  } catch (cause) {
    if (!current.signal.aborted) { error.value = cause instanceof Error ? cause.message : '数据加载失败'; loading.value = false }
  }
}
watch(() => props.category, () => {
  document.title = `${page.value.title} | 刘亿照`
  document.querySelector('meta[name="description"]')?.setAttribute('content', page.value.desc)
  void load()
}, { immediate: true })
function openDraft(event: MouseEvent, entry: Work) {
  if (!entry.draft) return
  event.preventDefault()
  toast.value = '该条目正在整理中，稍后上线'
  clearTimeout(timer); timer = setTimeout(() => { toast.value = '' }, 1800)
}
onBeforeUnmount(() => { controller?.abort(); clearTimeout(timer) })
</script>
<template>
  <div ref="root">
    <header class="page-head"><div class="container">
      <nav class="crumbs" aria-label="面包屑"><RouterLink to="/">首页</RouterLink><span class="sep">/</span><span aria-current="page">{{ page.title }}</span></nav>
      <p class="eyebrow"><span class="dot"></span>WORKS · {{ page.label }}</p>
      <h1 class="page-title">{{ page.title }}</h1><p class="lead">{{ page.desc }}</p>
    </div></header>
    <main><section class="section"><div class="container"><div class="entry-list" :aria-busy="loading">
      <div v-if="loading" class="loading" role="status">加载中…</div>
      <div v-else-if="error" class="empty" role="alert">{{ error }} <button class="retry" @click="load">重试</button></div>
      <div v-else-if="!entries.length" class="empty">作者还没有部署任何项目</div>
      <RouterLink v-for="(entry, i) in entries" v-else :key="entry.id" custom
        :to="entry.draft ? `/works/${entry.href}` : `/works/detail.html?post=${encodeURIComponent(entry.id)}`" v-slot="{ href, navigate }">
        <a class="entry reveal" :href="href" @click="entry.draft ? openDraft($event, entry) : navigate($event)">
        <span class="entry-num">{{ String(i + 1).padStart(2, '0') }}</span>
        <div class="entry-body"><h3>{{ entry.title }} <span v-if="entry.draft" class="badge">整理中</span></h3><p>{{ entry.desc }}</p>
          <div class="entry-tags"><span v-for="tag in entry.tags" :key="tag" class="tag">{{ tag }}</span></div>
        </div><span class="entry-arrow" aria-hidden="true">→</span>
        </a>
      </RouterLink>
    </div></div></section></main>
    <div class="toast" :class="{ show: toast }" role="status">{{ toast }}</div>
  </div>
</template>
<style scoped>.retry{background:none;border:0;color:var(--accent);font:inherit;cursor:pointer;text-decoration:underline;}</style>
