import { http, HttpResponse, delay } from 'msw'
import worksData from './data/works.json'
import markdown from './data/writeup_wyy.md?raw'
import type { Work } from '../api/types'

const entries = worksData.entries as Work[]
export const handlers = [
  http.get('*/api/profile', async () => {
    await delay(120)
    return HttpResponse.json({ data: { name: '刘亿照', directions: ['Web 安全', '渗透测试', 'JavaScript 逆向', '自动化脚本 / 爬虫'] } })
  }),
  http.get('*/api/works', async ({ request }) => {
    await delay(200)
    const category = new URL(request.url).searchParams.get('category')
    if (category && !['reverse', 'review', 'tools'].includes(category)) {
      return HttpResponse.json({ message: '无效的作品分类' }, { status: 400 })
    }
    return HttpResponse.json({ data: entries.filter(entry => !category || entry.category === category) })
  }),
  http.get('*/api/posts/:id', async ({ params }) => {
    await delay(200)
    const entry = entries.find(item => item.id === params.id)
    if (!entry) return HttpResponse.json({ message: '未找到该文章' }, { status: 404 })
    if (entry.draft) return HttpResponse.json({ message: '该文章正在整理中' }, { status: 409 })
    return HttpResponse.json({ data: { entry, markdown } })
  }),
]
