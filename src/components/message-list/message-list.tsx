import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios, { AxiosResponse } from 'axios';
import './message-list.css';
import { MessageInterface } from '../../interfaces/message.interface';
import { API_URL } from '../../constants/global.constants';
import { useSocket } from '../../contexts/socket.context';
import { MESSAGE_LIST } from '../../constants/socket.constants';

const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);

  const { socket, connect, disconnect } = useSocket();

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (!socket) return;

    socket.on(MESSAGE_LIST, (messageList) => {
      setMessages(messageList);
    });

    return () => {
      if (socket) {
        socket.off(MESSAGE_LIST);
      }
    };
  }, [socket]);

  const fetchMessages = async () => {
    try {
      const response: AxiosResponse<MessageInterface[]> = await axios.get('/messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(event.target.value);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImage(event.target.files[0]);
    }
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!newMessage) return;

    const formData = new FormData();
    formData.append('message', newMessage);
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewMessage('');
      setImage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error creating message:', error);
    }
  };

  const handleClickableLinks = (text: string): React.ReactNode[] => {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(linkRegex).map((part, index) => {
      if (part.match(linkRegex)) {
        return (
          <a
            href={part}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };


  return (
    <div className="message-list">
      <h2>Shoutbox</h2>
      <form onSubmit={handleSubmit} className="message-form">
            <textarea
              placeholder="Enter your message"
              value={newMessage}
              onChange={handleMessageChange}
            />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
        />
        <button type="submit">Send</button>
      </form>
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <p className="message-text">
              {handleClickableLinks(message.message)}
            </p>
            {message.files[0] &&
              <img
                src={`${API_URL}/files/${message.files[0].id}`}
                alt="message"
                style={{ maxWidth: '300px', maxHeight: '300px' }}
              />
            }
            <p className="message-time">
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageList;