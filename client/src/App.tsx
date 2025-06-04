import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import Chat from './components/Chat';
import './App.css';

// 主应用组件
const AppContent: React.FC = () => {
  const { state } = useAuth();

  // 显示加载状态
  if (state.isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  // 根据认证状态显示不同组件
  return (
    <div className="app">
      {state.isAuthenticated && state.user ? (
        <Chat currentUser={state.user} />
      ) : (
        <AuthForm />
      )}
    </div>
  );
};

// 根应用组件
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
