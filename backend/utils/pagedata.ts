import wiki from 'wikijs'

export interface PageData {
  wikid: string
  summary: string
  mainImage: string
  links: string[]
}

export async function getPageData(wikid: string): Promise<PageData> {
  const page = await wiki().page(wikid)
  const summary = await page.summary()
  const mainImage = await page.mainImage()
  const links = await page.links()

  return {
    wikid,
    summary,
    mainImage,
    links,
  }
}
