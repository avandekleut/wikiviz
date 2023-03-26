import logging

from wikiviz.process import run_crawler_process

# TODO: Determine how to get result from pipeline in-memory? Or maybe use presigned url
global_result = {"html": ""}


def handler(event, context):
    logging.debug(event)
    logging.debug(context)

    logging.debug(event)

    wikid = event["pathParameters"]["wikid"]
    branching_factor = int(event["queryStringParameters"]["branching_factor"])

    start_url = f"https://en.wikipedia.org/wiki/{wikid}"

    run_crawler_process(start_url, branching_factor)

    return {
        "statusCode": 200,
        "body": global_result["html"],
        "headers": {"content-type": "text/html", "content-disposition": "inline"},
    }
