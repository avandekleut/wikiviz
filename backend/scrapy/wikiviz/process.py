import imp
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from wikiviz.spiders.wikipedia import WikipediaSpider

import json

import sys

import logging
logging.getLogger().setLevel(logging.DEBUG)

# needed for scrapy on lambda
sys.modules["sqlite"] = imp.new_module("sqlite")
sys.modules["sqlite3.dbapi2"] = imp.new_module("sqlite.dbapi2")


def run_crawler_process(
    start_url: str,
    branching_factor: int
):
    # override project-level settings with params
    settings = get_project_settings()

    process = CrawlerProcess(settings)

    settings['CLOSESPIDER_ITEMCOUNT'] = 100
    settings['TELNETCONSOLE_ENABLED'] = False

    # override spider-level attributes with params
    process.crawl(WikipediaSpider,
                  start_url=start_url,
                  branching_factor=branching_factor,
                  filepath='out.html'
                  )

    process.start(stop_after_crawl=False)


def handler(event, context):
    logging.debug(event)
    logging.debug(context)

    for record in event['Records']:
        try:
            logging.debug(record)
            body = json.loads(record["body"])
            wikid = body['wikid']
            branching_factor = int(body['branching_factor'])
            data_path = body['data_path']
            start_url = f'https://en.wikipedia.org/wiki/{wikid}'

            run_crawler_process(start_url, branching_factor)
        except Error as e:
            logger.error(e)
