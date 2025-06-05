import { io, Socket } from 'socket.io-client';

interface User {
  userId: string;
  username: string;
}

interface Message {
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

interface PrivateMessage {
  from: string;
  fromUsername: string;
  text: string;
  timestamp: string;
}

class SocketService {
  private socket: Socket | null = null;
  private userId: string = '';
  private username: string = '';

  // 连接到Socket.io服务器
  connect(userId: string, username: string): void {
    this.userId = userId;
    this.username = username;

    // 连接到服务器
    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000');

    // 连接成功后加入聊天
    this.socket.on('connect', () => {
      console.log('已连接到Socket.io服务器');
      this.joinChat();
    });

    // 处理连接错误
    this.socket.on('connect_error', (error) => {
      console.error('Socket.io连接错误:', error);
    });
  }

  // 断开连接
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('已断开Socket.io连接');
    }
  }

  // 加入聊天
  private joinChat(): void {
    if (this.socket) {
      this.socket.emit('join', {
        userId: this.userId,
        username: this.username
      });
    }
  }

  // 发送消息
  sendMessage(text: string): void {
    if (this.socket) {
      this.socket.emit('sendMessage', { text });
    }
  }

  // 发送私聊消息
  sendPrivateMessage(to: string, message: string): void {
    if (this.socket) {
      this.socket.emit('privateMessage', { to, message });
    }
  }

  // 监听消息
  onMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on('message', callback);
    }
  }

  // 监听私聊消息
  onPrivateMessage(callback: (message: PrivateMessage) => void): void {
    if (this.socket) {
      this.socket.on('privateMessage', callback);
    }
  }

  // 监听用户加入
  onUserJoined(callback: (data: { userId: string; username: string; message: string }) => void): void {
    if (this.socket) {
      this.socket.on('userJoined', callback);
    }
  }

  // 监听用户离开
  onUserLeft(callback: (data: { userId: string; username: string; message: string }) => void): void {
    if (this.socket) {
      this.socket.on('userLeft', callback);
    }
  }

  // 监听在线用户列表更新
  onOnlineUsers(callback: (users: User[]) => void): void {
    if (this.socket) {
      this.socket.on('onlineUsers', callback);
    }
  }
}

// 创建单例实例
const socketService = new SocketService();
export default socketService;