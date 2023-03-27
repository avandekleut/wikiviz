import logging

from networkx import Graph
from wikiviz.items import EdgeItem
from wikiviz.spiders.wikipedia import WikipediaSpider
from wikiviz.utils.get_run_name import get_run_name
from wikiviz.utils.network.pipeline import Pipeline


class PyVisPipeline:
    def __init__(self):
        self.network = Graph()
        self.logger = logging.getLogger("PyVisPipeline")
        self.wid: int or None = None

    def open_spider(self, spider: WikipediaSpider):
        self.logger.debug("open_spider")
        self.wid = spider.wid
        self.branching_factor = spider.branching_factor
        pass

    def close_spider(self, spider: WikipediaSpider):
        self.logger.debug("close_spider")
        self.logger.debug(f"total nodes: {len(self.network.nodes)}")

        for num_clusters in range(1, 10):
            self.logger.debug(f"Running pipeline {num_clusters}")
            name = get_run_name(
                wid=self.wid,
                branching_factor=self.branching_factor,
                num_clusters=num_clusters,
            )

            Pipeline(self.network).run(num_clusters, file_name=name)

    def process_item(self, item: EdgeItem, spider: WikipediaSpider):
        self.network.add_edge(item["source"], item["dest"])

        return item
