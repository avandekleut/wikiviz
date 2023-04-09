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
    setSocket(ws)

    return () => {
      console.log('Cleaning up WebSocket connection', new Date().valueOf())

      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [url])

  useEffect(() => {
    if (!socket) {
      return
    }

    socket.onopen = () => {
      console.log('Connected to WebSocket', new Date().valueOf())
      handlers?.onOpen?.()
    }

    socket.onmessage = (event) => {
      console.log('Received message:', event.data, new Date().valueOf())
      handlers?.onMessage?.(event)
    }

    socket.onerror = (event) => {
      console.error('WebSocket error:', event, new Date().valueOf())
      handlers?.onError?.(event)
    }

    socket.onclose = () => {
      console.log('Disconnected from WebSocket', new Date().valueOf())
      setSocket(null)
      handlers?.onClose?.()
    }
  }, [socket, handlers])

  const send = (message: CrawlMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    } else {
      console.error('WebSocket not connected')
    }
  }

  return { send }
}
