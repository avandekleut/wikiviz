import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { env } from "../../../../../utils/env";
import {
  createHandlerContext,
  HttpEventHandler,
} from "../../../../../utils/handler-context";
import { HttpEvent } from "../../../../../utils/http-event";

const queueUrl = env("QUEUE_URL");
const client = new SQSClient({});

type ScrapyRequestBody = {
  wikid: string;
  branching_factor: string;
  data_path: string;
};

const eventHandler: HttpEventHandler = async (event: HttpEvent) => {
  const wikid = event.getPathParameter("wikid");
  const branching_factor = event.getQueryStringParameter("branching_factor");

  const data_path = `/data/networks/${wikid}`;

  const messageBody: ScrapyRequestBody = {
    wikid,
    branching_factor,
    data_path,
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
