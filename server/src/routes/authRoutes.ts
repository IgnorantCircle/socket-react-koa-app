import Router from 'koa-router';
import {
  register,
  login,
  refreshToken,
  getCurrentUser,
  changePassword,
  logout
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = new Router({ prefix: '/api/auth' });

// 公开路由（不需要认证）
router.post('/register', register);  // 用户注册
router.post('/login', login);        // 用户登录
router.post('/refresh', refreshToken); // 刷新token

// 受保护路由（需要认证）
router.get('/me', authMiddleware, getCurrentUser);      // 获取当前用户信息
router.post('/change-password', authMiddleware, changePassword); // 修改密码
router.post('/logout', authMiddleware, logout);         // 注销登录

export default router;