import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios, { AxiosResponse } from 'axios';
import './message-list.css';
import { MessageInterface } from "../../interfaces/message.interface";


const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const backendURL = 'http://localhost:5000';
  const [newMessage, setNewMessage] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [limit]);

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
    if (event.target.files && event.target.files.length > 0){
      setImage(event.target.files[0]);
    }
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!newMessage) return;

    const formData = new FormData();
    formData.append("message", newMessage);
    if(image){
      formData.append("image", image);
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

  const handleDeleteMessages = async () => {
    try {
      await axios.delete(`/messages?limit=${limit}`);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting messages:', error);
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
                src={`${backendURL}/files/${message.files[0]}`}
                alt="message image"
                style={{maxWidth: '300px', maxHeight: '300px'}}
              />
            }
            <p className="message-time">
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <button onClick={handleDeleteMessages}>Delete Old Messages</button>
    </div>
  );
};

export default MessageList;