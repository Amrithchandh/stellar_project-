import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, ChevronDown, CheckCircle } from 'lucide-react';
import WalletSelector from './WalletSelector';
import { logBehavioralEvent } from '../utils/logger';

const PayScreen = ({ wallets, onPay, onBack, initialRecipient = '', studyGroup }) => {
  const [recipient, setRecipient] = useState(initialRecipient || 'research.participant@okaxis');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState(''); // New Payment Note
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

    // Basic validation for recipient
    if (!recipient.includes('@') && !recipient.includes('.com') && recipient.length < 10) {
      alert("Please enter a valid UPI ID, Phone, or Email");
      return;
    }

    const pauseDuration = (Date.now() - startTime) / 1000;
    logBehavioralEvent('payment_initiate', {
      amount: Number(amount),
      walletId: activeWallet.id,
      recipient,
      note, // Log the note!
      pauseDuration,
      switchCount,
      studyGroup
    });
    onPay(Number(amount), activeWallet.id, recipient, note);
  };

  const totalBalance = Object.values(wallets).reduce((a, b) => a + b, 0);
  const isValid = amount && Number(amount) > 0 &&
    (studyGroup === 'control' ? Number(amount) <= totalBalance : Number(amount) <= wallets[activeWallet.id]);

  return (
    <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)' }}>
      <header className="header" style={{ position: 'relative' }}>
        <ArrowLeft onClick={onBack} cursor="pointer" size={24} color="var(--text-main)" />
        <div style={{ flex: 1 }} />
      </header>

      <div style={{ padding: '10px 24px', textAlign: 'center' }}>
        {/* Recipient Avatar */}
        <div className="avatar" style={{
          width: '64px', height: '64px', margin: '0 auto 12px',
          background: '#8ab4f8', color: '#174ea6', fontSize: '24px'
        }}>
          {recipient.charAt(0).toUpperCase()}
        </div>

        {/* Verified Details */}
        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
          Paying {recipient.split('@')[0]}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Banking Name: <b>Research Participant</b>
          </p>
          <CheckCircle size={14} color="#1a73e8" fill="#e8f0fe" />
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{recipient}</p>

        {/* Amount Input */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '32px', fontWeight: '600', marginRight: '4px' }}>₹</span>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              border: 'none', background: 'transparent',
              fontSize: '56px', fontWeight: '600', width: "200px",
              textAlign: 'center', outline: 'none', color: 'var(--text-main)'
            }}
            autoFocus
          />
        </div>

        {/* Payment Note Field (New) */}
        <div style={{ marginTop: '16px' }}>
          <input
            type="text"
            placeholder="Add a note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '10px 20px',
              fontSize: '14px',
              width: '240px',
              textAlign: 'center',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: 'auto', marginBottom: '40px' }}>
        {studyGroup === 'test' ? (
          <>
            <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', padding: '0 8px' }}>
              Select Funding Source
            </p>
            <WalletSelector selectedId={activeWallet.id} onSelect={handleWalletSelect} balances={wallets} />
            <div style={{ marginTop: '24px', padding: '0 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <ShieldCheck size={20} color="#1a73e8" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>Paying from: {activeWallet.name} Wallet</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>₹{wallets[activeWallet.id].toLocaleString('en-IN')} left today</p>
                </div>
                <ChevronDown size={20} color="var(--text-secondary)" />
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '0 8px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <ShieldCheck size={20} color="#1a73e8" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>State Bank of India - 4421</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>UPI Verified Account</p>
              </div>
            </div>
          </div>
        )}

        <button
          className="btn-premium btn-primary"
          style={{ width: '100%', marginTop: '24px', padding: '16px', borderRadius: '12px', fontSize: '16px' }}
          disabled={!isValid}
          onClick={handlePay}
        >
          {isValid ? `Pay ₹${amount}` : `Checking balance...`}
        </button>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.8 }}>
          Secure payment via UPI
        </p>
      </div>
    </div>
  );
};

export default PayScreen;
