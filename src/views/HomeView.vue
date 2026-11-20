<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { api } from '../api'
import type { Profile } from '../api/types'
import { useReveal } from '../composables/useReveal'

const root = ref<HTMLElement>()
const profile = ref<Profile>({ name: '刘亿照', directions: [] })
const typed = ref('')
const controller = new AbortController()
let timer: ReturnType<typeof setTimeout> | undefined
useReveal(root)
onMounted(async () => {
  document.title = '刘亿照 | 网络工程 · Web 安全 · 逆向分析'
  document.querySelector('meta[name="description"]')?.setAttribute('content', '刘亿照，网络工程在读，专注 Web 安全、渗透测试与 JavaScript 逆向实践。')
  try {
    profile.value = await api.profile(controller.signal)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typed.value = profile.value.directions[0] ?? ''; return
    }
    let pi = 0, ci = 0, deleting = false
    const tick = () => {
      const phrases = profile.value.directions
      if (!phrases.length) return
      const current = phrases[pi]!
      ci += deleting ? -1 : 1
      typed.value = current.slice(0, ci)
      let wait = deleting ? 55 : 110
      if (!deleting && ci === current.length) { deleting = true; wait = 1600 }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; wait = 320 }
      timer = setTimeout(tick, wait)
    }
    timer = setTimeout(tick, 500)
  } catch (error) {
    if (!controller.signal.aborted) typed.value = 'Web 安全'
  }
})
onBeforeUnmount(() => { controller.abort(); clearTimeout(timer) })
</script>

<template>
<div ref="root">
<header id="top" class="hero">
  <div class="container hero-grid">
    <div>
      <p class="eyebrow"><span class="dot"></span>河南开封科技传媒学院 · 网络工程</p>
      <h1>{{ profile.name }}</h1>
      <p class="typed-line">主攻方向：<span class="typed" id="typed">{{ typed }}</span></p>
      <p class="lead">
        网络工程在读，专注 Web 安全、渗透测试与 JavaScript 逆向实践。
        擅长反调试绕过、接口签名分析、自动化脚本与爬虫开发，参与 CTF 攻防练习。
      </p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#works">查看收录内容</a>
        <a class="btn btn-ghost" href="#contact">联系我</a>
      </div>
    </div>
    <div class="terminal" aria-hidden="true">
      <div class="terminal-bar"><i></i><i></i><i></i><em>zsh — liuyizhao</em></div>
<pre class="terminal-body"><span class="p">$</span> whoami
刘亿照
<span class="p">$</span> cat school.txt
河南开封科技传媒学院 · 网络工程
<span class="p">$</span> ls ./focus
渗透测试  Web安全  逆向分析  爬虫开发
<span class="p">$</span> cat stack.txt
逆向分析 / 自动化脚本 / 接口签名
<span class="p">$</span> ./start.sh --ctf --learn
<span class="p">[ok]</span> ready to learn & build...</pre>
    </div>
  </div>
</header>
<main>
  <!-- ============ 01 关于我 ============ -->
  <section id="about" class="section">
    <div class="container">
      <h2 class="section-title reveal"><span>01</span>关于我</h2>
      <p class="about-text reveal">
        我习惯从抓包与调试入手，拆解网站前端防护逻辑，研究混淆 JavaScript、加密接口签名。日常练习 Web 漏洞验证与 CTF 攻防，会把分析过程整理成笔记、文档和可运行代码。
      </p>
      <p class="about-text reveal">
        本作品集用来存放我的逆向项目、安全复盘以及自研工具源码，记录个人技术成长，欢迎同好交流探讨。
      </p>
      <dl class="facts reveal">
        <div class="fact">
          <dt>NAME</dt>
          <dd>刘亿照</dd>
        </div>
        <div class="fact">
          <dt>SCHOOL</dt>
          <dd>河南开封科技传媒学院</dd>
        </div>
        <div class="fact">
          <dt>MAJOR</dt>
          <dd>网络工程</dd>
        </div>
        <div class="fact">
          <dt>STATUS</dt>
          <dd>持续学习中 · 开放交流</dd>
        </div>
      </dl>
    </div>
  </section>
  <!-- ============ 02 擅长领域 ============ -->
  <section id="skills" class="section">
    <div class="container">
      <h2 class="section-title reveal"><span>02</span>擅长领域</h2>
      <div class="cards">
        <article class="card reveal">
          <div class="card-icon">&lt;/&gt;</div>
          <h3>逆向分析</h3>
          <p>JavaScript 逆向与混淆代码还原，反调试绕过、环境检测对抗，接口签名算法分析与复现。</p>
        </article>
        <article class="card reveal">
          <div class="card-icon">WAF</div>
          <h3>Web 渗透</h3>
          <p>常见 Web 漏洞的挖掘与验证，信息收集、攻击面梳理，渗透测试流程执行与报告整理。</p>
        </article>
        <article class="card reveal">
          <div class="card-icon">&gt;_</div>
          <h3>自动化脚本</h3>
          <p>使用 Python / Node.js 编写爬虫与自动化工具，实现批量采集、数据处理与流程自动化。</p>
        </article>
      </div>
      <div class="tags reveal">
        <span class="tag">渗透测试</span>
        <span class="tag">Web 安全</span>
        <span class="tag">JS 逆向</span>
        <span class="tag">反调试绕过</span>
        <span class="tag">接口签名分析</span>
        <span class="tag">爬虫开发</span>
        <span class="tag">自动化脚本</span>
        <span class="tag">CTF 攻防</span>
      </div>
    </div>
  </section>
  <!-- ============ 03 作品收录 ============ -->
  <section id="works" class="section">
    <div class="container">
      <h2 class="section-title reveal"><span>03</span>作品收录</h2>
      <div class="cards">
        <!-- 卡片用 a.card-link，href为预留锚点，后续替换为子页面真实地址 -->
        <RouterLink class="card-link reveal" to="/works/reverse.html">
          <article class="card">
            <div class="card-icon">01</div>
            <h3>逆向项目</h3>
            <p>JS 反混淆、反调试绕过与接口签名还原的实践记录，包含分析思路与关键代码片段。</p>
          </article>
        </RouterLink>
        <RouterLink class="card-link reveal" to="/works/review.html">
          <article class="card">
            <div class="card-icon">02</div>
            <h3>安全复盘</h3>
            <p>漏洞挖掘过程、渗透测试笔记与 CTF 题目复盘，记录从信息收集到验证的完整链路。</p>
          </article>
        </RouterLink>
        <RouterLink class="card-link reveal" to="/works/tools.html">
          <article class="card">
            <div class="card-icon">03</div>
            <h3>工具源码</h3>
            <p>自写的爬虫、自动化脚本与安全工具源码，注重实用性与可复用性。</p>
          </article>
        </RouterLink>
      </div>
    </div>
  </section>
  <!-- ============ 04 联系 ============ -->
  <section id="contact" class="section">
    <div class="container">
      <div class="contact-card reveal">
        <h2>期待和同好交流</h2>
        <p>无论是逆向项目、安全复盘还是工具源码，都欢迎一起探讨。</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="mailto:abcd18338376325@qq.com">发送邮件</a>
          <a class="btn btn-ghost" href="https://github.com/YoFuTong" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
    </div>
  </section>
</main>
</div>
</template>
<style scoped src="../styles/home.css"></style>
