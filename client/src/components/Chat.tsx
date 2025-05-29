import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import apiService, { User, Message } from '../services/apiService';
import './Chat.css';

interface ChatProps {
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPrivateChat, setIsPrivateChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化Socket.io连接
  useEffect(() => {
    // 连接到Socket.io服务器
    socketService.connect(currentUser._id, currentUser.username);

    // 加载公共消息
    loadPublicMessages();

    // 监听新消息
    socketService.onMessage((message) => {
      const newMessage: Message = {
        _id: Date.now().toString(), // 临时ID
        sender: {
          _id: message.userId,
          username: message.username,
          email: '',
          createdAt: '',
          updatedAt: ''
        },
        text: message.text,
        isPrivate: false,
        createdAt: message.timestamp,
        updatedAt: message.timestamp
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // 监听私聊消息
    socketService.onPrivateMessage((message) => {
      if (selectedUser && selectedUser._id === message.from) {
        const newMessage: Message = {
          _id: Date.now().toString(), // 临时ID
          sender: {
            _id: message.from,
            username: message.fromUsername,
            email: '',
            createdAt: '',
            updatedAt: ''
          },
          recipient: currentUser,
          text: message.text,
          isPrivate: true,
          createdAt: message.timestamp,
          updatedAt: message.timestamp
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else {
        // 可以在这里添加通知逻辑
        console.log('收到来自', message.fromUsername, '的新私聊消息');
      }
    });

    // 监听用户加入
    socketService.onUserJoined((data) => {
      console.log(data.message);
    });

    // 监听用户离开
    socketService.onUserLeft((data) => {
      console.log(data.message);
    });

    // 监听在线用户列表
    socketService.onOnlineUsers((users) => {
      // 将Socket.io用户格式转换为API用户格式
      const formattedUsers = users.map(user => ({
        _id: user.userId,
        username: user.username,
        email: '',
        createdAt: '',
        updatedAt: ''
      }));
      setOnlineUsers(formattedUsers);
    });

    // 组件卸载时断开连接
    return () => {
      socketService.disconnect();
    };
  }, [currentUser]);

  // 加载公共消息
  const loadPublicMessages = async () => {
    try {
      const publicMessages = await apiService.getPublicMessages();
      setMessages(publicMessages);
      setIsPrivateChat(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('加载公共消息失败:', error);
    }
  };

  // 加载私聊消息
  const loadPrivateMessages = async (user: User) => {
    try {
      const privateMessages = await apiService.getPrivateMessages(currentUser._id, user._id);
      setMessages(privateMessages);
      setIsPrivateChat(true);
      setSelectedUser(user);
    } catch (error) {
      console.error('加载私聊消息失败:', error);
    }
  };

  // 发送消息
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() === '') return;

    if (isPrivateChat && selectedUser) {
      // 发送私聊消息
      socketService.sendPrivateMessage(selectedUser._id, messageText);

      // 添加到本地消息列表
      const newMessage: Message = {
        _id: Date.now().toString(), // 临时ID
        sender: currentUser,
        recipient: selectedUser,
        text: messageText,
        isPrivate: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // 保存到数据库
      apiService.createMessage({
        sender: currentUser._id,
        recipient: selectedUser._id,
        text: messageText,
        isPrivate: true
      }).catch(error => console.error('保存私聊消息失败:', error));
    } else {
      // 发送公共消息
      socketService.sendMessage(messageText);

      // 添加到本地消息列表
      const newMessage: Message = {
        _id: Date.now().toString(), // 临时ID
        sender: currentUser,
        text: messageText,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // 保存到数据库
      apiService.createMessage({
        sender: currentUser._id,
        text: messageText,
        isPrivate: false
      }).catch(error => console.error('保存公共消息失败:', error));
    }

    // 清空输入框
    setMessageText('');
  };

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>在线用户</h2>
        </div>
        <div className="user-list">
          <div 
            className={`user-item ${!isPrivateChat ? 'active' : ''}`}
            onClick={loadPublicMessages}
          >
            <div className="user-avatar">🌐</div>
            <div className="user-info">
              <div className="user-name">公共聊天室</div>
            </div>
          </div>
          {onlineUsers
            .filter(user => user._id !== currentUser._id)
            .map(user => (
              <div 
                key={user._id} 
                className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                onClick={() => loadPrivateMessages(user)}
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.username}</div>
                  <div className="user-status">在线</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h2>
            {isPrivateChat 
              ? `与 ${selectedUser?.username} 的私聊` 
              : '公共聊天室'}
          </h2>
        </div>
        
        <div className="messages-container">
          {messages.map(message => (
            <div 
              key={message._id} 
              className={`message ${message.sender._id === currentUser._id ? 'own-message' : ''}`}
            >
              <div className="message-avatar">
                {message.sender.avatar ? (
                  <img src={message.sender.avatar} alt={message.sender.username} />
                ) : (
                  message.sender.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-author">{message.sender.username}</span>
                  <span className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">{message.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-form" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="输入消息..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button type="submit">发送</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;