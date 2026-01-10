import React, { useState, useEffect } from 'react';
import { Check, Share2, MoreVertical, ShieldCheck, PieChart, Info } from 'lucide-react';
import { logBehavioralEvent, getBehavioralLogs } from '../utils/logger';

const SuccessScreen = ({ amount, walletName, recipient, onDone }) => {
    const [reflection, setReflection] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [stats, setStats] = useState({ leisure: 40, savings: 30, goals: 20, bills: 10 });

    useEffect(() => {
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
    }, []);

    const handleSubmit = () => {
        if (!reflection.trim()) return;
        logBehavioralEvent('reflection_submit', { reflection, amount, walletName });
        setIsSubmitted(true);
        setTimeout(onDone, 1500);
    };

    // Simple SVG Pie Chart helper
    const renderPieChart = () => {
        const size = 120;
        const radius = 50;
        const center = size / 2;
        let currentAngle = 0;

        const data = [
            { label: 'Leisure', val: stats.leisure, color: '#1a73e8' },
            { label: 'Savings', val: stats.savings, color: '#34a853' },
            { label: 'Goals', val: stats.goals, color: '#f9ab00' },
            { label: 'Bills', val: stats.bills, color: '#d93025' }
        ].filter(d => d.val > 0);

        return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {data.map((slice, i) => {
                    const angle = (slice.val / 100) * 360;
                    const x1 = center + radius * Math.cos((currentAngle * Math.PI) / 180);
                    const y1 = center + radius * Math.sin((currentAngle * Math.PI) / 180);
                    currentAngle += angle;
                    const x2 = center + radius * Math.cos((currentAngle * Math.PI) / 180);
                    const y2 = center + radius * Math.sin((currentAngle * Math.PI) / 180);
                    const largeArc = angle > 180 ? 1 : 0;

                    return (
                        <path
                            key={i}
                            d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={slice.color}
                        />
                    );
                })}
                <circle cx={center} cy={center} r={radius * 0.6} fill="white" />
            </svg>
        );
    };

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
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#34a853',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 12px rgba(52, 168, 83, 0.2)'
                }} className="success-icon">
                    <Check size={36} strokeWidth={4} />
                </div>

                <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>₹{amount.toLocaleString('en-IN')}</h1>
                <p style={{ color: '#2e7d32', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    Payment successful
                    <ShieldCheck size={16} fill="#2e7d32" color="white" />
                </p>

                {/* Analytics Section */}
                <div style={{ marginTop: '24px', padding: '20px', background: '#f8faff', borderRadius: '20px', border: '1px solid #eef2ff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <PieChart size={18} color="var(--primary)" />
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Monthly Spending Loss</h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div>{renderPieChart()}</div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { label: 'Leisure', color: '#1a73e8' },
                                { label: 'Savings', color: '#34a853' },
                                { label: 'Goals', color: '#f9ab00' },
                                { label: 'Bills', color: '#d93025' }
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '16px', background: 'white', padding: '12px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                        <Info size={16} color="var(--primary)" />
                        <p style={{ fontSize: '12px', color: '#475569', textAlign: 'left', lineHeight: '1.4' }}>
                            <b>Counterfactual:</b> With this ₹{amount}, you could have saved towards a meal or travel.
                        </p>
                    </div>
                </div>

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
