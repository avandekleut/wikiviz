import importlib
import json
import sys

from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from wikiviz.spiders.wikipedia import WikipediaSpider

sys.modules["sqlite"] = importlib.util.module_from_spec(
    importlib.util.spec_from_loader("sqlite", None)
)
sys.modules["sqlite3.dbapi2"] = importlib.util.module_from_spec(
    importlib.util.spec_from_loader("sqlite.dbapi2", None)
)


import logging

logging.getLogger().setLevel(logging.DEBUG)


def run_crawler_process(start_url: str, branching_factor: int):
    # override project-level settings with params
    settings = get_project_settings()

    process = CrawlerProcess(settings)

    settings["CLOSESPIDER_ITEMCOUNT"] = 100
    settings["TELNETCONSOLE_ENABLED"] = False

    # override spider-level attributes with params
    process.crawl(
        WikipediaSpider,
        start_url=start_url,
        branching_factor=branching_factor,
        filepath="out.html",
    )

    process.start()


def handler(event, context):
    logging.debug(event)
    logging.debug(context)

    for record in event["Records"]:
        try:
            logging.debug(record)

            body = json.loads(record["body"])

            wikid = body["wikid"]
            branching_factor = int(body["branching_factor"])

            start_url = f"https://en.wikipedia.org/wiki/{wikid}"

            run_crawler_process(start_url, branching_factor)
        except Exception as e:
            logging.error(e)
