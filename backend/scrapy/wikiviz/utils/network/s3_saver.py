import os
import boto3
from wikiviz.utils import env

data_string = "This is a random string."

s3 = boto3.client("s3")


class S3Saver:
    def __init__(self, bucket_name=None):
        self.bucket_name = bucket_name or os.environ.get(
            "DATA_BUCKET", env.DATA_BUCKET_URL
        )

    def save(self, body: str, filename: str):
        s3.put_object(
            Body=body,
            Bucket=self.bucket_name,
            Key=filename,
            ContentDisposition="inline",
            ContentType="text/html",
        )
