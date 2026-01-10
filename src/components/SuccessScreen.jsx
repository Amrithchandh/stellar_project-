import React, { useState } from 'react';
import { Check, Share2, MoreVertical, ShieldCheck } from 'lucide-react';
import { logBehavioralEvent } from '../utils/logger';

const SuccessScreen = ({ amount, walletName, recipient, onDone }) => {
    const [reflection, setReflection] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        logBehavioralEvent('reflection_submit', { reflection, amount, walletName });
        setIsSubmitted(true);
        setTimeout(onDone, 1500);
    };

    return (
        <div className="app-shell animate-fade" style={{ background: 'var(--surface)', height: '100vh', overflow: 'auto' }}>
            <header className="header" style={{ background: 'transparent' }}>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Share2 size={24} color="var(--text-main)" />
                    <MoreVertical size={24} color="var(--text-main)" />
                </div>
            </header>

            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#34a853',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 24px rgba(52, 168, 83, 0.3)'
                }} className="success-icon">
                    <Check size={48} strokeWidth={4} />
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>₹{amount.toLocaleString('en-IN')}</h1>
                <p style={{ color: '#2e7d32', fontWeight: '600', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    Payment successful
                    <ShieldCheck size={18} fill="#2e7d32" color="white" />
                </p>

                <div style={{ marginTop: '32px', padding: '16px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        <p style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: '500' }}>
                            Paid to <b>{recipient}</b>
                        </p>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        UPI Transaction ID: {Math.random().toString().slice(2, 14)}
                    </p>
                </div>

                {!isSubmitted ? (
                    <div style={{ marginTop: '40px', textAlign: 'left' }}>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                                Quick Reflection
                            </h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                Why did you choose the <b>{walletName}</b> wallet for this specific transaction?
                            </p>
                            <textarea
                                placeholder="Briefly explain your choice..."
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '80px',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    border: '1px solid var(--border)',
                                    background: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <button
                            className="btn-premium btn-primary"
                            style={{ width: '100%', marginTop: '24px', borderRadius: '12px' }}
                            onClick={handleSubmit}
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade" style={{ marginTop: '40px', padding: '24px', background: 'rgba(52, 168, 83, 0.1)', borderRadius: '16px', color: '#2e7d32', fontWeight: '600' }}>
                        Great! Redirecting to home...
                    </div>
                )}
            </div>

            <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    POWERED BY UPI
                </p>
            </div>
        </div>
    );
};

export default SuccessScreen;
