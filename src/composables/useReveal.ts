import { onBeforeUnmount, onMounted, type Ref } from 'vue'
export function useReveal(root: Ref<HTMLElement | undefined>) {
  let observer: IntersectionObserver | undefined
  function observe() {
    observer?.disconnect()
    const els = root.value?.querySelectorAll<HTMLElement>('.reveal') ?? []
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible')); return
    }
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer?.unobserve(entry.target) }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    els.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; observer!.observe(el) })
  }
  onMounted(observe)
  onBeforeUnmount(() => observer?.disconnect())
  return observe
}
