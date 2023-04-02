import { config } from '../env'
import { Crawler } from './crawler'

jest.setTimeout(30_000)

describe('crawler', () => {
  it('should crawl without error', async () => {
    const crawler = new Crawler()
    console.log('starting crawler')
    await crawler.crawl('Functor', {
      depth: config.CRAWL_DEFAULT_DEPTH,
      branchingFactor: config.CRAWL_DEFAULT_BRANCHING_FACTOR,
      callback: (graph) => console.log(graph),
    })
    console.log('crawler done')
  })
})
