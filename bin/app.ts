#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { ApiStack } from "../lib/stacks/api";

const app = new cdk.App();
new ApiStack(app, "WikiVizApi", {
  //
});
