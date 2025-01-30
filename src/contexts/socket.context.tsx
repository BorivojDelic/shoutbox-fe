import React, { createContext, useState, useEffect, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { defaultSocketContext, SocketContextType } from '../interfaces/socket-context.interface';
import { SERVER_URL } from '../constants/global.constants';

export const SocketContext = createContext<SocketContextType>(defaultSocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);


  const connect = () => {
    if (socket) return;
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};