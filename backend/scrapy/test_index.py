from index import handler


def test_handler():
    wikid = "Functor"
    branching_factor = 4
    groups = 6
    event = {
        "resource": "/",
        "path": "/",
        "httpMethod": "GET",
        "requestContext": {
            "resourcePath": "/",
            "httpMethod": "GET",
            "path": f"/api/v1/networks/${wikid}?branching_factor={branching_factor}&groups={groups}",
        },
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-encoding": "gzip, deflate, br",
            "Host": "70ixmpl4fl.execute-api.us-east-2.amazonaws.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
            "X-Amzn-Trace-Id": "Root=1-5e66d96f-7491f09xmpl79d18acf3d050",
        },
        "multiValueHeaders": {
            "accept": [
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
            ],
            "accept-encoding": ["gzip, deflate, br"],
        },
        "queryStringParameters": {"branching_factor": "4", "groups": "6"},
        "multiValueQueryStringParameters": None,
        "pathParameters": {"wikid": wikid},
        "stageVariables": None,
        "body": None,
        "isBase64Encoded": False,
    }

    result = handler(event, None)
    assert result["statusCode"] == 200
    assert len(result["body"]) > 0
    assert result["headers"]["content-type"] == "text/html"
    assert result["headers"]["content-disposition"] == "inline"
