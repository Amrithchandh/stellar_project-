import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, ChevronDown, CheckCircle, AtSign, Leaf } from 'lucide-react';
import WalletSelector from './WalletSelector';
import { logBehavioralEvent } from '../utils/logger';

const PayScreen = ({ wallets, onPay, onBack, initialRecipient = '', studyGroup, onFail }) => {
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
  const [isProcessing, setIsProcessing] = useState(false);

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

    // simulated failure
    if (amount === '1234' || Math.random() < 0.05) {
      onFail();
      return;
    }

    setIsProcessing(true);

    // FRICTION: Savings spending is slow
    const delay = activeWallet.id === 'savings' ? 3500 : 1200;

    setTimeout(() => {
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
      setIsProcessing(false);
    }, delay);
  };

  const totalBalance = Object.values(wallets).reduce((a, b) => a + b, 0);
  const isValid = amount && Number(amount) > 0 &&
    (studyGroup === 'control' ? Number(amount) <= totalBalance : Number(amount) <= wallets[activeWallet.id]);

  const getBackground = () => {
    if (needType === 'good') return '#f0fff4'; // Soft Green Relief
    if (needType === 'bad') return '#fff5f5';  // Soft Red Caution
    return 'var(--bg-color)';
  };

  const getThemeColor = () => {
    if (needType === 'good') return 'var(--primary)';
    if (needType === 'bad') return '#d93025';
    return 'var(--primary)';
  };

  if (isProcessing) {
    return (
      <div className="app-shell animate-fade" style={{ background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div className="spinner" style={{ borderTopColor: getThemeColor() }} />
        <h3 style={{ marginTop: '24px', fontWeight: '800', color: getThemeColor() }}>
          {activeWallet.id === 'savings' ? 'Validating Savings Protection...' : 'Processing...'}
        </h3>
        {activeWallet.id === 'savings' && (
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#5f6368', textAlign: 'center' }}>
            Creating friction to ensure this emergency buffer spend is intentional.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="app-shell animate-fade" style={{ background: getBackground(), transition: 'background 0.5s ease' }}>
      <header className="header" style={{ position: 'relative', background: 'transparent' }}>
        <ArrowLeft onClick={onBack} cursor="pointer" size={24} color="#1f1f1f" />
        <div style={{ flex: 1 }} />
      </header>

      {!needType ? (
        <div style={{ padding: '40px 24px', textAlign: 'center' }} className="animate-fade">
          <Leaf size={48} color="var(--primary)" opacity={0.2} style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Pause & Reflect</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px' }}>Is this payment essential?</p>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div onClick={() => setNeedType('good')} style={{ padding: '24px', background: 'white', borderRadius: '24px', border: '1.5px solid var(--good-need)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ color: 'var(--good-text)', fontSize: '18px', fontWeight: '800' }}>Good / Necessary</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Essential for growth or living</p>
            </div>

            <div onClick={() => setNeedType('bad')} style={{ padding: '24px', background: 'white', borderRadius: '24px', border: '1.5px solid var(--bad-need)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ color: 'var(--bad-text)', fontSize: '18px', fontWeight: '800' }}>Do I really need to buy?</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Unplanned or discretionary spend</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade">
          <div style={{ padding: '10px 24px', textAlign: 'center' }}>
            <div className="avatar" style={{ width: '64px', height: '64px', margin: '0 auto 12px', background: 'white', color: 'var(--primary)', fontSize: '24px', border: '2px solid var(--border)' }}>
              {recipient.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Paying {recipient.split('@')[0]}</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>UPI: <b>{recipient}</b></p>
              <CheckCircle size={14} color="var(--primary)" fill="white" />
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '32px', fontWeight: '600', marginRight: '4px' }}>₹</span>
              <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '56px', fontWeight: '800', width: "220px", textAlign: 'center', outline: 'none' }} autoFocus />
            </div>

            <div style={{ marginTop: '16px' }}>
              <input type="text" placeholder="Add a note" value={note} onChange={(e) => setNote(e.target.value)} style={{ background: 'white', border: `1px solid var(--border)`, borderRadius: '20px', padding: '12px 24px', fontSize: '14px', width: '260px', textAlign: 'center', outline: 'none' }} />
            </div>
          </div>

          <div style={{ padding: '0 16px', marginTop: '32px', marginBottom: '40px' }}>
            {studyGroup === 'test' ? (
              <>
                <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', padding: '0 8px' }}>Funding Source</p>
                <WalletSelector selectedId={activeWallet.id} onSelect={handleWalletSelect} balances={wallets} />
                <div style={{ marginTop: '24px', padding: '0 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'white', borderRadius: '24px', border: activeWallet.id === 'savings' ? '2px solid #d93025' : '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    {activeWallet.id === 'savings' ? <AtSign size={24} color="#d93025" /> : <ShieldCheck size={24} color="var(--primary)" />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: '800', color: activeWallet.id === 'savings' ? '#d93025' : 'var(--text-main)' }}>
                        {activeWallet.id === 'savings' ? '⚠️ Using Emergency Buffer' : `From ${activeWallet.name} Wallet`}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>₹{wallets[activeWallet.id].toLocaleString('en-IN')} available</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '0 8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <ShieldCheck size={20} color="var(--primary)" />
                  <div style={{ flex: 1 }}><p style={{ fontSize: '14px', fontWeight: '600' }}>State Bank of India - 4421</p></div>
                </div>
              </div>
            )}

            <button
              className="btn-premium btn-primary"
              style={{ width: '100%', marginTop: '36px', padding: '18px', borderRadius: '24px', fontSize: '16px', fontWeight: '800', background: getThemeColor() }}
              disabled={!isValid || isProcessing}
              onClick={handlePay}
            >
              {isValid ? (isProcessing ? 'Wait...' : `Pay ₹${amount}`) : `Low Balance`}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }} onClick={() => setNeedType(null)}>Change Choice</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayScreen;
