import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, ChevronDown, CheckCircle } from 'lucide-react';
import WalletSelector from './WalletSelector';
import { logBehavioralEvent } from '../utils/logger';

const PayScreen = ({ wallets, onPay, onBack, initialRecipient = '', studyGroup }) => {
  const [recipient, setRecipient] = useState(initialRecipient || 'research.participant@okaxis');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [needType, setNeedType] = useState(null); // 'good', 'bad', or null
  const [activeWallet, setActiveWallet] = useState({
    id: studyGroup === 'control' ? 'savings' : 'leisure',
    name: studyGroup === 'control' ? 'Default' : 'Leisure'
  });
  const [switchCount, setSwitchCount] = useState(0);
  const [startTime] = useState(Date.now());

  const handleWalletSelect = (wallet) => {
    if (studyGroup === 'control') return;
    setActiveWallet(wallet);
    setSwitchCount(prev => prev + 1);
    logBehavioralEvent('wallet_switch', { to: wallet.id });
  };

  const handlePay = () => {
    if (!amount || Number(amount) <= 0) return;

    if (!recipient.includes('@') && !recipient.includes('.com') && recipient.length < 10) {
      alert("Please enter a valid UPI ID, Phone, or Email");
      return;
    }

    const pauseDuration = (Date.now() - startTime) / 1000;
    logBehavioralEvent('payment_initiate', {
      amount: Number(amount),
      walletId: activeWallet.id,
      recipient,
      note,
      pauseDuration,
      switchCount,
      studyGroup,
      needType
    });
    onPay(Number(amount), activeWallet.id, recipient, note, needType);
  };

  const totalBalance = Object.values(wallets).reduce((a, b) => a + b, 0);
  const isValid = amount && Number(amount) > 0 &&
    (studyGroup === 'control' ? Number(amount) <= totalBalance : Number(amount) <= wallets[activeWallet.id]);

  // Determine dynamic background
  const getBackground = () => {
    if (needType === 'good') return '#e6f4ea'; // Soft Green
    if (needType === 'bad') return '#fce8e6';  // Soft Red
    return '#ffffff';
  };

  const getThemeColor = () => {
    if (needType === 'good') return '#1e8e3e';
    if (needType === 'bad') return '#d93025';
    return '#1a73e8';
  };

  return (
    <div className="app-shell animate-fade" style={{ background: getBackground(), transition: 'background 0.5s ease' }}>
      <header className="header" style={{ position: 'relative', background: 'transparent' }}>
        <ArrowLeft onClick={onBack} cursor="pointer" size={24} color="#1f1f1f" />
        <div style={{ flex: 1 }} />
      </header>

      {/* Need Assessment Intervention */}
      {!needType ? (
        <div style={{ padding: '40px 24px', textAlign: 'center' }} className="animate-fade">
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#1f1f1f' }}>Before you pay...</h2>
          <p style={{ color: '#5f6368', fontSize: '15px', marginBottom: '32px' }}>Is this transaction for a <b>good need</b> or a <b>bad need</b>?</p>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div
              onClick={() => setNeedType('good')}
              style={{
                padding: '24px', background: '#ffffff', borderRadius: '20px',
                border: '2px solid #e6f4ea', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <h3 style={{ color: '#1e8e3e', fontSize: '18px', fontWeight: '700' }}>Good Need</h3>
              <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '4px' }}>Essential spending, savings, or investment</p>
            </div>

            <div
              onClick={() => setNeedType('bad')}
              style={{
                padding: '24px', background: '#ffffff', borderRadius: '20px',
                border: '2px solid #fce8e6', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <h3 style={{ color: '#d93025', fontSize: '18px', fontWeight: '700' }}>Bad Need</h3>
              <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '4px' }}>Impulse buy, unnecessary craving, or regretful spend</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade">
          <div style={{ padding: '10px 24px', textAlign: 'center' }}>
            <div className="avatar" style={{
              width: '64px', height: '64px', margin: '0 auto 12px',
              background: '#8ab4f8', color: '#174ea6', fontSize: '24px'
            }}>
              {recipient.charAt(0).toUpperCase()}
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f1f1f' }}>
              Paying {recipient.split('@')[0]}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
              <p style={{ fontSize: '13px', color: '#5f6368' }}>
                Banking Name: <b>{recipient.split('@')[0]}</b>
              </p>
              <CheckCircle size={14} color="#1a73e8" fill="#e8f0fe" />
            </div>
            <p style={{ fontSize: '12px', color: '#5f6368' }}>{recipient}</p>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '32px', fontWeight: '600', marginRight: '4px', color: '#1f1f1f' }}>₹</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  border: 'none', background: 'transparent',
                  fontSize: '56px', fontWeight: '600', width: "200px",
                  textAlign: 'center', outline: 'none', color: '#1f1f1f'
                }}
                autoFocus
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <input
                type="text"
                placeholder="Add a note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  background: '#ffffff',
                  border: `1.5px solid ${getThemeColor()}`,
                  borderRadius: '20px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  width: '240px',
                  textAlign: 'center',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              />
            </div>
          </div>

          <div style={{ padding: '0 16px', marginTop: '24px', marginBottom: '40px' }}>
            {studyGroup === 'test' ? (
              <>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', padding: '0 8px' }}>
                  Select Funding Source
                </p>
                <WalletSelector selectedId={activeWallet.id} onSelect={handleWalletSelect} balances={wallets} />
                <div style={{ marginTop: '24px', padding: '0 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f3f4' }}>
                    <ShieldCheck size={20} color="#1a73e8" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '600' }}>Paying from: {activeWallet.name} Wallet</p>
                      <p style={{ fontSize: '12px', color: '#5f6368' }}>₹{wallets[activeWallet.id].toLocaleString('en-IN')} left today</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '0 8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f3f4' }}>
                  <ShieldCheck size={20} color="#1a73e8" />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>State Bank of India - 4421</p>
                    <p style={{ fontSize: '12px', color: '#5f6368' }}>UPI Verified Account</p>
                  </div>
                </div>
              </div>
            )}

            <button
              className="btn-premium btn-primary"
              style={{
                width: '100%', marginTop: '32px', padding: '16px',
                borderRadius: '16px', fontSize: '16px',
                background: getThemeColor(),
                boxShadow: `0 8px 16px ${getThemeColor()}33`
              }}
              disabled={!isValid}
              onClick={handlePay}
            >
              {isValid ? `Pay ₹${amount}` : `Checking balance...`}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#5f6368', cursor: 'pointer' }} onClick={() => setNeedType(null)}>
              Change need assessment
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayScreen;
