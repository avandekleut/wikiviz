from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from wikiviz.spiders.wikipedia import WikipediaSpider


import logging


def run_crawler_process(
    start_url: str,
    branching_factor: int
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
    logging.debug(event)
    logging.debug(context)

    for record in event['Records']:
        logging.debug(record)
        body = record["body"]
        logging.debug(str(body))
        wikid = body['wikid']
        branching_factor = body['branching_factor']
        data_path = body['data_path']
        start_url = f'https://en.wikipedia.org/wiki/{wikid}'

        run_crawler_process(start_url, branching_factor)
