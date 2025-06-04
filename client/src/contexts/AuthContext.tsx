import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';

// 认证状态接口
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 认证动作类型
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// 认证上下文接口
interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, avatar?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// 初始状态
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// 认证reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 检查认证状态
  const checkAuthStatus = async (): Promise<void> => {
    try {
      if (authService.isAuthenticated()) {
        const user = authService.getStoredUser();
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
          // 尝试获取最新的用户信息
          try {
            const currentUser = await authService.getCurrentUser();
            dispatch({ type: 'UPDATE_USER', payload: currentUser });
          } catch (error) {
            // 如果获取失败，使用本地存储的用户信息
            console.warn('获取最新用户信息失败，使用本地缓存');
          }
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  // 登录
  const login = async (username: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const authData = await authService.login({ username, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: authData.user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '登录失败，请重试';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // 注册
  const register = async (
    username: string,
    email: string,
    password: string,
    avatar?: string
  ): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const authData = await authService.register({ username, email, password, avatar });
      dispatch({ type: 'AUTH_SUCCESS', payload: authData.user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '注册失败，请重试';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // 注销
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('注销失败:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // 更新用户信息
  const updateUser = (user: User): void => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  // 清除错误
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // 组件挂载时检查认证状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// 使用认证上下文的Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;