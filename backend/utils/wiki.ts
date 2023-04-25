import cheerio from 'cheerio'
import { URL } from 'url'
import { fetchDataWithRetries } from './fetchWithBackoff'
import { LoggerFactory } from './logger'
import { PageData } from './pagedata'

// TODO: remove this
const apiKey =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJmOGVjZGUxMzFkY2Q1Y2E5ZDJlNjZlNmU4YzEzZjExMiIsImp0aSI6Ijg5ZjY5OTc0YmQ4M2FhNzgwMzg1ODlhMmEzZWEwZDhjNTgwNDE2YzBkMmYzNjlhYzg3Njk4YjQyMzdhZTNhYmM0ZWZhYjZiOGRkNGRkY2IxIiwiaWF0IjoxNjgwMzY1MjAwLjgxOTY5MiwibmJmIjoxNjgwMzY1MjAwLjgxOTY5NiwiZXhwIjozMzIzNzI3NDAwMC44MTc2ODQsInN1YiI6IjcyNDQwMjU1IiwiaXNzIjoiaHR0cHM6Ly9tZXRhLndpa2ltZWRpYS5vcmciLCJyYXRlbGltaXQiOnsicmVxdWVzdHNfcGVyX3VuaXQiOjUwMDAsInVuaXQiOiJIT1VSIn0sInNjb3BlcyI6WyJiYXNpYyJdfQ.lvZwHn9hqvOGG0Mys6p47SZ1r_f-0OQmc2-fy9QxR0Gim7TpV6YHCcvPtXn_XYW5V21kAfpoPS4CAnmx7jzeG-3vN3mrgvxq8gHjmPY0v3po6JYuFEPocStklCEg7prYcFrup968KrFC1LbLQDjQ3a_0l-XYyplF3LG7obM0PXY0DEyA9uCRNHbBlI0kDYIikdl0XBehfKbqCOK9TsvegMt3iZZ3rNVH-UgFNqMJIg1m6kfcMdQOWmh6kVoSmF2BXBgWsnGvzJg-lcAS6rflYtAOCSTQYnIpK23Z-3-U7XReRvRhLr0uxR6wzeP0uuoG2XtDwuUKS86BxD9eNVNCj1ilKmZrNY5M-daAU1yEp1qIuTM0I3TO8BBrQPs0RL5vtOo75ZS5zcFlfdRoxcrRNS8qDkoGZz-8TbIy0J3JFmynBBNpBTxIFccFmXUxkocFPEXOjD7v7IzBiQhTRtSQsMV3TQDlCoS6sU6Qus1krL3EOK7zTvED5Apx7H_lmz73mH2skwzWiEyCHrdIJo3tzIbrjiK65OpZSCcdiCuTkZkWLsJNfIpmrdmBhouCFSAfIhhiBC2bbVa7yAdJakXI97ZKOFXbr7ilBjCNECwf41faTFOs29M5wWcpZiAxKhtyGg8thZzhCLR4ab47hrFVzDhGIINH5GI9RhnYIy5kYRY'
export async function wikipediaSummaryAndLinks(
  title: string,
): Promise<PageData> {
  LoggerFactory.logger.debug(`Fetching ${title}`)

  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${title}&prop=text&format=json&section=0&redirects=true&origin=*`

  const response = await fetchDataWithRetries(url)

  let json: any
  try {
    json = await response.json()
  } catch (err) {
    LoggerFactory.logger.error({
      response,
      err,
      body: response.body,
      status: response.status,
      msg: `Failed to parse response`,
    })
    throw err
  }
  const html = json.parse.text['*']
  const $ = cheerio.load(html)

  const summary = $('div.mw-parser-output p').first().text().trim()

  let mainImage: string | undefined
  const infobox = $('table.infobox').first()
  if (infobox.length > 0) {
    mainImage = infobox.find('img').first().attr('src')
  }

  const childArticles = $('div.mw-parser-output a[href^="/wiki/"]')
    .toArray()
    .map((elem) => $(elem).attr('href'))
    .filter((href): href is string => href !== undefined)
    .filter((href) => !href.includes(':')) // talk pages, categories
    .map((href) => new URL(href, 'https://en.wikipedia.org').pathname) // remove anchors, etc
    .map((href) => href.replace('/wiki/', '')) // get title from url path /wiki/<title>

  return { wikid: title, summary, mainImage, children: childArticles }
}
