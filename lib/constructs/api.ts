import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { CfnOutput } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from "path";
import { NodeRouteHandler, NodeRouteHandlerProps } from './node-route-handler';
import { PythonRouteHandler, PythonRouteHandlerProps } from './python-route-handler';
import { ScrapyHandler, ScrapyHandlerProps } from './scrapy-handler';

export type WikiVizApiProps = ScrapyHandlerProps;

export class WikiVizApi extends Construct {
  private readonly api: HttpApi;

  constructor(scope: Construct, id: string, props: WikiVizApiProps) {
    super(scope, id);

    const scrapyHandler = new ScrapyHandler(this, 'ScrapyHandler', props);

    this.api = new HttpApi(this, 'Api', {
      apiName: 'WikiVizApi',
    });

    const getNetwork = this.addNodeRoute({
      route: 'GET /api/v1/networks/{wikid}',
      environment: {
        QUEUE_URL: scrapyHandler.queue.queueUrl,
      },
    });
    scrapyHandler.queue.grantSendMessages(getNetwork);

    const getNetworkPython = this.addPythonRoute({
      route: 'GET /api/v2/networks/{wikid}',
      entry: path.join(__dirname, '..', '..', 'backend', 'scrapy', 'index.py'),
      runtime: Runtime.PYTHON_3_8,
      environment: {
        DATA_BUCKET: props.dataBucket.bucketName,
      },
    });
    props.dataBucket.grantReadWrite(getNetworkPython)

    new CfnOutput(this, 'ApiUrl', {
      value: this.api.url!,
    });
  }

  private addNodeRoute(props: NodeRouteHandlerProps): NodeRouteHandler {
    const id = this.safeCfnLogicalId(props.route); // convert route to ID
    const routeHandler = new NodeRouteHandler(this, id, props)
    this.api.addRoutes({
      methods: [routeHandler.method],
      path: routeHandler.path,
      integration: new HttpLambdaIntegration(id + 'Integration', routeHandler),
    });
    return routeHandler;
  }

  private addPythonRoute(props: PythonRouteHandlerProps): PythonRouteHandler {
    const id = this.safeCfnLogicalId(props.route); // convert route to ID
    const routeHandler = new PythonRouteHandler(this, id, props)
    this.api.addRoutes({
      methods: [routeHandler.method],
      path: routeHandler.path,
      integration: new HttpLambdaIntegration(id + 'Integration', routeHandler),
    });
    return routeHandler;
  }

  private safeCfnLogicalId(id: string) {
    const nonAlphanumeric = /\W/g;
    const alphanumericOnly = id.replace(nonAlphanumeric, '');
    return alphanumericOnly;
  }
}
