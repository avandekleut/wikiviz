import { Crawler } from './crawler'

;(async () => {
  const crawler = new Crawler()
  console.log('starting crawler')
  await crawler.crawl('Functor', 2, 4, (graph) => console.log(graph))
  console.log('crawler done')
})()
