import logging

from wikiviz.pipelines import PyVisPipeline
from wikiviz.process import run_crawler_process


def handler(event, context):
    logging.debug(event)
    logging.debug(context)

    logging.debug(event)

    wikid = event["pathParameters"]["wikid"]
    branching_factor = int(event["queryStringParameters"]["branching_factor"])

    start_url = f"https://en.wikipedia.org/wiki/{wikid}"

    run_crawler_process(start_url, branching_factor)
