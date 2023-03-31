import {
  createHandlerContext,
  HttpEventHandler,
} from '../../../../../utils/handler-context';
import { HttpEvent } from '../../../../../utils/http-event';

import wiki from 'wikijs';

type GetNetworksParams_v2 = {
  summary: string;
  mainImage: string;
  links: string[];
};

const eventHandler: HttpEventHandler<GetNetworksParams_v2> = async (
  event: HttpEvent,
) => {
  const wikid = event.getPathParameter('wikid');
  const branching_factor = event.getQueryStringParameter('branching_factor');

  const page = await wiki().page(wikid);
  const summary = await page.summary();
  const mainImage = await page.mainImage();
  const links = await page.links();

  return {
    summary,
    mainImage,
    links,
  };
};

export const handler = createHandlerContext(eventHandler);
