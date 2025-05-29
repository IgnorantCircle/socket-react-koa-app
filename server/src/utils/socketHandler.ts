import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

// 用户映射，存储在线用户
const users: Map<string, { userId: string; username: string }> = new Map();

// 处理Socket.io连接
export const socketHandler = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {
  console.log('用户已连接:', socket.id);

  // 用户加入聊天
  socket.on('join', ({ userId, username }) => {
    // 存储用户信息
    users.set(socket.id, { userId, username });
    
    // 广播用户加入消息
    socket.broadcast.emit('userJoined', {
      userId,
      username,
      message: `${username} 加入了聊天`
    });
    
    // 发送在线用户列表
    const onlineUsers = Array.from(users.values());
    socket.emit('onlineUsers', onlineUsers);
    socket.broadcast.emit('onlineUsers', onlineUsers);
  });

  // 处理消息
  socket.on('sendMessage', (message) => {
    const user = users.get(socket.id);
    if (user) {
      // 广播消息给所有用户
      socket.broadcast.emit('message', {
        userId: user.userId,
        username: user.username,
        text: message.text,
        timestamp: new Date().toISOString()
      });
    }
  });

  // 处理私聊消息
  socket.on('privateMessage', ({ to, message }) => {
    const user = users.get(socket.id);
    if (user) {
      // 查找接收者的socket ID
      let recipientSocketId: string | undefined;
      for (const [socketId, userData] of users.entries()) {
        if (userData.userId === to) {
          recipientSocketId = socketId;
          break;
        }
      }

      if (recipientSocketId) {
        // 发送私聊消息给接收者
        socket.to(recipientSocketId).emit('privateMessage', {
          from: user.userId,
          fromUsername: user.username,
          text: message,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // 用户断开连接
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      // 从用户映射中移除
      users.delete(socket.id);
      
      // 广播用户离开消息
      socket.broadcast.emit('userLeft', {
        userId: user.userId,
        username: user.username,
        message: `${user.username} 离开了聊天`
      });
      
      // 更新在线用户列表
      const onlineUsers = Array.from(users.values());
      socket.broadcast.emit('onlineUsers', onlineUsers);
    }
    console.log('用户已断开连接:', socket.id);
  });
};