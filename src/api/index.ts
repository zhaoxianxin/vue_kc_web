import type { ApiResponse, Category, Post, Profile, Work } from './types'

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message) }
}
async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(body.message || '数据加载失败，请稍后再试', response.status)
  }
  const body: ApiResponse<T> = await response.json()
  return body.data
}
export const api = {
  profile: (signal?: AbortSignal) => request<Profile>('/profile', signal),
  works: (category: Category, signal?: AbortSignal) => request<Work[]>(`/works?category=${category}`, signal),
  post: (id: string, signal?: AbortSignal) => request<Post>(`/posts/${encodeURIComponent(id)}`, signal),
}
