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
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('Connected to WebSocket', new Date().valueOf())
      handlers?.onOpen?.()
    }

    ws.onmessage = (event) => {
      console.log('Received message:', event.data, new Date().valueOf())

      setMessages((prevMessages) => [
        ...prevMessages,
        JSON.stringify(JSON.parse(event.data), undefined, 2),
      ])
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
    if (socket) {
      socket.send(JSON.stringify(message))
    } else {
      console.error('WebSocket not connected')
    }
  }

  return { messages, send }
}
