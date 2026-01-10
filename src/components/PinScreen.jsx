import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Delete, X, AlertCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { logBehavioralEvent } from '../utils/logger';

const PinScreen = ({ amount, recipient, onComplete, onBack }) => {
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);
  const [showIntentCheck, setShowIntentCheck] = useState(true);
  const ORIGINAL_PIN = '123456';

  const handleKeyPress = (num) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = () => {
    if (pin.length < 6) return;

    if (pin === ORIGINAL_PIN) {
      setIsProcessing(true);
      setTimeout(() => {
        onComplete();
      }, 2500);
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleIntentSelection = (type) => {
    logBehavioralEvent('payment_intent_selected', { type, amount, recipient });
    setShowIntentCheck(false);
  };

  if (showIntentCheck) {
    return (
      <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)', display: 'flex', flexDirection: 'column', padding: '24px' }}>
        <header className="header" style={{ padding: '0', marginBottom: '40px' }}>
          <ArrowLeft onClick={onBack} cursor="pointer" size={24} color="var(--text-main)" />
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ background: 'rgba(26, 115, 232, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '24px' }}>
            <AlertCircle size={48} color="var(--primary)" />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>
            Do you really want to pay?
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.5', marginBottom: '40px' }}>
            Take a moment to think. Is this payment for something <b>good</b> and necessary, or is it a <b>wasteful</b> impulsive spend?
          </p>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              className="glass-card"
              style={{ margin: 0, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '2px solid #34a853', background: 'rgba(52, 168, 83, 0.05)', cursor: 'pointer' }}
              onClick={() => handleIntentSelection('good')}
            >
              <div style={{ background: '#34a853', padding: '10px', borderRadius: '12px', color: 'white' }}>
                <ShoppingBag size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', fontSize: '16px', color: '#2e7d32' }}>Good / Necessary</div>
                <div style={{ fontSize: '13px', color: '#548b56' }}>Utility, savings, or needs</div>
              </div>
            </button>

            <button
              className="glass-card"
              style={{ margin: 0, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '2px solid #d93025', background: 'rgba(217, 48, 37, 0.05)', cursor: 'pointer' }}
              onClick={() => handleIntentSelection('waste')}
            >
              <div style={{ background: '#d93025', padding: '10px', borderRadius: '12px', color: 'white' }}>
                <Trash2 size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', fontSize: '16px', color: '#b21f16' }}>Wasteful / Impulsive</div>
                <div style={{ fontSize: '13px', color: '#c5392f' }}>Unplanned or unnecessary spend</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="app-shell animate-fade" style={{ background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <div className="shimmer" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #e8f0fe', borderTopColor: '#1a73e8', animation: 'spin 1.5s linear infinite' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a73e8', marginTop: '32px' }}>Processing payment...</h2>
        <p style={{ color: '#5f6368', marginTop: '12px', textAlign: 'center' }}>Do not press back or close the app</p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-shell animate-fade" style={{ background: '#1c1c1c', color: '#fff' }}>
      <header className="header" style={{ background: 'transparent' }}>
        <ArrowLeft onClick={() => setShowIntentCheck(true)} cursor="pointer" color="#fff" />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '500', letterSpacing: '1px' }}>ENTER 6-DIGIT UPI PIN</h3>
        </div>
        <div style={{ width: '24px' }} />
      </header>

      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2d2d2d', padding: '16px', borderRadius: '12px', marginBottom: '40px' }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase' }}>Sending to</p>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>{recipient}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase' }}>Amount</p>
            <p style={{ fontSize: '18px', fontWeight: '700' }}>₹{amount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {error && <p style={{ color: '#ff5252', fontSize: '14px', marginBottom: '16px' }}>Incorrect UPI PIN. Please try again.</p>}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '20px 0' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: i < pin.length ? '#fff' : 'transparent',
                border: '1.5px solid #fff',
                transition: 'all 0.1s ease'
              }}
            />
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 'auto',
        background: '#282828',
        padding: '20px 10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        borderTop: '1px solid #333'
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <div
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="pin-key"
          >
            {num}
          </div>
        ))}
        <div className="pin-key" onClick={() => setPin('')}>
          <X size={24} />
        </div>
        <div
          onClick={() => handleKeyPress('0')}
          className="pin-key"
        >
          0
        </div>
        <div
          onClick={handleDelete}
          className="pin-key"
        >
          <Delete size={24} />
        </div>
      </div>
      <div style={{ background: '#282828', padding: '0 24px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <p style={{ marginRight: 'auto', color: '#aaa', fontSize: '12px' }}>Original PIN: 123456 (for study)</p>
        <div
          onClick={handleSubmit}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: pin.length === 6 ? '#1a73e8' : '#444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <Check color="#fff" size={32} />
        </div>
      </div>
    </div>
  );
};

export default PinScreen;
