import React, { useState, useEffect, ChangeEvent, FormEvent, useRef, Ref } from 'react';
import axios, { AxiosResponse } from 'axios';
import './message-list.css';
import { MessageInterface } from '../../interfaces/message.interface';
import { API_URL } from '../../constants/global.constants';
import { useSocket } from '../../contexts/socket.context';
import { MESSAGE_LIST } from '../../constants/socket.constants';

const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLTextAreaElement>(undefined);

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
    if (!event.target?.files?.length) return;
    const fileList: File[] = [];
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files?.[i];
      if (file && !files.find((f) => f.name === file.name && f.size === file.size)) {
        fileList.push(file);
      }
    }
    setFiles(fileList);
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!newMessage) return;

    const formData = new FormData();
    formData.append('message', newMessage);
    if (files.length) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    try {
      await axios.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const inputs = document.querySelectorAll<HTMLInputElement>('form input');
      inputs.forEach((input) => {
        input.value = '';
      });
      setNewMessage('');
      setFiles([]);
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
      <h2>Shout Box</h2>
      <form onSubmit={handleSubmit} className="message-form">
        <textarea
          ref={fileInputRef as Ref<HTMLTextAreaElement>}
          placeholder="Enter your message"
          value={newMessage}
          onChange={handleMessageChange}
          required
          minLength={10}
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
          multiple
        />
        <button type="submit">Send</button>
      </form>
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <p className="message-text">
              {handleClickableLinks(message.message)}
            </p>
            {message.files.length > 0 && (
              <div className="message-image-wrapper">
                {message.files.map((file) => (
                  <div key={file.id} className="message-image-container">
                    <img
                      src={`${API_URL}/files/${file.id}`}
                      alt="message"
                      className="message-image"
                    />
                  </div>
                ))}
              </div>
            )}
            <p className="message-time">
              <b>{message.userIp}</b> - <b>{message.userAgent}</b> - <b>{new Date(message.createdAt).toDateString()}</b>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageList;