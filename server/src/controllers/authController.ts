import { Context } from 'koa';
import User, { IUser } from '../models/User';
import JWTUtils from '../utils/jwt';

// 用户注册
export const register = async (ctx: Context): Promise<void> => {
  try {
    const { username, email, password, avatar } = ctx.request.body as {
      username: string;
      email: string;
      password: string;
      avatar?: string;
    };

    // 验证必填字段
    if (!username || !email || !password) {
      ctx.status = 400;
      ctx.body = { message: '用户名、邮箱和密码为必填项' };
      return;
    }

    // 验证密码长度
    if (password.length < 6) {
      ctx.status = 400;
      ctx.body = { message: '密码长度至少为6位' };
      return;
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      ctx.status = 400;
      ctx.body = { message: '用户名已被使用' };
      return;
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      ctx.status = 400;
      ctx.body = { message: '邮箱已被使用' };
      return;
    }

    // 创建新用户
    const newUser = new User({
      username,
      email,
      password,
      avatar: avatar || ''
    });

    await newUser.save();

    // 生成token
    const tokens = JWTUtils.generateTokenPair(newUser);

    // 返回用户信息（不包含密码）
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    ctx.status = 201;
    ctx.body = {
      message: '注册成功',
      user: userResponse,
      ...tokens
    };
  } catch (error) {
    console.error('注册失败:', error);
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
  }
};

// 用户登录
export const login = async (ctx: Context): Promise<void> => {
  try {
    const { username, password } = ctx.request.body as {
      username: string;
      password: string;
    };

    // 验证必填字段
    if (!username || !password) {
      ctx.status = 400;
      ctx.body = { message: '用户名和密码为必填项' };
      return;
    }

    // 查找用户（支持用户名或邮箱登录）
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    });

    if (!user) {
      ctx.status = 401;
      ctx.body = { message: '用户名或密码错误' };
      return;
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      ctx.status = 401;
      ctx.body = { message: '账户已被禁用，请联系管理员' };
      return;
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      ctx.status = 401;
      ctx.body = { message: '用户名或密码错误' };
      return;
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成token
    const tokens = JWTUtils.generateTokenPair(user);

    // 返回用户信息（不包含密码）
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    };

    ctx.status = 200;
    ctx.body = {
      message: '登录成功',
      user: userResponse,
      ...tokens
    };
  } catch (error) {
    console.error('登录失败:', error);
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
  }
};

// 刷新token
export const refreshToken = async (ctx: Context): Promise<void> => {
  try {
    const { refreshToken } = ctx.request.body as { refreshToken: string };

    if (!refreshToken) {
      ctx.status = 400;
      ctx.body = { message: '刷新令牌为必填项' };
      return;
    }

    // 验证刷新令牌
    const decoded = JWTUtils.verifyToken(refreshToken);
    if (!decoded) {
      ctx.status = 401;
      ctx.body = { message: '无效的刷新令牌' };
      return;
    }

    // 查找用户
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      ctx.status = 401;
      ctx.body = { message: '用户不存在或已被禁用' };
      return;
    }

    // 生成新的token对
    const tokens = JWTUtils.generateTokenPair(user);

    ctx.status = 200;
    ctx.body = {
      message: '令牌刷新成功',
      ...tokens
    };
  } catch (error) {
    console.error('刷新令牌失败:', error);
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
  }
};

// 获取当前用户信息
export const getCurrentUser = async (ctx: Context): Promise<void> => {
  try {
    const userId = ctx.state.user?.userId;
    
    if (!userId) {
      ctx.status = 401;
      ctx.body = { message: '未授权访问' };
      return;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      ctx.status = 404;
      ctx.body = { message: '用户不存在' };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
  }
};

// 修改密码
export const changePassword = async (ctx: Context): Promise<void> => {
  try {
    const userId = ctx.state.user?.userId;
    const { currentPassword, newPassword } = ctx.request.body as {
      currentPassword: string;
      newPassword: string;
    };

    if (!userId) {
      ctx.status = 401;
      ctx.body = { message: '未授权访问' };
      return;
    }

    if (!currentPassword || !newPassword) {
      ctx.status = 400;
      ctx.body = { message: '当前密码和新密码为必填项' };
      return;
    }

    if (newPassword.length < 6) {
      ctx.status = 400;
      ctx.body = { message: '新密码长度至少为6位' };
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      ctx.status = 404;
      ctx.body = { message: '用户不存在' };
      return;
    }

    // 验证当前密码
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      ctx.status = 400;
      ctx.body = { message: '当前密码错误' };
      return;
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    ctx.status = 200;
    ctx.body = { message: '密码修改成功' };
  } catch (error) {
    console.error('修改密码失败:', error);
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
  }
};

// 注销登录（可以在前端删除token，这里主要用于记录）
export const logout = async (ctx: Context): Promise<void> => {
  try {
    // 这里可以添加token黑名单逻辑，暂时简单返回成功
    ctx.status = 200;
    ctx.body = { message: '注销成功' };
  } catch (error) {
    console.error('注销失败:', error);
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
  }
};