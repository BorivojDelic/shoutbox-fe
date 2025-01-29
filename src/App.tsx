import React from 'react';
import './App.css';
import MessageList from "./components/message-list/message-list";
import setupAxios from "./utils/setup-axios.util";

setupAxios();

function App() {
  return (
    <div className="App">
      <MessageList />
    </div>
  );
}

export default App;
