import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
import type { ApiResponse, Work, Post } from '../api/types'

const server = setupServer(...handlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('local mock API contract', () => {
  it('filters each category without leaking other works', async () => {
    for (const category of ['reverse', 'review', 'tools']) {
      const response = await fetch(`http://localhost/api/works?category=${category}`)
      const { data } = await response.json() as ApiResponse<Work[]>
      expect(response.status).toBe(200)
      expect(data.length).toBeGreaterThan(0)
      expect(data.every(work => work.category === category)).toBe(true)
    }
  })
  it('rejects an invalid category', async () => {
    expect((await fetch('http://localhost/api/works?category=invalid')).status).toBe(400)
  })
  it('returns published content, rejects drafts, and handles missing posts', async () => {
    const response = await fetch('http://localhost/api/posts/reverse-wyy')
    const { data } = await response.json() as ApiResponse<Post>
    expect(data.entry.draft).toBe(false)
    expect(data.markdown).toContain('# 网易云搜索接口逆向')
    expect((await fetch('http://localhost/api/posts/reverse-slider')).status).toBe(409)
    expect((await fetch('http://localhost/api/posts/not-found')).status).toBe(404)
  })
})
