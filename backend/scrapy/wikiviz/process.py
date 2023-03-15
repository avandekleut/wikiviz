from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from wikiviz.spiders.wikipedia import WikipediaSpider


def run_crawler_process(
    start_url='https://en.wikipedia.org/wiki/Functor',
    branching_factor=4
):
    # override project-level settings with params
    settings = get_project_settings()

    process = CrawlerProcess(settings)

    settings['CLOSESPIDER_ITEMCOUNT'] = 100

    # override spider-level attributes with params
    process.crawl(WikipediaSpider,
                  start_url=start_url,
                  branching_factor=branching_factor,
                  filepath='out.html'
                  )

    process.start()


def handler(event, context):
    run_crawler_process()
