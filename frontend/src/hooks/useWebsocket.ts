import { useEffect, useState } from 'react'
import { CrawlMessage } from '../../../backend'

interface WebSocketHandlers {
  onOpen?: () => void
  onClose?: () => void
  onError?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
}

interface UseWebSocketProps {
  url: string
  handlers?: WebSocketHandlers
}

// TODO: Create a graph hook and make the events of the websocket params of the prop
export const useWebSocket = ({ url, handlers }: UseWebSocketProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [messages, setMessages] = useState<string[]>([])

  console.log('rendering websocket', { socket })

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('Connected to WebSocket', new Date().valueOf())
      handlers?.onOpen?.()
    }

    ws.onmessage = (event) => {
      console.log('Received message:', event.data, new Date().valueOf())

      setMessages((prevMessages) => [...prevMessages, event.data])
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
  }, [url])

  const send = (message: CrawlMessage) => {
    if (socket) {
      socket.send(JSON.stringify(message))
    } else {
      console.error('WebSocket not connected')
    }
  }

  return { messages, send }
}
