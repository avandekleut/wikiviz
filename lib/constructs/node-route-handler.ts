import { HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha'
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as path_ from 'path'

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type Route = `${HttpMethod} /${string}`

export type RouteHandlerProps = {
  route: Route
} & Optional<NodejsFunctionProps, 'entry'>

export class RouteHandler extends NodejsFunction {
  public readonly method: HttpMethod
  public readonly path: string

  constructor(scope: Construct, id: string, props: RouteHandlerProps) {
    const projectRoot = path_.join(__dirname, '..', '..')
    const apiEntry = path_.join(projectRoot, 'backend')

    const [method, path] = props.route.split(' ')
    const handlerEntry = path_.join(apiEntry, path, method, 'index.ts')

    console.log({
      id,
      projectRoot,
      apiEntry,
      method,
      path,
      handlerEntry,
    })

    super(scope, id, {
      entry: handlerEntry,
      ...props,
    })

    this.method = method as HttpMethod
    this.path = path
  }
}
