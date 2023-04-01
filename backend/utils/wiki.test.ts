import { wikipediaSummaryAndLinks } from './wiki'

jest.setTimeout(30_000)

describe('wiki', () => {
  it('should get summary and links', async () => {
    console.time('wikipediaSummaryAndLinks')
    const { summary, links } = await wikipediaSummaryAndLinks({
      title: 'Functor',
      numLinks: 4,
    })
    console.timeEnd('wikipediaSummaryAndLinks')
    console.log({ summary, links })
  })
})
