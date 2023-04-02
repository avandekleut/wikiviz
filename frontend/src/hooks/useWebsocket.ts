import { useEffect, useState } from 'react'
import { CrawlMessage } from '../../../backend'

export interface WebSocketHandlers {
  onOpen?: () => void
  onClose?: () => void
  onError?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
}

export interface UseWebSocketProps {
  url: string
  handlers?: WebSocketHandlers
}

export const useWebSocket = ({ url, handlers }: UseWebSocketProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('Connected to WebSocket', new Date().valueOf())
      handlers?.onOpen?.()
    }

    ws.onmessage = (event) => {
      console.log('Received message:', event.data, new Date().valueOf())
      handlers?.onMessage?.(event)
    }

    ws.onerror = (event) => {
      console.error('WebSocket error:', event, new Date().valueOf())
      handlers?.onError?.(event)
    }

    ws.onclose = () => {
      console.log('Disconnected from WebSocket', new Date().valueOf())
      setSocket(null)
      handlers?.onClose?.()
    }

    setSocket(ws)

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      console.log('Cleaning up WebSocket connection', new Date().valueOf())

      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [url, handlers])

  const send = (message: CrawlMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    } else {
      console.error('WebSocket not connected')
    }
  }

  return { send }
}
