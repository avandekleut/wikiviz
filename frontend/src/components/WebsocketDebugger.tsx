import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebsocket';


export const WebsocketDebugger = () => {
  const [inputValue, setInputValue] = useState('');
  const { messages, send } = useWebSocket('wss://your-websocket-url');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(inputValue);
    setInputValue('');
  };

  return (
    <div>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
