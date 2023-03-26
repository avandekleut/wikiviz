from urllib.parse import urlencode


def get_run_name(
    wid: str,
    branching_factor: int,
    num_clusters: int,
    prefix="data/v1/networks",
    **kwargs,
) -> str:
    params = urlencode(
        {"branching_factor": branching_factor, "num_clusters": num_clusters, **kwargs}
    )
    name = f"{prefix}/{wid}?{params}"
    return name
