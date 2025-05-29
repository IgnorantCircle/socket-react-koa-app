import Router from 'koa-router';
import {
  getPublicMessages,
  getPrivateMessages,
  createMessage,
  deleteMessage
} from '../controllers/messageController';

const router = new Router({ prefix: '/api/messages' });

// 获取所有公共消息
router.get('/public', getPublicMessages);

// 获取私聊消息
router.get('/private/:userId/:recipientId', getPrivateMessages);

// 创建消息
router.post('/', createMessage);

// 删除消息
router.delete('/:id', deleteMessage);

export default router;