import pino from 'pino'

function init() {
  return pino({
    level: process.env.LOG_LEVEL || 'info',
    base: { requestId: '' },
    timestamp: false,
  })
}

export class LoggerFactory {
  public static logger = init()

  public static setRequestId(requestId: string): void {
    LoggerFactory.logger = init().child({ requestId })
  }
}
