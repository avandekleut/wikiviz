import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RouteHandler, RouteHandlerProps } from "./route-handler";
import { ScrapyHandler, ScrapyHandlerProps } from "./scrapy-handler";

export type WikiVizApiProps = ScrapyHandlerProps;

export class WikiVizApi extends Construct {
  private readonly api: HttpApi;

  constructor(scope: Construct, id: string, props: WikiVizApiProps) {
    super(scope, id);

    this.api = new HttpApi(this, "Api", {
      apiName: "WikiVizApi",
    });

    this.addRoute({
      route: "GET /api/v1/networks/{wikid}",
    });

    const scrapyHandler = new ScrapyHandler(this, "ScrapyHandler", props);

    new CfnOutput(this, "ApiUrl", {
      value: this.api.url!,
    });
  }

  private addRoute(props: RouteHandlerProps) {
    const id = this.safeCfnLogicalId(props.route); // convert route to ID

    console.log(`created id: ${id}`);
    console.log(`creating routeHandler...`);
    const routeHandler = new RouteHandler(this, id, props);
    this.api.addRoutes({
      methods: [routeHandler.method],
      path: routeHandler.path,
      integration: new HttpLambdaIntegration(id + "Integration", routeHandler),
    });
  }

  private safeCfnLogicalId(id: string) {
    const nonAlphanumeric = /\W/g;
    const alphanumericOnly = id.replace(nonAlphanumeric, "");
    return alphanumericOnly;
  }
}
