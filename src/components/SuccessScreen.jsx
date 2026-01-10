import React, { useState, useEffect } from 'react';
import { Check, Share2, MoreVertical, ShieldCheck, PieChart, Info } from 'lucide-react';
import { logBehavioralEvent, getBehavioralLogs } from '../utils/logger';

const SuccessScreen = ({ amount, walletName, recipient, isFailure, onDone }) => {
    const [reflection, setReflection] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [stats, setStats] = useState({ leisure: 40, savings: 30, goals: 20, bills: 10 });

    useEffect(() => {
        if (isFailure) return;
        // Calculate real stats from logs if possible, else use dummies for demo
        const logs = getBehavioralLogs();
        const payments = logs.filter(l => l.event === 'payment_initiate' || l.event === 'reflection_submit');
        if (payments.length > 0) {
            const totals = payments.reduce((acc, curr) => {
                const w = (curr.walletId || curr.walletName || '').toLowerCase();
                if (w) acc[w] = (acc[w] || 0) + (curr.amount || 0);
                return acc;
            }, {});
            const total = Object.values(totals).reduce((a, b) => a + b, 0);
            if (total > 0) {
                setStats({
                    leisure: (totals.leisure || 0) / total * 100,
                    savings: (totals.savings || 0) / total * 100,
                    goals: (totals.goals || 0) / total * 100,
                    bills: (totals.bills || totals.bills_and_emi || 0) / total * 100
                });
            }
        }
    }, [isFailure]);

    const handleSubmit = () => {
        if (!reflection.trim() && !isFailure) return;
        logBehavioralEvent(isFailure ? 'failure_dismissed' : 'reflection_submit', { reflection, amount, walletName });
        setIsSubmitted(true);
        setTimeout(onDone, 1500);
    };

    // ... (renderPieChart remains same but we conditionalize it in return)

    return (
        <div className="app-shell animate-fade" style={{ background: 'var(--surface)', height: '100%', overflowY: 'auto', paddingBottom: '40px' }}>
            <header className="header" style={{ background: 'transparent' }}>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Share2 size={24} color="var(--text-main)" />
                    <MoreVertical size={24} color="var(--text-main)" />
                </div>
            </header>

            <div style={{ textAlign: 'center', padding: '0 24px' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: isFailure ? 'var(--error)' : 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    margin: '0 auto 24px',
                    boxShadow: `0 8px 16px ${isFailure ? 'rgba(188, 71, 73, 0.2)' : 'rgba(45, 106, 79, 0.2)'}`
                }} className={isFailure ? 'animate-fade' : 'success-icon'}>
                    {isFailure ? <X size={48} strokeWidth={4} /> : <Check size={48} strokeWidth={4} />}
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>₹{amount.toLocaleString('en-IN')}</h1>
                <p style={{ color: isFailure ? 'var(--error)' : 'var(--success)', fontWeight: '700', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {isFailure ? 'Payment Failed' : 'Payment Successful'}
                    {!isFailure && <ShieldCheck size={20} fill="var(--success)" color="white" />}
                </p>

                {isFailure && (
                    <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(188, 71, 73, 0.05)', borderRadius: '20px', border: '1px solid var(--error)' }}>
                        <p style={{ fontSize: '14px', color: 'var(--error)', fontWeight: '600' }}>
                            Something went wrong. <br /> This might be a sign to rethink this spend.
                        </p>
                        <button
                            className="btn-premium btn-primary"
                            style={{ background: 'var(--error)', width: '100%', marginTop: '20px' }}
                            onClick={() => onDone()}
                        >
                            Back to Home
                        </button>
                    </div>
                )}

                {(!isFailure) && (
                    <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-color)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <PieChart size={18} color="var(--primary)" />
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Monthly Spending Loss</h4>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div>{renderPieChart()}</div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { label: 'Leisure', color: '#2d6a4f' },
                                    { label: 'Savings', color: '#74c69d' },
                                    { label: 'Goals', color: '#f9ab00' },
                                    { label: 'Bills', color: '#bc4749' }
                                ].map(item => (
                                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', background: 'var(--surface)', padding: '12px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid var(--border)' }}>
                            <Info size={16} color="var(--primary)" />
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'left', lineHeight: '1.4' }}>
                                <b>Counterfactual:</b> With this ₹{amount}, you could have saved towards your buffer or a meal.
                            </p>
                        </div>
                    </div>
                )}

                {!isSubmitted ? (
                    <div style={{ marginTop: '24px', textAlign: 'left' }}>
                        <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '16px', border: '1px solid #fde68a' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#92400e' }}>
                                One Final Step
                            </h4>
                            <p style={{ fontSize: '13px', color: '#b45309', marginBottom: '16px' }}>
                                Why did you choose the <b>{walletName}</b> wallet? Was this a "Good Spend" or a "Loss"?
                            </p>
                            <textarea
                                placeholder="Explain your choice to finish..."
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '80px',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    border: '1px solid #fcd34d',
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
                            style={{
                                width: '100%',
                                marginTop: '16px',
                                borderRadius: '12px',
                                opacity: reflection.trim() ? 1 : 0.5,
                                cursor: reflection.trim() ? 'pointer' : 'not-allowed'
                            }}
                            disabled={!reflection.trim()}
                            onClick={handleSubmit}
                        >
                            Complete Payment & Finish
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade" style={{ marginTop: '24px', padding: '20px', background: 'rgba(52, 168, 83, 0.1)', borderRadius: '16px', color: '#2e7d32', fontWeight: '600' }}>
                        Great! Redirecting to home...
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuccessScreen;
