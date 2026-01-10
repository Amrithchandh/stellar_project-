import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import BalanceDisplay from './components/BalanceDisplay';
import PayScreen from './components/PayScreen';
import PinScreen from './components/PinScreen';
import SuccessScreen from './components/SuccessScreen';
import Scanner from './components/Scanner';
import { useBalance } from './hooks/useBalance';
import { logBehavioralEvent } from './utils/logger';
import { Smartphone, ShieldCheck, ArrowLeft, Sun, Moon, QrCode } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('home');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const { wallets, totalBalance, deduct } = useBalance();
  const [paymentDetails, setPaymentDetails] = useState({ amount: 0, walletId: 'leisure', recipient: '', note: '', isFailure: false });
  const [scannedRecipient, setScannedRecipient] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handlePaymentComplete = (amount, walletId, recipient, note) => {
    // 10% Failure Probability for simulation
    const isFailure = Math.random() < 0.1;

    if (isFailure) {
      logBehavioralEvent('payment_failed', { amount, walletId, recipient });
      setPaymentDetails({ amount, walletId, recipient, note, isFailure: true });
      setScreen('success');
      return;
    }

    const success = deduct(amount, walletId);
    if (success) {
      logBehavioralEvent('payment_success', { amount, walletId, recipient });
      setPaymentDetails({ amount, walletId, recipient, note, isFailure: false });
      setScreen('success');
    } else {
      alert('Insufficient funds!');
      setScreen('home');
    }
  };

  const renderScreen = () => {
    if (!user) return <Auth onLogin={(u) => setUser(u)} />;

    switch (screen) {
      case 'scan':
        return (
          <Scanner
            onScan={(data) => { setScannedRecipient(data); setScreen('pay'); }}
            onBack={() => setScreen('home')}
          />
        );
      case 'pay':
        return (
          <PayScreen
            wallets={wallets}
            initialRecipient={scannedRecipient}
            onPay={(amount, walletId, recipient, note) => {
              setPaymentDetails({ amount, walletId, recipient, note });
              setScreen('pin');
            }}
            onBack={() => { setScreen('home'); setScannedRecipient(''); }}
          />
        );
      case 'pin':
        return (
          <PinScreen
            amount={paymentDetails.amount}
            recipient={paymentDetails.recipient}
            onComplete={() => handlePaymentComplete(paymentDetails.amount, paymentDetails.walletId, paymentDetails.recipient, paymentDetails.note)}
            onBack={() => setScreen('pay')}
          />
        );
      case 'success':
        return (
          <SuccessScreen
            amount={paymentDetails.amount}
            walletName={paymentDetails.walletId}
            recipient={paymentDetails.recipient}
            isFailure={paymentDetails.isFailure}
            onDone={() => { setScreen('home'); setScannedRecipient(''); }}
          />
        );
      case 'home':
      default:
        return (
          <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)' }}>
            <header className="header" style={{ width: '100%', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, background: 'var(--surface)', borderRadius: '24px', padding: '10px 16px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>YOUR IDENTITY 🌱</span>
                <span style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: '600' }}>{user.upiId}</span>
              </div>
              <div style={{ position: 'relative' }} onClick={toggleTheme}>
                <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                  {user.name.charAt(0)}
                </div>
              </div>
            </header>

            <BalanceDisplay balance={totalBalance} />

            {/* Emergency Buffer Progress Bar */}
            <div className="progress-container animate-fade">
              <div className="progress-header">
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.5px' }}>EMERGENCY BUFFER 🌱</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>
                  {Math.min(100, Math.floor((wallets.savings / 2000) * 100))}% SET
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(100, Math.floor((wallets.savings / 2000) * 100))}%` }}
                />
              </div>
              <div className="milestones" style={{ marginTop: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className={`milestone-dot ${wallets.savings >= 500 ? 'active' : ''}`} style={{ margin: '0 auto 4px' }} />
                  <span style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-secondary)' }}>25% <br /> Buffer</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className={`milestone-dot ${wallets.savings >= 1000 ? 'active' : ''}`} style={{ margin: '0 auto 4px' }} />
                  <span style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-secondary)' }}>50% <br /> Halfway</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className={`milestone-dot ${wallets.savings >= 1500 ? 'active' : ''}`} style={{ margin: '0 auto 4px' }} />
                  <span style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-secondary)' }}>75% <br /> Almost</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className={`milestone-dot ${wallets.savings >= 2000 ? 'active' : ''}`} style={{ margin: '0 auto 4px' }} />
                  <span style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-secondary)' }}>100% <br /> Ready</span>
                </div>
              </div>
            </div>

            {/* Wallets Grid */}
            <div className="services-grid">
              {Object.entries(wallets).map(([key, val]) => (
                <div key={key} className="service-item" onClick={() => {
                  setPaymentDetails({ ...paymentDetails, walletId: key });
                  setScreen('pay');
                }}>
                  <div className="icon-circle">
                    <Smartphone size={20} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>₹{val}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '0 20px', marginTop: '10px' }}>
              <button className="btn-premium btn-primary" style={{ width: '100%', borderRadius: '20px', height: '56px' }} onClick={() => setScreen('pay')}>
                <QrCode size={20} /> Scan & Pay Any QR
              </button>
            </div>

            <nav className="nav-bottom">
              <div className="nav-item active"><Smartphone size={20} /><span>Home</span></div>
              <div className="nav-item" onClick={() => { setScreen('scan'); }}><QrCode size={20} /><span>Scan</span></div>
              <div className="nav-item" onClick={() => window.location.reload()}><ArrowLeft size={20} /><span>Reset</span></div>
            </nav>
          </div>
        );
    }
  };

  return renderScreen();
};

export default App;
