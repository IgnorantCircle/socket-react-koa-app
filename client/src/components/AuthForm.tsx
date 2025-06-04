import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthForm.css';

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { state, login, register, clearError } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除对应字段的验证错误
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // 清除全局错误
    if (state.error) {
      clearError();
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 用户名验证
    if (!formData.username.trim()) {
      errors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      errors.username = '用户名至少3个字符';
    } else if (formData.username.length > 20) {
      errors.username = '用户名不能超过20个字符';
    }

    // 邮箱验证（仅注册模式）
    if (!isLoginMode) {
      if (!formData.email.trim()) {
        errors.email = '邮箱不能为空';
      } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
        errors.email = '请输入有效的邮箱地址';
      }
    }

    // 密码验证
    if (!formData.password) {
      errors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      errors.password = '密码至少6个字符';
    }

    // 确认密码验证（仅注册模式）
    if (!isLoginMode) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = '请确认密码';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = '两次输入的密码不一致';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isLoginMode) {
        await login(formData.username, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password, formData.avatar);
      }
      
      // 成功后重置表单
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        avatar: ''
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // 错误已经在context中处理
      console.error('认证失败:', error);
    }
  };

  // 切换登录/注册模式
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatar: ''
    });
    setValidationErrors({});
    clearError();
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">
          {isLoginMode ? '登录' : '注册'}
        </h2>
        
        <form onSubmit={handleSubmit} className="auth-form-content">
          {/* 用户名 */}
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={validationErrors.username ? 'error' : ''}
              placeholder={isLoginMode ? '用户名或邮箱' : '用户名'}
              disabled={state.isLoading}
            />
            {validationErrors.username && (
              <span className="error-message">{validationErrors.username}</span>
            )}
          </div>

          {/* 邮箱（仅注册模式） */}
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={validationErrors.email ? 'error' : ''}
                placeholder="请输入邮箱地址"
                disabled={state.isLoading}
              />
              {validationErrors.email && (
                <span className="error-message">{validationErrors.email}</span>
              )}
            </div>
          )}

          {/* 密码 */}
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={validationErrors.password ? 'error' : ''}
              placeholder="请输入密码"
              disabled={state.isLoading}
            />
            {validationErrors.password && (
              <span className="error-message">{validationErrors.password}</span>
            )}
          </div>

          {/* 确认密码（仅注册模式） */}
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={validationErrors.confirmPassword ? 'error' : ''}
                placeholder="请再次输入密码"
                disabled={state.isLoading}
              />
              {validationErrors.confirmPassword && (
                <span className="error-message">{validationErrors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* 头像URL（仅注册模式，可选） */}
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="avatar">头像URL（可选）</label>
              <input
                type="url"
                id="avatar"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                placeholder="请输入头像图片URL"
                disabled={state.isLoading}
              />
            </div>
          )}

          {/* 全局错误信息 */}
          {state.error && (
            <div className="error-message global-error">
              {state.error}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={state.isLoading}
          >
            {state.isLoading ? '处理中...' : (isLoginMode ? '登录' : '注册')}
          </button>
        </form>

        {/* 切换模式 */}
        <div className="auth-switch">
          <span>
            {isLoginMode ? '还没有账户？' : '已有账户？'}
          </span>
          <button
            type="button"
            className="auth-switch-btn"
            onClick={toggleMode}
            disabled={state.isLoading}
          >
            {isLoginMode ? '立即注册' : '立即登录'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;