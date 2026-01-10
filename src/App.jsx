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
  Settings, Moon, Sun, Smartphone, AtSign, ArrowRightLeft, Receipt, Zap, CreditCard
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
    <div className="app-shell animate-fade" style={{ background: '#ffffff', minHeight: '100vh', color: '#1f1f1f' }}>
      {/* GPay Header */}
      <header style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        position: 'sticky',
        top: 0,
        background: '#ffffff',
        zIndex: 10,
        boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Pay by name or phone number"
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              borderRadius: '24px',
              background: '#f1f3f4',
              border: 'none',
              fontSize: '14px',
              outline: 'none',
              color: '#1f1f1f'
            }}
          />
          <Search size={18} color="#5f6368" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <div onClick={toggleTheme} style={{ cursor: 'pointer', padding: '8px', borderRadius: '50%', background: '#f1f3f4' }}>
          {theme === 'light' ? <Moon size={22} color="#5f6368" /> : <Sun size={22} color="#5f6368" />}
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'var(--primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 'bold'
        }}>
          {user.name.charAt(0)}
        </div>
      </header>

      <main style={{ padding: '24px 20px 100px' }}>
        {/* Hero Scan Banner */}
        <div
          onClick={() => setScreen('scan')}
          style={{
            background: 'linear-gradient(135deg, #1a73e8 0%, #174ea6 100%)',
            borderRadius: '24px',
            padding: '24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 16px rgba(26,115,232,0.2)',
            cursor: 'pointer',
            marginBottom: '32px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Scan any QR code</h3>
            <p style={{ fontSize: '13px', opacity: 0.9 }}>Pay at any shop or merchant</p>
          </div>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <QrCode size={26} />
          </div>
        </div>

        <BalanceDisplay balance={totalBalance} studyGroup={studyGroup} />

        {/* Service Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px 10px',
          marginTop: '32px',
          marginBottom: '40px'
        }}>
          {[
            { label: 'Pay contacts', icon: <User size={22} />, color: '#e8f0fe', iconColor: '#1a73e8' },
            { label: 'Pay phone', icon: <Smartphone size={22} />, color: '#fef7e0', iconColor: '#f9ab00' },
            { label: 'Bank transfer', icon: <Building2 size={22} />, color: '#e6f4ea', iconColor: '#1e8e3e' },
            { label: 'Pay UPI ID', icon: <AtSign size={22} />, color: '#fce8e6', iconColor: '#d93025' },
            { label: 'Self transfer', icon: <ArrowRightLeft size={22} />, color: '#f3e8fd', iconColor: '#9334e6' },
            { label: 'Pay bills', icon: <Receipt size={22} />, color: '#e4f7fb', iconColor: '#12b5cb' },
            { label: 'Mobile recharge', icon: <Zap size={22} />, color: '#fff0e0', iconColor: '#e67e22' },
            { label: 'Rewards', icon: <CreditCard size={22} />, color: '#fce4ec', iconColor: '#d81b60' }
          ].map((item, idx) => (
            <div key={idx} onClick={() => setScreen('pay')} style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{
                width: '56px', height: '56px', margin: '0 auto 8px',
                borderRadius: '18px', background: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.iconColor,
                transition: 'transform 0.2s'
              }} className="category-icon">
                {item.icon}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#3c4043' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Ads Section */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f1f1f', marginBottom: '16px' }}>Offers & Rewards</h3>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
            <div style={{
              minWidth: '280px', background: '#fef7e0', borderRadius: '24px',
              padding: '24px', border: '1px solid #fbe4a1', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#b06000', textTransform: 'uppercase', background: '#fff', padding: '2px 8px', borderRadius: '6px' }}>Featured</span>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginTop: '12px', color: '#5f3d00' }}>Instant Loans & EMI</h4>
                <p style={{ fontSize: '13px', color: '#855600', marginTop: '4px', opacity: 0.9 }}>Flexible repayment starting at ₹500/mo.</p>
                <button style={{ marginTop: '16px', background: '#1a73e8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Apply Now</button>
              </div>
              <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, transform: 'rotate(-15deg)' }}>
                <CreditCard size={100} />
              </div>
            </div>

            <div style={{
              minWidth: '280px', background: '#e8f0fe', borderRadius: '24px',
              padding: '24px', border: '1px solid #c2d7fa'
            }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#174ea6', textTransform: 'uppercase', background: '#fff', padding: '2px 8px', borderRadius: '6px' }}>Offer</span>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginTop: '12px', color: '#174ea6' }}>Flat ₹500 Rewards</h4>
              <p style={{ fontSize: '13px', color: '#1a73e8', marginTop: '4px', opacity: 0.9 }}>On your first personal loan via UPI.</p>
              <button style={{ marginTop: '16px', background: '#1a73e8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Check Limit</button>
            </div>
          </div>
        </div>

        {/* Management Section */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f1f1f', marginBottom: '16px' }}>Manage your money</h3>
          <div style={{ background: '#f8f9fa', borderRadius: '24px', padding: '12px', border: '1px solid #f1f3f4' }}>
            <div
              onClick={() => setScreen('bank-accounts')}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderBottom: '1px solid #eee', cursor: 'pointer' }}
            >
              <div style={{ background: '#e8f0fe', padding: '8px', borderRadius: '12px' }}>
                <Building2 size={20} color="#1a73e8" />
              </div>
              <span style={{ flex: 1, fontSize: '15px', fontWeight: '600' }}>Bank accounts</span>
              <ChevronRight size={18} color="#5f6368" />
            </div>
            <div
              onClick={() => {
                setBalanceCheckWallet('savings');
                setScreen('pin');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderBottom: '1px solid #eee', cursor: 'pointer' }}
            >
              <div style={{ background: '#e6f4ea', padding: '8px', borderRadius: '12px' }}>
                <History size={20} color="#1e8e3e" />
              </div>
              <span style={{ flex: 1, fontSize: '15px', fontWeight: '600' }}>Check bank balance</span>
              <ChevronRight size={18} color="#5f6368" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', cursor: 'pointer' }}>
              <div style={{ background: '#fef7e0', padding: '8px', borderRadius: '12px' }}>
                <History size={20} color="#f9ab00" />
              </div>
              <span style={{ flex: 1, fontSize: '15px', fontWeight: '600' }}>See transaction history</span>
              <ChevronRight size={18} color="#5f6368" />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div
        onClick={() => setScreen('scan')}
        style={{
          position: 'fixed', bottom: '32px', right: '24px',
          padding: '16px 28px', borderRadius: '32px',
          background: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          border: '1px solid #f1f3f4', cursor: 'pointer', zIndex: 100
        }}
      >
        <QrCode size={24} color="#1a73e8" />
        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a73e8' }}>Scan QR</span>
      </div>
    </div>
  );
};

export default App;

