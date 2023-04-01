import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import * as cdk from 'aws-cdk-lib'

import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'

import { CfnOutput } from 'aws-cdk-lib'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import * as path from 'path'

export class WebSocketApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const table = new Table(this, 'Wiki', {
      partitionKey: {
        name: 'pkey',
        type: AttributeType.STRING,
      },
    })

    const lambda = new NodejsFunction(this, 'WebSocketLambda', {
      entry: path.join(
        __dirname,
        '..',
        '..',
        'backend/api/v2/networks/{wikid}/GET/index.ts',
      ),
      handler: 'handler',
      bundling: {
        // specify your bundling options here
      },
    })

    table.grantFullAccess(lambda)

    const webSocketApi = new apigwv2.WebSocketApi(this, 'WebSocketApi', {})

    const stage = new apigwv2.WebSocketStage(this, 'Stage', {
      webSocketApi,
      stageName: 'dev',
      autoDeploy: true,
    })

    webSocketApi.addRoute('sendmessage', {
      integration: new WebSocketLambdaIntegration(
        'SendMessageIntegration',
        lambda,
      ),
    })

    const connectionsArns = this.formatArn({
      service: 'execute-api',
      resourceName: `${stage.stageName}/POST/*`,
      resource: webSocketApi.apiId,
    })

    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['execute-api:ManageConnections'],
        resources: [connectionsArns],
      }),
    )

    new CfnOutput(this, 'WebSocketApiUrl', {
      value: webSocketApi.apiEndpoint,
    })
  }
}
