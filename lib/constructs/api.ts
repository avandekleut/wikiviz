import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha'
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { CfnOutput, Duration } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { RouteHandler, RouteHandlerProps } from './node-route-handler'

export class WikiVizApi extends Construct {
  private readonly api: HttpApi

  constructor(scope: Construct, id: string) {
    super(scope, id)

    this.api = new HttpApi(this, 'Api', {
      apiName: 'WikiVizApi',
    })

    const getNetwork = this.addRoute({
      route: 'GET /api/v1/networks/{wikid}',
      timeout: Duration.seconds(10),
      memorySize: 1024,
      environment: {},
    })

    const search = this.addRoute({
      route: 'GET /api/v1/search',
      timeout: Duration.seconds(1),
      memorySize: 128,
      environment: {},
    })

    new CfnOutput(this, 'ApiUrl', {
      value: this.api.url!,
    })
  }

  private addRoute(props: RouteHandlerProps): RouteHandler {
    const id = this.safeCfnLogicalId(props.route) // convert route to ID
    const routeHandler = new RouteHandler(this, id, props)
    this.api.addRoutes({
      methods: [routeHandler.method],
      path: routeHandler.path,
      integration: new HttpLambdaIntegration(id + 'Integration', routeHandler),
    })
    return routeHandler
  }

  private safeCfnLogicalId(id: string) {
    const nonAlphanumeric = /\W/g
    const alphanumericOnly = id.replace(nonAlphanumeric, '')
    return alphanumericOnly
  }
}
