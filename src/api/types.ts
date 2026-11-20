export type Category = 'reverse' | 'review' | 'tools'
export interface Work {
  id: string
  category: Category
  title: string
  desc: string
  tags: string[]
  href: string
  post?: string
  draft: boolean
  date?: string
}
export interface Post { entry: Work; markdown: string }
export interface Profile { name: string; directions: string[] }
export interface ApiResponse<T> { data: T }
