import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { WikiVizLambda } from "../constructs/lambda/wikiviz-lambda";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new WikiVizLambda(this, "WikiViz");
  }
}
