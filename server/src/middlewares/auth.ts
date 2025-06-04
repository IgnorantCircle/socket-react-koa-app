import { Context, Next } from 'koa';
import JWTUtils, { JwtPayload } from '../utils/jwt';
import User from '../models/User';

// 扩展Koa的Context类型
declare module 'koa' {
  interface DefaultState {
    user?: {
      userId: string;
      username: string;
      email: string;
    };
  }
}

// 认证中间件
export const authMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  try {
    const authHeader = ctx.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      ctx.status = 401;
      ctx.body = { message: '未提供访问令牌' };
      return;
    }

    const decoded = JWTUtils.verifyToken(token);
    if (!decoded) {
      ctx.status = 401;
      ctx.body = { message: '无效的访问令牌' };
      return;
    }

    // 验证用户是否存在且处于活跃状态
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      ctx.status = 401;
      ctx.body = { message: '用户不存在或已被禁用' };
      return;
    }

    // 将用户信息添加到上下文中
    ctx.state.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email
    };

    await next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    ctx.status = 500;
    ctx.body = { message: '服务器内部错误' };
  }
};

// 可选认证中间件（不强制要求登录）
export const optionalAuthMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  try {
    const authHeader = ctx.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = JWTUtils.verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId).select('-password');
        if (user && user.isActive) {
          ctx.state.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email
          };
        }
      }
    }

    await next();
  } catch (error) {
    console.error('可选认证中间件错误:', error);
    await next();
  }
};

// 管理员权限中间件（如果需要的话）
export const adminMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  // 这里可以添加管理员权限检查逻辑
  // 目前先简单通过，后续可以扩展用户角色系统
  await next();
};