import * as cdk from "aws-cdk-lib";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { WikiVizApi } from "../constructs/api";
import { WikiVizDistribution } from "../constructs/distribution";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class WikiVizStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dataBucket = new Bucket(this, "DataBucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const api = new WikiVizApi(this, "WikiVizApi", {
      dataBucket,
    });

    new WikiVizDistribution(this, 'WikiVizDistribution', {
      dataBucket: dataBucket
    })
  }
}
