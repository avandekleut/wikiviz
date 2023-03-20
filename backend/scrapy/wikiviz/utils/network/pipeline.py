from networkx import Graph


from wikiviz.utils.network.clusterizer import Clusterizer
from wikiviz.utils.network.exporter import Exporter
from wikiviz.utils.network.node_resizer import NodeResizer
from wikiviz.utils.network.s3_saver import S3Saver


class Pipeline:
    def __init__(self, network: Graph):
        self.network = network

    def run(self, num_clusters=6, name='out'):
        print(f'running pipeline, num_cluster={num_clusters}, name={name}')
        Clusterizer(self.network).cluster(num_clusters)
        NodeResizer(self.network).update_node_sizes()
        html = Exporter(self.network).generate_html()
        print("generated html")
        print(html)
        S3Saver().save(html, f'{name}.html')