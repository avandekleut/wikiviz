#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import 'source-map-support/register'
import { WebSocketApiStack } from '../lib/stacks/websocket'
import { WikiVizStack } from '../lib/stacks/wikiviz'

const app = new cdk.App()
new WikiVizStack(app, 'WikiVizApi')

new WebSocketApiStack(app, 'WebSocketApi')
