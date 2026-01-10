import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, ChevronDown, CheckCircle } from 'lucide-react';
import WalletSelector from './WalletSelector';
import { logBehavioralEvent } from '../utils/logger';

const PayScreen = ({ wallets, onPay, onBack, initialRecipient = '' }) => {
  const [recipient, setRecipient] = useState(initialRecipient || 'research.participant@okaxis');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState(''); // New Payment Note
  const [activeWallet, setActiveWallet] = useState({ id: 'leisure', name: 'Leisure' });
  const [switchCount, setSwitchCount] = useState(0);
  const [startTime] = useState(Date.now());

  const handleWalletSelect = (wallet) => {
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
      switchCount
    });
    onPay(Number(amount), activeWallet.id, recipient, note);
  };

  const isValid = amount && Number(amount) > 0 && Number(amount) <= wallets[activeWallet.id];

  return (
    <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)' }}>
      <header className="header" style={{ position: 'relative' }}>
        <ArrowLeft onClick={onBack} cursor="pointer" size={24} color="var(--text-main)" />
        <div style={{ flex: 1 }} />
      </header>

      <div style={{ padding: '10px 24px', textAlign: 'center' }}>
        {/* Recipient Input Fields */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'block', marginBottom: '12px' }}>RECIPIENT DETAILS</label>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Name</p>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={recipient.split(' (')[0]}
              onChange={(e) => {
                const upiPart = recipient.includes(' (') ? recipient.split(' (')[1] : '';
                setRecipient(e.target.value + (upiPart ? ' (' + upiPart : ''));
              }}
              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '8px 0', fontSize: '16px', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>

          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>UPI ID</p>
            <input
              type="text"
              placeholder="e.g. john@upi"
              value={recipient.includes(' (') ? recipient.split(' (')[1].replace(')', '') : (recipient.includes('@') ? recipient : '')}
              onChange={(e) => {
                const namePart = recipient.includes(' (') ? recipient.split(' (')[0] : (recipient.includes('@') ? '' : recipient);
                setRecipient(namePart + ' (' + e.target.value + ')');
              }}
              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '8px 0', fontSize: '16px', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
        </div>

        {/* Amount Input */}
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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

        {/* Payment Note Field */}
        <div style={{ marginTop: '16px' }}>
          <input
            type="text"
            placeholder="What's this for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '10px 20px',
              fontSize: '14px',
              width: '180px',
              textAlign: 'center',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: 'auto', marginBottom: '40px' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', padding: '0 8px' }}>
          Choose Payment Wallet
        </p>

        <WalletSelector selectedId={activeWallet.id} onSelect={handleWalletSelect} balances={wallets} />

        <div style={{ marginTop: '24px', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <ShieldCheck size={20} color="#1a73e8" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>Paying from {activeWallet.name} Wallet</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Balance: ?{wallets[activeWallet.id].toLocaleString('en-IN')}</p>
            </div>
            <ChevronDown size={20} color="var(--text-secondary)" />
          </div>
        </div>

        <button
          className="btn-premium btn-primary"
          style={{ width: '100%', marginTop: '24px', padding: '16px', borderRadius: '12px', fontSize: '16px' }}
          disabled={!isValid}
          onClick={handlePay}
        >
          {isValid ? `Pay ?${amount}` : `Checking availability...`}
        </button>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.8 }}>
          Secure payment via UPI
        </p>
      </div>
    </div>
  );
};

export default PayScreen;
