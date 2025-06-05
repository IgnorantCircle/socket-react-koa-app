# Socket.io 聊天应用

基于Socket.io的实时聊天应用，前端使用React和TypeScript，后端使用Koa和MongoDB。

## 功能特点

- 实时消息传递
- 公共聊天室
- 私聊功能
- 用户在线状态
- 响应式设计，适配移动端和桌面端

## 技术栈

### 前端

- React
- TypeScript
- Socket.io-client
- Axios
- CSS3

### 后端

- Koa
- Socket.io
- MongoDB
- Mongoose
- TypeScript

### 开发工具

- ESLint
- Prettier
- Husky (Git钩子)

## 安装和运行

### 前提条件

- Node.js (v14+)
- MongoDB

### 安装依赖

```bash
# 安装所有依赖
npm run install:all
```

### 开发模式

```bash
# 同时启动前端和后端
npm start

# 仅启动前端
npm run start:client

# 仅启动后端
npm run start:server
```

### 构建生产版本

```bash
# 构建前端
cd client && npm run build

# 构建后端
cd server && npm run build
```

## 项目结构

```
├── client/                 # 前端代码
│   ├── public/             # 静态资源
│   └── src/                # 源代码
│       ├── components/     # React组件
│       └── services/       # API和Socket服务
├── server/                 # 后端代码
│   └── src/                # 源代码
│       ├── config/         # 配置文件
│       ├── controllers/    # 控制器
│       ├── models/         # 数据模型
│       ├── routes/         # 路由
│       └── utils/          # 工具函数
└── .husky/                 # Git钩子
```

## 环境变量

### 后端 (.env)

```
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5001
MONGO_URI=mongodb://localhost:27017/chat-app
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
