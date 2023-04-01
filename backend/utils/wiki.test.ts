import { getArticleSummaryAndLinks } from './wiki'

jest.setTimeout(30_000)

describe('wiki', () => {
  it('should get summary and links', async () => {
    console.log('starting')
    const { summary, links } = await getArticleSummaryAndLinks('Functor')
    console.log({ summary, links })
  })
})
