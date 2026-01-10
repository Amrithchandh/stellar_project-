import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, ChevronDown, CheckCircle } from 'lucide-react';
import WalletSelector from './WalletSelector';
import { logBehavioralEvent } from '../utils/logger';

const PayScreen = ({ wallets, onPay, onBack }) => {
  const [recipient, setRecipient] = useState('research.participant@okstudy');
  const [amount, setAmount] = useState('');
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
    if (!recipient.includes('@') && !recipient.includes('.com')) {
      alert("Please enter a valid UPI ID or Email");
      return;
    }

    const pauseDuration = (Date.now() - startTime) / 1000;
    logBehavioralEvent('payment_initiate', {
      amount: Number(amount),
      walletId: activeWallet.id,
      recipient,
      pauseDuration,
      switchCount
    });
    onPay(Number(amount), activeWallet.id, recipient);
  };

  const isValid = amount && Number(amount) > 0 && Number(amount) <= wallets[activeWallet.id];

  return (
    <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)' }}>
      <header className="header" style={{ position: 'relative' }}>
        <ArrowLeft onClick={onBack} cursor="pointer" size={24} color="var(--text-main)" />
        <div style={{ flex: 1 }} />
      </header>

      <div style={{ padding: '20px 24px', textAlign: 'center' }}>
        <div className="avatar" style={{ 
          width: '64px', 
          height: '64px', 
          margin: '0 auto 16px', 
          background: '#e8f0fe', 
          color: '#1a73e8',
          fontSize: '24px'
        }}>
          {recipient.charAt(0).toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{recipient}</h2>
          <CheckCircle size={16} color="#1a73e8" fill="#1a73e8" />
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Banking Name: Research Recipient</p>
        
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '32px', fontWeight: '600', marginRight: '4px' }}>?</span>
          <input 
            type="number" 
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              fontSize: '56px', 
              fontWeight: '600', 
              width: "200px", 
              textAlign: 'center', 
              outline: 'none',
              color: 'var(--text-main)'
            }}
            autoFocus
          />
        </div>
        
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px', fontWeight: '500' }}>
            Add a note
          </div>
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
