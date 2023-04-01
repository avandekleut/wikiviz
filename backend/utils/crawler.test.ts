import { Crawler } from './crawler'

jest.setTimeout(30_000)

describe('crawler', () => {
  it('should crawl without error', async () => {
    const crawler = new Crawler()
    console.log('starting crawler')
    await crawler.crawl('Functor', {
      depth: 2,
      branchingFactor: 4,
      callback: (graph) => console.log(graph),
    })
    console.log('crawler done')
  })
})
