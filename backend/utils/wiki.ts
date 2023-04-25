import cheerio from 'cheerio'
import { URL } from 'url'
import { fetchDataWithRetries } from './fetchWithBackoff'
import { LoggerFactory } from './logger'
import { PageData } from './pagedata'

const TEXT_NODE_TYPE = 3

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

  const summary = $('div.mw-parser-output')
    .find('*')
    .contents()
    .filter(
      (_, el) => el.nodeType === TEXT_NODE_TYPE && el.data.trim().length > 0,
    )
    .first()
    .text()
    .trim()

  let mainImage: string | undefined
  const infobox = $('table.infobox').first()
  if (infobox.length > 0) {
    const tbody = infobox.find('tbody').first()
    mainImage = tbody.find('img').first().attr('src')
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
