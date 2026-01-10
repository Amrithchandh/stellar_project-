import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Lock, Smartphone, MessageSquare } from 'lucide-react';
import { logBehavioralEvent } from '../utils/logger';

const Auth = ({ onLogin }) => {
    const [step, setStep] = useState(1); // 1: Mobile, 2: Sim Verify, 3: OTP, 4: App PIN
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    // Step 1: Mobile Number
    const handleMobileSubmit = () => {
        if (mobile.length !== 10) {
            setError('Please enter a valid 10-digit number');
            return;
        }
        setError('');
        setStep(2);
        logBehavioralEvent('auth_mobile_entered', { mobile });
    };

    // Step 2: Simulate SIM Verification
    useEffect(() => {
        if (step === 2) {
            const timer = setTimeout(() => {
                setStep(3);
            }, 2500); // 2.5s simulated delay
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Step 3: OTP
    const handleOtpSubmit = () => {
        if (otp !== '1234') {
            setError('Incorrect OTP. Try 1234.');
            return;
        }
        setError('');
        setStep(4);
        logBehavioralEvent('auth_otp_verified');
    };

    // Step 4: App PIN
    const handlePinSubmit = (val) => {
        const newPin = pin + val;
        if (newPin.length <= 4) {
            setPin(newPin);
            if (newPin.length === 4) {
                // Auto-submit on 4th digit
                setTimeout(() => {
                    logBehavioralEvent('auth_complete');
                    onLogin({ name: 'Study Participant', email: mobile + '@upi', photo: null });
                }, 300);
            }
        }
    };

    return (
        <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)', padding: '24px' }}>

            {/* Header / Logo Area */}
            <div style={{ marginTop: '40px', marginBottom: '40px', textAlign: 'center' }}>
                <div style={{
                    width: '64px', height: '64px', margin: '0 auto 16px',
                    background: 'white', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <img src="/nudge-/logo.svg" alt="Logo" style={{ width: '40px' }} onError={(e) => e.target.style.display = 'none'} />
                    {!error && <ShieldCheck size={32} color="var(--primary)" />}
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' }}>
                    Welcome to UPI
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    India's Payment Super App
                </p>
            </div>

            {/* Step 1: Mobile Number */}
            {step === 1 && (
                <div className="glass-card animate-fade">
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>
                        ENTER MOBILE NUMBER
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '600' }}>+91</span>
                        <input
                            type="tel"
                            placeholder="00000 00000"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            style={{
                                border: 'none', background: 'transparent',
                                fontSize: '18px', fontWeight: '600', flex: 1, outline: 'none'
                            }}
                            autoFocus
                        />
                    </div>
                    {error && <p style={{ color: 'var(--error)', fontSize: '12px', marginTop: '8px' }}>{error}</p>}

                    <button className="btn-premium btn-primary" style={{ marginTop: '24px', width: '100%' }} onClick={handleMobileSubmit}>
                        Continue <ArrowRight size={18} />
                    </button>
                </div>
            )}

            {/* Step 2: SIM Verification Animation */}
            {step === 2 && (
                <div style={{ textAlign: 'center', marginTop: '40px' }} className="animate-fade">
                    <div className="shimmer" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 24px' }}></div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Verifying Mobile Number...</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Sending secure SMS to verify +91 {mobile}
                    </p>
                </div>
            )}

            {/* Step 3: Enter OTP */}
            {step === 3 && (
                <div className="glass-card animate-fade">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <MessageSquare size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Enter OTP</h3>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Passcode sent to +91 {mobile} <br /> (Use 1234)
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{
                                width: '45px', height: '50px', border: '1px solid #ccc', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '20px', fontWeight: '700'
                            }}>
                                {otp[i] || ''}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '32px' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                            <div key={n} onClick={() => setOtp(prev => (prev + n).slice(0, 4))} style={{ padding: '16px', background: '#f0f2f5', borderRadius: '8px', textAlign: 'center', fontWeight: '600', cursor: 'pointer' }}>{n}</div>
                        ))}
                        <div style={{ gridColumn: '2', padding: '16px', background: '#f0f2f5', borderRadius: '8px', textAlign: 'center', fontWeight: '600', cursor: 'pointer' }} onClick={() => setOtp(prev => (prev + 0).slice(0, 4))}>0</div>
                        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setOtp(prev => prev.slice(0, -1))}>⌫</div>
                    </div>

                    <button className="btn-premium btn-primary" style={{ marginTop: '24px', width: '100%' }} onClick={handleOtpSubmit}>
                        Verify OTP
                    </button>
                </div>
            )}

            {/* Step 4: Set App PIN */}
            {step === 4 && (
                <div style={{ textAlign: 'center', marginTop: '20px' }} className="animate-fade">
                    <Lock size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Unlock Google Pay</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        Enter Google PIN
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{
                                width: '16px', height: '16px', borderRadius: '50%',
                                border: '1px solid var(--text-secondary)',
                                background: pin.length > i ? 'var(--text-main)' : 'transparent'
                            }} />
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '300px', margin: '0 auto' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                            <div key={n} onClick={() => handlePinSubmit(n)} className="pin-key">{n}</div>
                        ))}
                        <div style={{ gridColumn: '2' }} className="pin-key" onClick={() => handlePinSubmit(0)}>0</div>
                        <div className="pin-key" onClick={() => setPin(prev => prev.slice(0, -1))}>⌫</div>
                    </div>
                </div>
            )}

            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginTop: 'auto', paddingBottom: '20px' }}>
                Your payments are 100% secure with UPI
            </p>

        </div>
    );
};

export default Auth;
