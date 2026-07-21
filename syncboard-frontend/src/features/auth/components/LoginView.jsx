import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { useAuthStore } from '../state/useAuthStore';

const LoginView = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('password123');
  const { login, register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      // error is handled in store
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg-secondary p-8 rounded-xl shadow-lg border border-border text-center">
        <h1 className="text-3xl font-bold text-primary mb-6">SyncBoard</h1>
        <p className="text-text-secondary mb-4">{isRegister ? 'Create a new account' : 'Login to your account'}</p>
        <form onSubmit={handleSubmit} className="text-left mb-4">
          {isRegister && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-bg-primary text-text-primary"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-bg-primary text-text-primary"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-bg-primary text-text-primary"
              required
            />
          </div>
          {error && <div className="mb-4 text-danger text-sm">{error}</div>}
          <Button variant="primary" className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>
        <button 
          onClick={() => setIsRegister(!isRegister)} 
          className="text-primary hover:underline text-sm"
          type="button"
        >
          {isRegister ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  );
};

export default LoginView;

