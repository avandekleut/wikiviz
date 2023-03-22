import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { env } from '../../../../../utils/env';
import {
  createHandlerContext,
  HttpEventHandler,
} from '../../../../../utils/handler-context';
import { HttpEvent } from '../../../../../utils/http-event';

const queueUrl = env('QUEUE_URL');
const client = new SQSClient({});

type ScrapyRequestBody = {
  wikid: string;
  branching_factor: string;
};

const eventHandler: HttpEventHandler = async (event: HttpEvent) => {
  const wikid = event.getPathParameter('wikid');
  const branching_factor = event.getQueryStringParameter('branching_factor');

  const messageBody: ScrapyRequestBody = {
    wikid,
    branching_factor,
  };

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(messageBody),
  });
  const response = await client.send(command);

  return {
    messageId: response.MessageId,
  };
};

export const handler = createHandlerContext(eventHandler);

type PathNameParameters = ScrapyRequestBody & {
  num_clusters: number;
};

function generateName({
  wikid,
  branching_factor,
  num_clusters,
}: PathNameParameters) {
  return `/data/networks/${wikid}?branching_factor=${branching_factor}&num_clusters=${num_clusters}}`;
}
