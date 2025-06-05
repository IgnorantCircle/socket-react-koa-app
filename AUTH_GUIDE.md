# 用户认证

## 概述
用户认证系统，包含注册、登录、JWT令牌管理、密码加密等完整功能。

## 🚀 新增功能

### 后端功能

1. **用户模型增强**
   - 添加密码字段（自动加密）
   - 用户状态管理（isActive）
   - 最后登录时间记录
   - 邮箱格式验证

2. **JWT认证系统**
   - 访问令牌（7天有效期）
   - 刷新令牌（30天有效期）
   - 自动令牌刷新机制
   - 安全的令牌验证

3. **认证中间件**
   - 保护需要登录的路由
   - 可选认证中间件
   - 用户状态验证

4. **认证API端点**
   ```
   POST /api/auth/register     - 用户注册
   POST /api/auth/login        - 用户登录
   POST /api/auth/refresh      - 刷新令牌
   GET  /api/auth/me          - 获取当前用户信息
   POST /api/auth/change-password - 修改密码
   POST /api/auth/logout       - 注销登录
   ```

### 前端功能

1. **认证上下文**
   - 全局状态管理
   - 自动令牌刷新
   - 认证状态持久化

2. **统一认证表单**
   - 登录/注册切换
   - 表单验证
   - 错误处理
   - 响应式设计

3. **自动认证检查**
   - 页面刷新后保持登录状态
   - 令牌过期自动处理
   - 安全的本地存储

## 📋 环境配置

### 1. 服务器环境变量

复制 `server/.env.example` 到 `server/.env` 并配置：

```env
# 数据库配置
MONGO_URI=mongodb://localhost:27017/chat-app

# 服务器配置
PORT=3000
CLIENT_URL=http://localhost:5001

# JWT配置（重要：生产环境请使用强密钥）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# 环境
NODE_ENV=development
```

### 2. 客户端环境变量

在 `client` 目录创建 `.env` 文件：

```env
REACT_APP_API_URL=http://localhost:3000/api
```

## 🔧 安装和运行

### 1. 安装依赖

```bash
# 根目录安装所有依赖
npm run install:all
```

### 2. 启动服务

```bash
# 同时启动前后端
npm start

# 或分别启动
npm run start:server  # 启动后端
npm run start:client  # 启动前端
```

## 🔐 API使用示例

### 用户注册

```javascript
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456",
  "avatar": "https://example.com/avatar.jpg" // 可选
}
```

### 用户登录

```javascript
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser", // 支持用户名或邮箱
  "password": "123456"
}
```

### 访问受保护的路由

```javascript
GET /api/users
Authorization: Bearer <access_token>
```

### 刷新令牌

```javascript
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

## 🛡️ 安全特性

1. **密码安全**
   - 使用 bcryptjs 加密（12轮加盐）
   - 密码不会在API响应中返回
   - 最小长度验证

2. **JWT安全**
   - 短期访问令牌（7天）
   - 长期刷新令牌（30天）
   - 令牌签名验证
   - 发行者和受众验证

3. **输入验证**
   - 前后端双重验证
   - 邮箱格式验证
   - 用户名长度限制
   - SQL注入防护

4. **状态管理**
   - 用户激活状态检查
   - 最后登录时间记录
   - 自动令牌清理


## 🎨 前端集成

### 使用认证上下文

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { state, login, logout } = useAuth();
  
  if (state.isLoading) {
    return <div>加载中...</div>;
  }
  
  if (!state.isAuthenticated) {
    return <div>请先登录</div>;
  }
  
  return (
    <div>
      <h1>欢迎, {state.user?.username}!</h1>
      <button onClick={logout}>注销</button>
    </div>
  );
}
```

### 调用认证API

```tsx
import authService from '../services/authService';

// 登录
try {
  const result = await authService.login({
    username: 'testuser',
    password: '123456'
  });
  console.log('登录成功:', result.user);
} catch (error) {
  console.error('登录失败:', error.response?.data?.message);
}

// 获取当前用户
try {
  const user = await authService.getCurrentUser();
  console.log('当前用户:', user);
} catch (error) {
  console.error('获取用户信息失败:', error);
}
```

## 🚨 注意事项

1. **生产环境配置**
   - 必须更改 `JWT_SECRET` 为强密钥
   - 使用 HTTPS
   - 配置正确的 CORS 设置
   - 使用环境变量管理敏感信息

2. **数据库安全**
   - 配置 MongoDB 认证
   - 使用连接字符串认证
   - 定期备份数据

3. **前端安全**
   - 不要在代码中硬编码敏感信息
   - 使用 HTTPS
   - 定期更新依赖包

## 🔧 故障排除

### 常见问题

1. **JWT_SECRET 未设置**
   ```
   错误: JWT_SECRET environment variable is required
   解决: 在 .env 文件中设置 JWT_SECRET
   ```

2. **MongoDB 连接失败**
   ```
   错误: MongoDB连接失败
   解决: 检查 MONGO_URI 配置和 MongoDB 服务状态
   ```

3. **CORS 错误**
   ```
   错误: Access to fetch blocked by CORS policy
   解决: 检查服务器 CORS 配置和 CLIENT_URL 设置
   ```

4. **令牌过期**
   ```
   错误: Token expired
   解决: 前端会自动尝试刷新令牌，如果失败会跳转到登录页
   ```

## 📚 扩展功能

基于当前认证系统，你可以轻松添加：

- 邮箱验证
- 密码重置
- 双因素认证
- 社交登录
- 用户角色权限
- 登录历史记录
- 设备管理

