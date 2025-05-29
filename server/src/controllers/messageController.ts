import { Context } from 'koa';
import Message, { IMessage } from '../models/Message';

// 获取所有公共消息
export const getPublicMessages = async (ctx: Context): Promise<void> => {
  try {
    const messages = await Message.find({ isPrivate: false })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 })
      .select('-__v');
    
    ctx.status = 200;
    ctx.body = messages;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
    console.error('获取消息失败:', error);
  }
};

// 获取私聊消息
export const getPrivateMessages = async (ctx: Context): Promise<void> => {
  try {
    const { userId, recipientId } = ctx.params;
    
    // 查找两个用户之间的私聊消息
    const messages = await Message.find({
      isPrivate: true,
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    })
      .populate('sender', 'username avatar')
      .populate('recipient', 'username avatar')
      .sort({ createdAt: 1 })
      .select('-__v');
    
    ctx.status = 200;
    ctx.body = messages;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
    console.error('获取私聊消息失败:', error);
  }
};

// 创建消息
export const createMessage = async (ctx: Context): Promise<void> => {
  try {
    const { sender, recipient, text, isPrivate } = ctx.request.body as IMessage;
    
    const newMessage = new Message({
      sender,
      recipient,
      text,
      isPrivate: isPrivate || false
    });
    
    const savedMessage = await newMessage.save();
    
    // 如果需要，可以在这里通过Socket.io发送实时消息
    
    ctx.status = 201;
    ctx.body = savedMessage;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
    console.error('创建消息失败:', error);
  }
};

// 删除消息
export const deleteMessage = async (ctx: Context): Promise<void> => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(ctx.params.id);
    
    if (!deletedMessage) {
      ctx.status = 404;
      ctx.body = { message: '消息不存在' };
      return;
    }
    
    ctx.status = 200;
    ctx.body = { message: '消息已删除' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
    console.error('删除消息失败:', error);
  }
};