import scrapy

from wikiviz.items import EdgeItem
from wikiviz.utils.crawling.wikipedia_path_filter import WikipediaPathFilter
from wikiviz.utils.crawling.path_sampler import PathSampler
from wikiviz.utils.parsing.wikipedia_parser import WikipediaParser


class WikipediaSpider(scrapy.Spider):
    name = "wikipedia"
    allowed_domains = ["en.wikipedia.org"]
    start_urls = ["https://en.wikipedia.org/wiki/Salix_bebbiana"]

    custom_settings = {"CLOSESPIDER_ITEMCOUNT": 100}

    def __init__(self, name=None, start_url=None, branching_factor=4, **kwargs):
        super().__init__(name, **kwargs)

        self.name = name
        self.start_url = start_url
        self.branching_factor = branching_factor

        self.start_urls = [start_url] if start_url else self.start_urls

        self.wid = start_url.split("/wiki/")[-1]

        self.filter = WikipediaPathFilter()
        self.sampler = PathSampler(branching_factor)

    def parse(self, response):
        self.filter.visit(response.url)

        parsed = WikipediaParser(response)
        source = parsed.get_title_from_url()

        urls = self.get_next_urls(parsed.get_urls())
        for url in urls:
            yield scrapy.Request(url, callback=self.parse)

            dest = parsed.get_title_from_url(url)

            item = EdgeItem()
            item["source"] = source
            item["dest"] = dest

            yield item

    def get_next_urls(self, urls):
        filtered_urls = filter(self.filter.should_allow, urls)

        sampled_urls = self.sampler.sample(filtered_urls)

        return sampled_urls
