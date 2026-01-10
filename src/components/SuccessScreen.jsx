import React, { useState } from 'react';
import { Check, Share2, MoreVertical, ShieldCheck } from 'lucide-react';
import { logBehavioralEvent } from '../utils/logger';

const SuccessScreen = ({ amount, walletName, recipient, onDone, studyGroup }) => {
    const [reflection, setReflection] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        logBehavioralEvent('reflection_submit', { reflection, amount, walletName, studyGroup });
        setIsSubmitted(true);
        setTimeout(onDone, 1500);
    };

    const isTest = studyGroup === 'test';

    // Counterfactual logic
    const meals = Math.floor(amount / 100);
    const coffee = Math.floor(amount / 50);

    return (
        <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)', height: '100%', overflowY: 'auto' }}>
            <header className="header" style={{ background: 'transparent' }}>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Share2 size={24} color="var(--text-main)" />
                    <MoreVertical size={24} color="var(--text-main)" />
                </div>
            </header>

            <div style={{ textAlign: 'center', padding: '20px 24px 100px' }}>
                <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: '#34a853',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    margin: '0 auto 20px',
                    boxShadow: '0 8px 24px rgba(52, 168, 83, 0.3)'
                }} className="success-icon">
                    <Check size={40} strokeWidth={4} />
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>₹{amount.toLocaleString('en-IN')}</h1>
                <p style={{ color: '#2e7d32', fontWeight: '600', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    Payment Successful
                    <ShieldCheck size={16} fill="#2e7d32" color="white" />
                </p>

                <div style={{ marginTop: '24px', padding: '16px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>
                        To {recipient}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                </div>

                {isTest && !isSubmitted && (
                    <div className="animate-fade" style={{ marginTop: '24px', textAlign: 'left' }}>
                        {/* Micro-spending Snapshot */}
                        <div style={{ background: 'rgba(26, 115, 232, 0.05)', padding: '16px', borderRadius: '16px', border: '1.5px solid var(--primary)', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--primary)' }}>
                                RESOURCES REMOVED
                            </h4>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {Array.from({ length: Math.ceil(amount / 300) }).map((_, i) => (
                                    <div key={i} style={{ width: '20px', height: '20px', background: 'var(--primary)', borderRadius: '4px', opacity: 0.6 }} />
                                ))}
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                You just depleted {Math.ceil(amount / 300)} energy bundles from your <b>{walletName}</b> wallet.
                            </p>
                        </div>

                        {/* Counterfactual Comparison */}
                        <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                                SACRIFICE SCALE
                            </h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                This ₹{amount} could have been roughly:
                                <ul style={{ marginTop: '6px', marginLeft: '20px', listStyleType: 'disc' }}>
                                    {meals > 0 && <li><b>{meals}</b> regular meal{meals > 1 ? 's' : ''}</li>}
                                    {coffee > 0 && <li><b>{coffee}</b> cup{coffee > 1 ? 's' : ''} of coffee</li>}
                                    {amount < 50 && <li>Small daily essentials</li>}
                                </ul>
                            </p>
                        </div>

                        {/* Verbal Realization */}
                        <div style={{ background: '#fefce8', padding: '16px', borderRadius: '16px', border: '1px solid #fde047' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#854d0e' }}>
                                REFLECTION
                            </h4>
                            <p style={{ fontSize: '12px', color: '#854d0e', marginBottom: '12px', opacity: 0.8 }}>
                                How does seeing this depletion change your perception of this payment?
                            </p>
                            <textarea
                                placeholder="Type your realization here..."
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '80px',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    border: '1px solid #fef08a',
                                    background: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'none'
                                }}
                            />
                        </div>
                    </div>
                )}

                <button
                    className="btn-premium btn-primary"
                    style={{ width: '100%', marginTop: '32px', borderRadius: '12px', padding: '16px' }}
                    onClick={handleSubmit}
                >
                    {isSubmitted ? "Recorded" : "Finish"}
                </button>
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
