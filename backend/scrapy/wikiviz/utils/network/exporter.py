from networkx import Graph
from pyvis.network import Network

from wikiviz.utils.create_missing_folders import create_missing_folders


class Exporter:
    def __init__(self, network: Graph):
        self.network = network

    def generate_html(self) -> str:
        net = Network(select_menu=True, cdn_resources="remote")
        net.from_nx(self.network)
        html = net.generate_html()
        return html
