import { useEffect, useState } from 'react'

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('Connected to WebSocket', new Date().valueOf())
    }

    ws.onmessage = (event) => {
      console.log('Received message:', event.data, new Date().valueOf())
      setMessages((prevMessages) => [...prevMessages, event.data])
    }

    ws.onerror = (event) => {
      console.error('WebSocket error:', event, new Date().valueOf())
    }

    ws.onclose = () => {
      console.log('Disconnected from WebSocket', new Date().valueOf())
      setSocket(null)
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

  const send = (action: string, message: unknown) => {
    if (socket) {
      socket.send(JSON.stringify({ action: action, data: message }))
    } else {
      console.error('WebSocket not connected')
    }
  }

  return { messages, send }
}
