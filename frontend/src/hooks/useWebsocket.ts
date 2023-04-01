import { useEffect, useState } from 'react'

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('Connected to WebSocket')
    }

    ws.onmessage = (event) => {
      console.log('Received message:', event.data)
      setMessages((prevMessages) => [...prevMessages, event.data])
    }

    ws.onerror = (event) => {
      console.error('WebSocket error:', event)
    }

    ws.onclose = () => {
      console.log('Disconnected from WebSocket')
      setSocket(null)
    }

    setSocket(ws)

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      ws.close()
    }
  }, [url])

  const send = (message: string) => {
    if (socket) {
      socket.send(message)
    } else {
      console.error('WebSocket not connected')
    }
  }

  return { messages, send }
}
