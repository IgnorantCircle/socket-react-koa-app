import Router from 'koa-router';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth';

const router = new Router({ prefix: '/api/users' });

// 获取所有用户（需要认证）
router.get('/', authMiddleware, getUsers);

// 获取单个用户（可选认证）
router.get('/:id', optionalAuthMiddleware, getUserById);

// 创建用户（需要认证，管理员功能）
router.post('/', authMiddleware, createUser);

// 更新用户（需要认证）
router.put('/:id', authMiddleware, updateUser);

// 删除用户（需要认证）
router.delete('/:id', authMiddleware, deleteUser);

export default router;