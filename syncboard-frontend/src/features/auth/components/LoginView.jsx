import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/Button';

const LoginView = () => {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg-secondary p-8 rounded-xl shadow-lg border border-border text-center">
        <h1 className="text-3xl font-bold text-primary mb-6">SyncBoard</h1>
        <p className="text-text-secondary mb-6">Login to your account (Mock UI)</p>
        <Link to="/dashboard">
          <Button variant="primary" className="w-full">Sign In</Button>
        </Link>
      </div>
    </div>
  );
};

export default LoginView;
