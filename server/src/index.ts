import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { Server } from 'socket.io';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { socketHandler } from './utils/socketHandler';

// 导入路由
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import messageRoutes from './routes/messageRoutes';

// 加载环境变量
dotenv.config();

// 创建Koa应用
const app = new Koa();
const router = new Router();

// 创建HTTP服务器
const server = http.createServer(app.callback());

// 创建Socket.io服务器
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5001',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 连接MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app';
    await mongoose.connect(mongoURI);
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

// 中间件
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5001',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(bodyParser());

// 路由
app.use(router.routes()).use(router.allowedMethods());
app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(messageRoutes.routes()).use(messageRoutes.allowedMethods());

// 基础路由
router.get('/', async (ctx) => {
  ctx.body = { message: 'Socket.io聊天应用API' };
});

// 处理Socket.io连接
io.on('connection', socketHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  await connectDB();
  console.log(`服务器运行在端口 ${PORT}`);
});