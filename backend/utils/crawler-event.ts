export type CrawlerEventType = 'open' | 'data' | 'close'

interface CrawlerEventBase<T> {
  type: CrawlerEventType
  data?: T
}

export interface CrawlerEventOpen<T> extends CrawlerEventBase<T> {
  type: 'open'
  // add any additional properties specific to this event type
}

export interface CrawlerEventData<T> extends CrawlerEventBase<T> {
  type: 'data'
  // add any additional properties specific to this event type
}

export interface CrawlerEventClose<T> extends CrawlerEventBase<T> {
  type: 'close'
  // add any additional properties specific to this event type
}

export type CrawlerEvent<T = undefined> =
  | CrawlerEventOpen<T>
  | CrawlerEventData<T>
  | CrawlerEventClose<T>
