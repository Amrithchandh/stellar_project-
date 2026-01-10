import React, { useState, useEffect } from 'react';
import Auth from './components/Auth'; // Changed from Login
import BalanceDisplay from './components/BalanceDisplay';
import PayScreen from './components/PayScreen';
import PinScreen from './components/PinScreen';
import SuccessScreen from './components/SuccessScreen';
import BankAccounts from './components/BankAccounts';
import ConnectBank from './components/ConnectBank';
import Scanner from './components/Scanner'; // Imported Scanner
import { useBalance } from './hooks/useBalance';
import { logBehavioralEvent } from './utils/logger';
import { Send, History, User, Settings, CreditCard, Search, Sun, Moon, QrCode, Building2, Landmark, ShieldCheck } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('home');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const { wallets, totalBalance, deduct } = useBalance();
  const [lastPayment, setLastPayment] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [bankAccounts, setBankAccounts] = useState(() => {
    const saved = localStorage.getItem('study_bank_accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [balanceCheckWallet, setBalanceCheckWallet] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('study_bank_accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleInitiatePay = (amount, walletId, recipient, note) => {
    if (recipient === user.upiId || recipient === user.email) {
      alert("You cannot transfer money to yourself!");
      return;
    }
    setPendingPayment({ amount, walletId, recipient, note });
    setScreen('pin');
  };

  const handlePinComplete = () => {
    if (balanceCheckWallet) {
      alert(`Balance for ${balanceCheckWallet}: ?${wallets[balanceCheckWallet.toLowerCase()].toLocaleString('en-IN')}`);
      setBalanceCheckWallet(null);
      setScreen('home');
      return;
    }

    if (pendingPayment) {
      const { amount, walletId } = pendingPayment;
      const success = deduct(amount, walletId);

      if (success) {
        setLastPayment({
          amount,
          walletId,
          walletName: walletId.charAt(0).toUpperCase() + walletId.slice(1),
          recipient: pendingPayment.recipient
        });
        setScreen('success');
      } else {
        alert('Insufficient funds in selected wallet!');
        setScreen('home');
      }
      setPendingPayment(null);
    }
  };

  const handleAddBank = (bankData) => {
    setBankAccounts(prev => [...prev, bankData]);
    setScreen('bank-accounts');
    logBehavioralEvent('bank_linked', { bank: bankData.bankName });
  };

  const handleDone = () => {
    setScreen('home');
    setLastPayment(null);
  };

  const handleScanComplete = (recipient) => {
    setScreen('pay');
    // We pass the scanned recipient data via a temporary prop or state if needed, 
    // but here passing via explicit prop on PayScreen is best.
    // For now, we'll store it in pendingPayment temporarily or just assume PayScreen defaults if not provided.
    // A better way is to pass "initialRecipient" to PayScreen.
    setPendingPayment({ ...pendingPayment, recipient }); // Hacky usage of pendingPayment to pass data? No, let's use a new state.
  };
  // Better approach: State for prefilled recipient
  const [scannedRecipient, setScannedRecipient] = useState('');

  if (!user) {
    return (
      <div className="app-shell">
        <header className="header" style={{ justifyContent: 'flex-end' }}>
          <div className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
        </header>
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  if (screen === 'scan') {
    return <Scanner onScan={(data) => {
      setScannedRecipient(data);
      setScreen('pay');
    }} onBack={() => setScreen('home')} />;
  }

  if (screen === 'pay') {
    return (
      <PayScreen
        wallets={wallets}
        onPay={handleInitiatePay}
        onBack={() => { setScreen('home'); setScannedRecipient(''); }}
        initialRecipient={scannedRecipient}
      />
    );
  }

  if (screen === 'pin') {
    return (
      <PinScreen
        amount={pendingPayment ? pendingPayment.amount : 0}
        recipient={pendingPayment ? pendingPayment.recipient : "Balance Check"}
        onComplete={handlePinComplete}
        onBack={() => {
          setPendingPayment(null);
          setBalanceCheckWallet(null);
          setScreen('home');
        }}
      />
    );
  }

  if (screen === 'success') {
    return (
      <SuccessScreen
        amount={lastPayment.amount}
        walletName={lastPayment.walletName}
        recipient={lastPayment.recipient}
        onDone={handleDone}
      />
    );
  }

  if (screen === 'bank-accounts') {
    return (
      <BankAccounts
        accounts={bankAccounts}
        onAddBank={() => setScreen('connect-bank')}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'connect-bank') {
    return (
      <ConnectBank
        onConnect={handleAddBank}
        onBack={() => setScreen('bank-accounts')}
      />
    );
  }

  return (
    <div className="app-shell animate-fade">
      <header className="header" style={{ width: '100%', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1, background: 'var(--surface)', borderRadius: '24px', padding: '10px 16px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>YOUR UPI ID</span>
          <span style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: '600' }}>{user.upiId}</span>
        </div>
        <div style={{ position: 'relative' }} onClick={() => toggleTheme()}>
          <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div style={{ position: 'absolute', bottom: -2, right: -2, width: '12px', height: '12px', background: '#34a853', borderRadius: '50%', border: '2px solid var(--bg-color)' }} />
        </div>
      </header>

      <main style={{ paddingBottom: '100px' }}>
        <div style={{ padding: '0 20px', marginTop: '8px' }}>
          <img
            src="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
            alt="GPay"
            style={{ height: '20px', opacity: 0.8 }}
          />
        </div>

        <BalanceDisplay balance={totalBalance} />

        <div className="services-grid">
          {[
            { label: 'Scan QR', icon: <QrCode size={22} />, action: () => setScreen('scan') },
            { label: 'Pay contacts', icon: <User size={22} />, action: () => setScreen('pay') },
            { label: 'Pay phone', icon: <Send size={22} />, action: () => setScreen('pay') },
            { label: 'Bank transfer', icon: <Building2 size={22} />, action: () => setScreen('pay') }
          ].map((item, idx) => (
            <div key={idx} className="service-item" onClick={item.action}>
              <div className="icon-circle">{item.icon}</div>
              <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-main)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '24px' }}>
          <h4 style={{ padding: '0 20px', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>People</h4>
          <div className="people-grid">
            {[
              { name: 'Research', char: 'R' },
              { name: 'Jan Study', char: 'J' },
              { name: 'Validation', char: 'V' },
              { name: 'Participant', char: 'P' },
              { name: 'System', char: 'S' }
            ].map((p, i) => (
              <div key={i} className="person-circle" onClick={() => setScreen('pay')}>
                <div className="avatar" style={{ width: '56px', height: '56px', background: `hsl(${i * 60}, 60%, 50%)` }}>
                  {p.char}
                </div>
                <span style={{ fontSize: '12px', fontWeight: '500' }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px 20px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Manage your money</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div
              className="glass-card"
              style={{ margin: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}
              onClick={() => setScreen('bank-accounts')}
            >
              <Building2 size={24} color="var(--primary)" />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Bank accounts</span>
            </div>
            <div
              className="glass-card"
              style={{ margin: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}
              onClick={() => {
                setBalanceCheckWallet('Savings');
                setScreen('pin');
              }}
            >
              <ShieldCheck size={24} color="var(--primary)" />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Check balance</span>
            </div>
          </div>
        </div>
      </main>

      <nav className="nav-bottom">
        <div className="nav-item active">
          <CreditCard size={24} />
          <span>Pay</span>
        </div>
        <div className="nav-item">
          <History size={24} />
          <span>Transactions</span>
        </div>
        <div className="nav-item">
          <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{user.name ? user.name.charAt(0) : 'U'}</div>
          <span>Account</span>
        </div>
      </nav>
    </div>
  );
};

export default App;

