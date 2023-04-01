import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

const API_KEY =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJmOGVjZGUxMzFkY2Q1Y2E5ZDJlNjZlNmU4YzEzZjExMiIsImp0aSI6Ijg5ZjY5OTc0YmQ4M2FhNzgwMzg1ODlhMmEzZWEwZDhjNTgwNDE2YzBkMmYzNjlhYzg3Njk4YjQyMzdhZTNhYmM0ZWZhYjZiOGRkNGRkY2IxIiwiaWF0IjoxNjgwMzY1MjAwLjgxOTY5MiwibmJmIjoxNjgwMzY1MjAwLjgxOTY5NiwiZXhwIjozMzIzNzI3NDAwMC44MTc2ODQsInN1YiI6IjcyNDQwMjU1IiwiaXNzIjoiaHR0cHM6Ly9tZXRhLndpa2ltZWRpYS5vcmciLCJyYXRlbGltaXQiOnsicmVxdWVzdHNfcGVyX3VuaXQiOjUwMDAsInVuaXQiOiJIT1VSIn0sInNjb3BlcyI6WyJiYXNpYyJdfQ.lvZwHn9hqvOGG0Mys6p47SZ1r_f-0OQmc2-fy9QxR0Gim7TpV6YHCcvPtXn_XYW5V21kAfpoPS4CAnmx7jzeG-3vN3mrgvxq8gHjmPY0v3po6JYuFEPocStklCEg7prYcFrup968KrFC1LbLQDjQ3a_0l-XYyplF3LG7obM0PXY0DEyA9uCRNHbBlI0kDYIikdl0XBehfKbqCOK9TsvegMt3iZZ3rNVH-UgFNqMJIg1m6kfcMdQOWmh6kVoSmF2BXBgWsnGvzJg-lcAS6rflYtAOCSTQYnIpK23Z-3-U7XReRvRhLr0uxR6wzeP0uuoG2XtDwuUKS86BxD9eNVNCj1ilKmZrNY5M-daAU1yEp1qIuTM0I3TO8BBrQPs0RL5vtOo75ZS5zcFlfdRoxcrRNS8qDkoGZz-8TbIy0J3JFmynBBNpBTxIFccFmXUxkocFPEXOjD7v7IzBiQhTRtSQsMV3TQDlCoS6sU6Qus1krL3EOK7zTvED5Apx7H_lmz73mH2skwzWiEyCHrdIJo3tzIbrjiK65OpZSCcdiCuTkZkWLsJNfIpmrdmBhouCFSAfIhhiBC2bbVa7yAdJakXI97ZKOFXbr7ilBjCNECwf41faTFOs29M5wWcpZiAxKhtyGg8thZzhCLR4ab47hrFVzDhGIINH5GI9RhnYIy5kYRY'

async function fetchWikipediaArticle(title: string): Promise<string> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${encodeURIComponent(
    title,
  )}&redirects=true&exintro=true&utf8=&formatversion=2&origin=*&api_key=${API_KEY}`
  const response = await fetch(url)
  const json = await response.json()
  console.log({ json })
  const extract = (json as any).query.pages[0].extract
  return extract
}

function parseFirstParagraph(html: string): string {
  const $ = cheerio.load(html)
  const text = $('div.mw-parser-output p').first().html()

  if (text === null) {
    throw new Error(`Failed to load text`)
  }
  return text
}

function extractLinks(html: string): string[] {
  const $ = cheerio.load(html)
  const links = $('div.mw-parser-output')
    .find('a')
    .map((i, el) => $(el).attr('href'))
    .get()
    .filter((link) => link?.startsWith('/wiki/'))
    .map((link) => `https://en.wikipedia.org${link}`)
  return links
}

export async function getArticleSummaryAndLinks(
  title: string,
): Promise<{ summary: string; links: string[] }> {
  const article = await fetchWikipediaArticle(title)

  console.log(article)

  const summary = parseFirstParagraph(article)
  const links = extractLinks(article)
  return { summary, links }
}
