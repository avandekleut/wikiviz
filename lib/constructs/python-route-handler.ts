import { HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { PythonFunction, PythonFunctionProps } from '@aws-cdk/aws-lambda-python-alpha';

import { Construct } from 'constructs';
import * as path_ from 'path';
import { Route } from './node-route-handler';


export type PythonRouteHandlerProps = {
  route: Route;
} & Omit<PythonFunctionProps, 'entry'>;

export class PythonRouteHandler extends PythonFunction {
  public readonly method: HttpMethod;
  public readonly path: string;

  constructor(scope: Construct, id: string, props: PythonRouteHandlerProps) {
    const projectRoot = path_.join(__dirname, '..', '..');
    const apiEntry = path_.join(projectRoot, 'backend');

    const [method, path] = props.route.split(' ');
    const handlerEntry = path_.join(apiEntry, path, method, 'index.ts');

    console.log({
      id,
      projectRoot,
      apiEntry,
      method,
      path,
      handlerEntry,
    });

    super(scope, id, {
      entry: handlerEntry,
      ...props,
    });

    this.method = method as HttpMethod;
    this.path = path;
  }
}
