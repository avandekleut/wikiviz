import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";

export class WikiVizLambda extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const projectRoot = path.join(__dirname, "..", "..", "..");

    new PythonFunction(this, "Function", {
      entry: path.join(projectRoot, "backend", "scrapy"), // location of poetry.lock
      runtime: Runtime.PYTHON_3_8,
      index: "wikiviz/process.py",
      bundling: {
        assetExcludes: [".venv"], // TODO: Determine what else needs to be excluded?
      },
      timeout: Duration.seconds(30),
      memorySize: 1024,
    });
  }
}
