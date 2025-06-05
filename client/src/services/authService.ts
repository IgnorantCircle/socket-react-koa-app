import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// 创建axios实例
const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token过期
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authAPI.post('/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return authAPI(originalRequest);
        }
      } catch (refreshError) {
        // 刷新失败，清除所有token并跳转到登录页
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  // 用户注册
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await authAPI.post('/register', data);
    const authData = response.data;
    
    // 保存token和用户信息
    this.saveAuthData(authData);
    
    return authData;
  }

  // 用户登录
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await authAPI.post('/login', data);
    const authData = response.data;
    
    // 保存token和用户信息
    this.saveAuthData(authData);
    
    return authData;
  }

  // 刷新token
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string; expiresIn: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('没有刷新令牌');
    }
    
    const response = await authAPI.post('/refresh', { refreshToken });
    const tokenData = response.data;
    
    localStorage.setItem('accessToken', tokenData.accessToken);
    localStorage.setItem('refreshToken', tokenData.refreshToken);
    
    return tokenData;
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    const response = await authAPI.get('/me');
    const userData = response.data.user;
    
    // 更新本地存储的用户信息
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  }

  // 修改密码
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await authAPI.post('/change-password', data);
    return response.data;
  }

  // 注销登录
  async logout(): Promise<void> {
    try {
      await authAPI.post('/logout');
    } catch (error) {
      console.error('注销请求失败:', error);
    } finally {
      // 无论请求是否成功，都清除本地数据
      this.clearAuthData();
    }
  }

  // 保存认证数据到本地存储
  private saveAuthData(authData: AuthResponse): void {
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }

  // 清除认证数据
  clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // 获取本地存储的用户信息
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        return null;
      }
    }
    return null;
  }

  // 获取访问令牌
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // 获取刷新令牌
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

export default new AuthService();