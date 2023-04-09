import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import * as cdk from 'aws-cdk-lib'

import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'

import { CfnOutput, Duration } from 'aws-cdk-lib'
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
      billingMode: BillingMode.PAY_PER_REQUEST,
    })

    const projectRoot = path.join(__dirname, '..', '..')
    const websocketEntry = path.join(projectRoot, 'backend', 'websocket')

    const sendMessageLambda = new NodejsFunction(this, 'SendMessageLambda', {
      entry: path.join(websocketEntry, 'sendmessage', 'index.ts'),
      timeout: Duration.seconds(30),
      environment: {
        LOG_LEVEL: 'debug',
      },
    })

    table.grantFullAccess(sendMessageLambda)

    const webSocketApi = new apigwv2.WebSocketApi(this, 'WebSocketApi', {})

    const stage = new apigwv2.WebSocketStage(this, 'Stage', {
      webSocketApi,
      stageName: 'dev',
      autoDeploy: true,
    })

    const connectionsArns = this.formatArn({
      service: 'execute-api',
      resourceName: `${stage.stageName}/POST/*`,
      resource: webSocketApi.apiId,
    })

    sendMessageLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['execute-api:ManageConnections'],
        resources: [connectionsArns],
      }),
    )

    webSocketApi.addRoute('sendmessage', {
      integration: new WebSocketLambdaIntegration(
        'SendMessageIntegration',
        sendMessageLambda,
      ),
    })

    webSocketApi.addRoute('$connect', {
      integration: new WebSocketLambdaIntegration(
        'ConnectIntegration',
        new NodejsFunction(this, 'ConnectLambda', {
          entry: path.join(websocketEntry, 'connect', 'index.ts'),
        }),
      ),
    })

    webSocketApi.addRoute('$disconnect', {
      integration: new WebSocketLambdaIntegration(
        'DisconnectIntegration',
        new NodejsFunction(this, 'DisconnectLambda', {
          entry: path.join(websocketEntry, 'disconnect', 'index.ts'),
        }),
      ),
    })

    new CfnOutput(this, 'WebSocketApiUrl', {
      value: webSocketApi.apiEndpoint,
    })
  }
}
