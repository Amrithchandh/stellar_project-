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
import {
  Plus, Search, QrCode, User, Send, Building2, ChevronRight, History,
  Settings, Moon, Sun, Smartphone, AtSign, ArrowRightLeft, Receipt, Zap, CreditCard, Leaf
} from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);
  const [studyGroup, setStudyGroup] = useState(() => localStorage.getItem('study_group') || 'test'); // 'control' or 'test'
  const { wallets, totalBalance, deduct } = useBalance();
  const [lastPayment, setLastPayment] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [bankAccounts, setBankAccounts] = useState(() => {
    const saved = localStorage.getItem('study_bank_accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [balanceCheckWallet, setBalanceCheckWallet] = useState(null);

  useEffect(() => {
    localStorage.setItem('study_group', studyGroup);
  }, [studyGroup]);

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

  const toggleStudyGroup = () => {
    setStudyGroup(prev => prev === 'control' ? 'test' : 'control');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    logBehavioralEvent('login_complete', { group: studyGroup });
  };

  const handleInitiatePay = (amount, walletId, recipient, note, needType) => {
    if (recipient === user.upiId || recipient === user.email) {
      alert("You cannot transfer money to yourself!");
      return;
    }
    setPendingPayment({ amount, walletId, recipient, note, needType });
    setScreen('pin');
  };

  const handlePinComplete = () => {
    if (balanceCheckWallet) {
      alert(`Balance for ${balanceCheckWallet}: ₹${wallets[balanceCheckWallet.toLowerCase()].toLocaleString('en-IN')}`);
      setBalanceCheckWallet(null);
      setScreen('home');
      return;
    }

    if (pendingPayment) {
      const { amount, walletId, needType } = pendingPayment;
      const success = deduct(amount, walletId);

      if (success) {
        setLastPayment({
          amount,
          walletId,
          walletName: walletId.charAt(0).toUpperCase() + walletId.slice(1),
          recipient: pendingPayment.recipient,
          needType
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
  const getSavingsMilestone = () => {
    const savings = wallets.savings;
    const initialSavings = 1000;
    const percent = Math.min((savings / initialSavings) * 100, 100);

    if (percent >= 100) return "Emergency buffer set";
    if (percent >= 75) return "Almost there";
    if (percent >= 50) return "Halfway to emergency buffer";
    if (percent >= 25) return "Started building buffer";
    return "Building foundation";
  };

  const [lastMilestone, setLastMilestone] = useState("");
  useEffect(() => {
    const current = getSavingsMilestone();
    if (!lastMilestone || current !== lastMilestone) {
      setLastMilestone(current);
    }
  }, [wallets.savings]);

  const [scannedRecipient, setScannedRecipient] = useState('');

  if (!user) {
    return (
      <div className="app-shell">
        <header className="header" style={{ justifyContent: 'flex-end' }}>
          <div className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
        </header>
        <Auth onLogin={handleLogin} studyGroup={studyGroup} onToggleGroup={toggleStudyGroup} />
      </div>
    );
  }

  if (screen === 'failure') {
    return (
      <div className="app-shell animate-fade" style={{ background: '#fff', textAlign: 'center', padding: '100px 24px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fce8e6', color: '#d93025', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <AtSign size={40} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Transaction Failed</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Insufficient balance or technical error. Please try again.</p>
        <button
          onClick={() => setScreen('home')}
          className="btn-premium btn-primary"
          style={{ width: '100%', marginTop: '40px', background: '#d93025' }}
        >
          Go Back
        </button>
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
        studyGroup={studyGroup}
        onFail={() => setScreen('failure')}
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
        studyGroup={studyGroup}
        needType={lastPayment.needType}
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
    <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
      {/* Refreshing Header */}
      <header style={{
        padding: '24px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        position: 'sticky',
        top: 0,
        background: 'rgba(247, 252, 249, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 10
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Leaf size={24} color="var(--primary)" />
            <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' }}>nudge.</span>
          </div>
        </div>
        <div style={{
          width: '38px', height: '38px', borderRadius: '14px',
          background: 'var(--primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(45, 106, 79, 0.2)'
        }}>
          {user.name.charAt(0)}
        </div>
      </header>

      <main style={{ padding: '0 20px 140px' }}>
        {/* Savings Reinforcement Bar */}
        <div style={{
          margin: '16px 0 24px',
          padding: '24px',
          background: 'white',
          borderRadius: '28px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Savings Buffer</h4>
              <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>{lastMilestone}</p>
            </div>
            <ShieldCheck size={28} color="var(--primary)" style={{ opacity: 0.15 }} />
          </div>

          <div style={{ height: '10px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min((wallets.savings / 1000) * 100, 100)}%`,
              height: '100%',
              background: 'var(--primary)',
              borderRadius: '10px',
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>₹{wallets.savings} of ₹1,000</span>
          </div>
        </div>

        <BalanceDisplay balance={totalBalance} studyGroup={studyGroup} />

        {/* Action Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px 12px',
          marginTop: '32px',
          marginBottom: '40px'
        }}>
          {[
            { label: 'Pay Contacts', icon: <User size={22} />, color: '#d8f3dc', iconColor: '#2d6a4f', action: () => setScreen('pay') },
            { label: 'Phone', icon: <Smartphone size={22} />, color: '#e9edc9', iconColor: '#606c38', action: () => setScreen('pay') },
            { label: 'QR Scan', icon: <QrCode size={22} />, color: '#dcf2f1', iconColor: '#1a73e8', action: () => setScreen('scan') },
            { label: 'Bank', icon: <Building2 size={22} />, color: '#f0f4f8', iconColor: '#5a7d6e', action: () => setScreen('pay') },
            { label: 'Self', icon: <ArrowRightLeft size={22} />, color: '#e8e8e8', iconColor: '#444', action: () => setScreen('pay') },
            { label: 'Bills', icon: <Receipt size={22} />, color: '#fce8e6', iconColor: '#d93025', action: () => setScreen('pay') },
            { label: 'Recharge', icon: <Zap size={22} />, color: '#fff3b0', iconColor: '#e09f3e', action: () => setScreen('pay') },
            { label: 'History', icon: <History size={22} />, color: '#f8f9fa', iconColor: '#333', action: () => setScreen('pay') }
          ].map((item, idx) => (
            <div key={idx} onClick={item.action} style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{
                width: '58px', height: '58px', margin: '0 auto 10px',
                borderRadius: '22px', background: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.iconColor,
                boxShadow: '0 6px 16px rgba(0,0,0,0.03)'
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Manage Money section */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>Manage your money</h4>
          <div
            onClick={() => setScreen('bank-accounts')}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
              background: 'white', borderRadius: '20px', border: '1px solid var(--border)',
              cursor: 'pointer', marginBottom: '12px'
            }}
          >
            <Building2 size={24} color="var(--primary)" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700' }}>Bank accounts</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>View and manage connected banks</p>
            </div>
            <ChevronRight size={20} color="var(--text-secondary)" />
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setScreen('scan')}
        style={{
          position: 'fixed', bottom: '32px', right: '24px',
          width: '56px', height: '56px', borderRadius: '18px',
          background: 'var(--primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(45, 106, 79, 0.3)',
          border: 'none', cursor: 'pointer', zIndex: 100
        }}
      >
        <QrCode size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default App;

