import React from 'react';
import { logBehavioralEvent } from '../utils/logger';

const Login = ({ onLogin }) => {
  const handleLogin = () => {
    const mockUser = {
      name: 'Amrit Raj',
      email: 'amrid.test@gmail.com',
      upiId: 'amrid@oksbi'
    };
    logBehavioralEvent('login_attempt', { email: mockUser.email });
    onLogin(mockUser);
  };

  return (
    <div className="app-shell animate-fade" style={{ justifyContent: 'center', padding: '32px' }}>
      <div className="glass-card" style={{ textAlign: 'center', margin: '0', background: 'var(--surface)' }}>
        <img 
          src="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
          alt="Google" 
          style={{ width: '100px', marginBottom: '32px' }}
        />
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Welcome to Study
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '15px' }}>
          Participate in our UPI behavioral research simulation
        </p>
        
        <button className="btn-premium btn-primary" style={{ width: '100%' }} onClick={handleLogin}>
          Sign in with Google
        </button>
        
        <p style={{ marginTop: '32px', fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.7 }}>
          This is a research prototype.<br/>No real money will be deducted.
        </p>
      </div>
    </div>
  );
};

export default Login;
