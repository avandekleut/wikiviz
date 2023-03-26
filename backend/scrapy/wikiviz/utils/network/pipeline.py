from index import global_result
from networkx import Graph
from wikiviz.utils.network.clusterizer import Clusterizer
from wikiviz.utils.network.exporter import Exporter
from wikiviz.utils.network.node_resizer import NodeResizer
from wikiviz.utils.network.s3_saver import S3Saver
from wikiviz.utils.network.serializer import Serializer


class Pipeline:
    def __init__(self, network: Graph):
        self.network = network

    def run(self, num_clusters: int, file_name: str):
        Clusterizer(self.network).cluster(num_clusters)
        NodeResizer(self.network).update_node_sizes()
        html = Exporter(self.network).generate_html()
        S3Saver().save(html, file_name)
        # Serializer(self.network).save(file_name)

        global_result["html"] = html
