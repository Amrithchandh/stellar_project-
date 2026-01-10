import React, { useState } from 'react';
import { ArrowLeft, Landmark, ShieldCheck, Cpu } from 'lucide-react';

const ConnectBank = ({ onBack, onConnect }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const handleConnect = () => {
    if (apiKey.length < 8) {
      alert("Please enter a valid Bank API Key (min 8 chars)");
      return;
    }
    
    setIsLinking(true);
    setTimeout(() => {
      onConnect({
        bankName: 'Global Reserve Bank',
        lastFour: '8821',
        apiKey: apiKey
      });
      setIsLinking(false);
    }, 2500);
  };

  if (isLinking) {
    return (
      <div className="app-shell animate-fade" style={{ background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <div className="shimmer" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #e8f0fe', borderTopColor: '#1a73e8', animation: 'spin 1.5s linear infinite' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a73e8', marginTop: '32px' }}>Securing Connection...</h2>
        <p style={{ color: '#5f6368', marginTop: '12px', textAlign: 'center' }}>Validating API key with banking server</p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)' }}>
      <header className="header">
        <ArrowLeft onClick={onBack} cursor="pointer" size={24} />
        <h3 style={{ fontSize: '18px', fontWeight: '700', flex: 1, marginLeft: '16px' }}>Link bank account</h3>
      </header>

      <div style={{ padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="icon-circle" style={{ width: '80px', height: '80px', margin: '0 auto 20px', background: '#fff' }}>
            <Cpu size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Connect to Bank Server</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Enter your original Bank API Key to synchronize your accounts.
          </p>
        </div>

        <div className="glass-card" style={{ margin: '0', background: 'var(--surface)' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
            Bank API Key
          </label>
          <input 
            type="password"
            placeholder="e.g. key_live_2837xxxx"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1.5px solid var(--border)',
              fontSize: '16px',
              outline: 'none',
              background: 'var(--bg-color)',
              fontFamily: 'monospace'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={16} />
            <span style={{ fontSize: '12px' }}>256-bit encrypted bank connection</span>
          </div>
        </div>

        <button 
          className="btn-premium btn-primary" 
          style={{ width: '100%', marginTop: '32px', padding: '18px' }}
          onClick={handleConnect}
          disabled={!apiKey}
        >
          Connect & Link Account
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Your data is never shared with third parties.
        </p>
      </div>
    </div>
  );
};

export default ConnectBank;
