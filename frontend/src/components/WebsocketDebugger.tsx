import { useState } from 'react';
import { config } from '../env';
import { useWebSocket } from '../hooks/useWebsocket';


export const WebsocketDebugger = () => {
  const [inputValue, setInputValue] = useState('');
  const { messages, send } = useWebSocket('wss://flvn62nuq8.execute-api.us-east-1.amazonaws.com/dev');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("sendmessage", {
      wikid: inputValue,
      branchingFactor: config.CRAWL_DEFAULT_BRANCHING_FACTOR,
      depth: config.CRAWL_DEFAULT_DEPTH
    })
    
    send("sendmessage", {
      wikid: inputValue,
      branchingFactor: config.CRAWL_DEFAULT_BRANCHING_FACTOR,
      depth: config.CRAWL_DEFAULT_DEPTH
    });
    
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
