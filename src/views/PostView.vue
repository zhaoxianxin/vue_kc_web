<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/github-dark.css'
import { api } from '../api'
import type { Post } from '../api/types'
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('json', json)
const route = useRoute()
const post = ref<Post>()
const loading = ref(true)
const error = ref('')
const categories = { reverse: '逆向项目', review: '安全复盘', tools: '工具源码' }
const categoryName = computed(() => post.value ? categories[post.value.entry.category] : '作品')
const html = computed(() => {
  if (!post.value) return ''
  const parsed = marked.parse(post.value.markdown, { gfm: true, async: false })
  const doc = new DOMParser().parseFromString(DOMPurify.sanitize(parsed), 'text/html')
  doc.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || ''
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) img.src = '/works/posts/' + src.replace(/^\.\//, '')
  })
  doc.querySelectorAll('a[href^="http"]').forEach(a => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer') })
  doc.querySelectorAll<HTMLElement>('pre code').forEach(block => hljs.highlightElement(block))
  return doc.body.innerHTML
})
let controller: AbortController | undefined
async function load() {
  controller?.abort(); controller = new AbortController()
  const current = controller
  loading.value = true; error.value = ''; post.value = undefined
  const id = typeof route.query.post === 'string' ? route.query.post : ''
  if (!id) { error.value = '缺少文章参数'; loading.value = false; return }
  try {
    post.value = await api.post(id, current.signal)
    document.title = `${post.value.entry.title} | 刘亿照`
    document.querySelector('meta[name="description"]')?.setAttribute('content', post.value.entry.desc)
  } catch (cause) {
    if (!current.signal.aborted) error.value = cause instanceof Error ? cause.message : '文章加载失败'
  } finally { if (!current.signal.aborted) loading.value = false }
}
watch(() => route.query.post, load, { immediate: true })
onBeforeUnmount(() => controller?.abort())
</script>
<template>
  <main><article class="post-wrap"><div class="container">
    <nav class="crumbs" aria-label="面包屑"><RouterLink to="/">首页</RouterLink><span class="sep">/</span>
      <RouterLink :to="post ? `/works/${post.entry.category}.html` : '/#works'">{{ categoryName }}</RouterLink><span class="sep">/</span>
      <span aria-current="page">{{ post?.entry.title || (loading ? '加载中…' : '文章') }}</span>
    </nav>
    <header v-if="post" class="post-head">
      <p class="eyebrow"><span class="dot"></span>{{ categoryName }} · {{ post.entry.id.toUpperCase() }}</p>
      <h1 class="page-title">{{ post.entry.title }}</h1>
      <div class="post-meta"><span>{{ post.entry.date }}</span><div class="tags"><span v-for="tag in post.entry.tags" :key="tag" class="tag">{{ tag }}</span></div></div>
    </header>
    <div v-if="loading" class="loading" role="status">加载中</div>
    <div v-else-if="error" class="empty" role="alert">{{ error }}</div>
    <div v-else class="post-body" v-html="html"></div>
    <div class="post-foot"><RouterLink class="btn btn-ghost" to="/#works">← 返回作品收录</RouterLink></div>
  </div></article></main>
</template>
<style scoped>.btn{display:inline-flex;padding:12px 24px;border-radius:999px;font-size:.92rem;font-weight:600;text-decoration:none;border:1px solid var(--line);background:rgba(255,255,255,.03);}.btn:hover{border-color:rgba(0,229,160,.5);color:var(--accent);}</style>
