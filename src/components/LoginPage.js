// src/components/LoginPage.js
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { apiFetch } from '../api';

const LoginPage = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = loginMode === 'login' ? '/auth/login' : '/auth/signup';
      const user = await apiFetch(endpoint, 'POST', { username, password });

      // Pass the user object to App.js
      onLogin(user.user);

      // Clear inputs
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Server error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <ShoppingCart className="w-12 h-12 text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">MarketPlace</h1>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setLoginMode('login')}
            className={`flex-1 py-2 rounded-md transition ${loginMode === 'login' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            Login
          </button>
          <button
            onClick={() => setLoginMode('signup')}
            className={`flex-1 py-2 rounded-md transition ${loginMode === 'signup' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {loading ? 'Please wait...' : loginMode === 'signup' ? 'Sign Up & Get $2000' : 'Login'}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

        {loginMode === 'signup' && (
          <p className="text-center text-sm text-gray-600 mt-4">New users get $2000 starting balance!</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
