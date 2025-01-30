import React from 'react';
import './App.css';
import MessageList from './components/message-list/message-list';
import setupAxios from './utils/setup-axios.util';
import { SocketProvider } from './contexts/socket.context';

setupAxios();

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <MessageList />
      </SocketProvider>
    </div>
  );
}

export default App;
