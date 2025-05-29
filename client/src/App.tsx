import React, { useState } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  // 处理用户登录
  const handleLogin = (loggedInUser: any) => {
    setUser(loggedInUser);
  };

  return (
    <div className="app">
      {user ? (
        <Chat currentUser={user} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
