import { Crawler } from './crawler'

jest.setTimeout(30_000)

describe('crawler', () => {
  it('should crawl without error', async () => {
    const crawler = new Crawler()
    console.log('starting crawler')
    await crawler.crawl('Functor', 2, 4, (graph) => console.log(graph))
    console.log('crawler done')
  })
})
