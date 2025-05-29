import React, { useState } from 'react';
import apiService from '../services/apiService';
import './Login.css';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证输入
    if (!username.trim() || !email.trim()) {
      setError('请填写用户名和邮箱');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // 尝试查找用户
      const users = await apiService.getUsers();
      let user = users.find(u => u.username === username && u.email === email);
      
      // 如果用户不存在，则创建新用户
      if (!user) {
        user = await apiService.createUser({
          username,
          email
        });
      }
      
      // 登录成功
      onLogin(user);
    } catch (error) {
      console.error('登录失败:', error);
      setError('登录失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>欢迎使用聊天应用</h2>
        <p>请输入您的用户名和邮箱以开始聊天</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入您的用户名"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入您的邮箱"
              required
            />
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? '登录中...' : '开始聊天'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;