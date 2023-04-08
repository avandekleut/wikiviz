import { Crawler } from './crawler'
import { LoggerFactory } from './logger'

// jest.setTimeout(30_000)

// describe('crawler', () => {
//   it('should crawl without error', async () => {
//     const crawler = new Crawler()
//     console.log('starting crawler')
//     await crawler.crawl('Functor', {
//       depth: 1,
//       branchingFactor: 10,
//       callback: (pageData) => console.log(pageData),
//     })
//     console.log('crawler done')
//   })
// })

async function main() {
  const crawler = new Crawler()
  LoggerFactory.logger.debug({ msg: 'starting crawler' })
  const depth = 2
  const branchingFactor = 10
  await crawler.crawl('Functor', {
    depth,
    branchingFactor,
    callback: (pageData) => LoggerFactory.logger.info(pageData),
  })
  LoggerFactory.logger.debug({ msg: 'crawler done' })
  LoggerFactory.logger.debug({
    expected: 1 + branchingFactor ** depth,
    actual: crawler.numVisited,
  })
}

if (require.main === module) {
  main()
}
