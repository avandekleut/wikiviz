export interface PageData {
  wikid: string
  summary: string
  mainImage?: string
  children: string[]
  crawlInfo?: {
    depth: number
  }
}
