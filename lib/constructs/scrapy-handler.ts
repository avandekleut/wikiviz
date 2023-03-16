import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import * as path from "path";

export type ScrapyHandlerProps = {
  dataBucket: Bucket;
};

export class ScrapyHandler extends Construct {
  public readonly queue: Queue;

  constructor(scope: Construct, id: string, props: ScrapyHandlerProps) {
    super(scope, id);
    const projectRoot = path.join(__dirname, "..", "..", "..");

    const scrapyHandler = new PythonFunction(scope, id, {
      entry: path.join(projectRoot, "backend", "scrapy"), // location of poetry.lock
      runtime: Runtime.PYTHON_3_8,
      index: "wikiviz/process.py",
      bundling: {
        assetExcludes: [".venv"], // TODO: Determine what else needs to be excluded?
      },
      timeout: Duration.seconds(30),
      memorySize: 1024,
      environment: {
        DATA_BUCKET: props.dataBucket.bucketName,
      },
    });
    props.dataBucket.grantWrite(scrapyHandler);

    this.queue = new Queue(this, "ScrapyQueue");
    scrapyHandler.addEventSource(new SqsEventSource(this.queue));
  }
}
