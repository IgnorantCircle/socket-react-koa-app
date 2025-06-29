import { Context } from 'koa';
import User, { IUser } from '../models/User';

// 获取所有用户
export const getUsers = async (ctx: Context): Promise<void> => {
  try {
    const users = await User.find().select('-password -__v');
    ctx.status = 200;
    ctx.body = users;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
    console.error('获取用户失败:', error);
  }
};

// 获取单个用户
export const getUserById = async (ctx: Context): Promise<void> => {
  try {
    const user = await User.findById(ctx.params.id).select('-password -__v');
    if (!user) {
      ctx.status = 404;
      ctx.body = { message: '用户不存在' };
      return;
    }
    ctx.status = 200;
    ctx.body = user;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
    console.error('获取用户失败:', error);
  }
};

// 创建用户（管理员功能）
export const createUser = async (ctx: Context): Promise<void> => {
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
      ctx.body = { message: '邮箱已被注册' };
      return;
    }
    
    // 创建新用户
    const newUser = new User({
      username,
      email,
      password,
      avatar
    });
    
    const savedUser = await newUser.save();
    
    // 返回用户信息（不包含密码）
    const userResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      avatar: savedUser.avatar,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    };
    
    ctx.status = 201;
    ctx.body = userResponse;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
    console.error('创建用户失败:', error);
  }
};

// 更新用户
export const updateUser = async (ctx: Context): Promise<void> => {
  try {
    const { username, email, avatar } = ctx.request.body as Partial<IUser>;
    const updatedUser = await User.findByIdAndUpdate(
      ctx.params.id,
      { username, email, avatar },
      { new: true }
    );
    
    if (!updatedUser) {
      ctx.status = 404;
      ctx.body = { message: '用户不存在' };
      return;
    }
    
    ctx.status = 200;
    ctx.body = updatedUser;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
    console.error('更新用户失败:', error);
  }
};

// 删除用户
export const deleteUser = async (ctx: Context): Promise<void> => {
  try {
    const deletedUser = await User.findByIdAndDelete(ctx.params.id);
    
    if (!deletedUser) {
      ctx.status = 404;
      ctx.body = { message: '用户不存在' };
      return;
    }
    
    ctx.status = 200;
    ctx.body = { message: '用户已删除' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '服务器错误' };
    console.error('删除用户失败:', error);
  }
};