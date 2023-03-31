import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { getEnvVar } from '../../../../../utils/env';

import {
  createHandlerContext,
  HttpEventHandler,
} from '../../../../../utils/handler-context';
import { HttpError } from '../../../../../utils/http-error';
import { HttpEvent } from '../../../../../utils/http-event';

const queueUrl = getEnvVar('QUEUE_URL');
const client = new SQSClient({});

type ScrapyRequestBody = {
  wikid: string;
  branching_factor: string;
};

type GetNetworksParams_v1 = {
  messageId: string;
};

const eventHandler: HttpEventHandler<GetNetworksParams_v1> = async (
  event: HttpEvent,
) => {
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

  if (response.MessageId === undefined) {
    throw new HttpError(500, `No MessageId returned.`, response);
  }

  return {
    messageId: response.MessageId ?? '',
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
