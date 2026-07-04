import React, { useState } from 'react';
import { ShieldCheck, Cpu, Landmark, User, Briefcase, Key, CheckCircle, ShieldAlert } from 'lucide-react';
import logo from '../logo.svg';

const Auth = ({ onLogin }) => {
  // Onboarding steps:
  // 1: Role Selection (Employer vs Worker)
  // 2: Connect Wallet (Freighter/xBull Mock)
  // 3: KYC Verification (Worker only)
  // 4: Onboarding Complete
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [kycData, setKycData] = useState({ name: '', idNumber: '', agreeToTax: true });
  const [walletConnected, setWalletConnected] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleConnectWallet = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setWalletConnected(true);
      setIsConnecting(false);
      if (role === 'employer') {
        // Employers don't need KYC for the hackathon demo, they are funding
        onLogin({
          role: 'employer',
          name: 'Global Gig Corp',
          address: 'G-Employer-Stellar-8892',
          kycVerified: true
        });
      } else {
        setStep(3); // Worker proceeds to KYC
      }
    }, 1800);
  };

  const handleKycSubmit = (e) => {
    e.preventDefault();
    if (!kycData.name || !kycData.idNumber) {
      alert("Please fill in all KYC details");
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(4);
    }, 2500);
  };

  const handleFinishWorker = () => {
    onLogin({
      role: 'worker',
      name: kycData.name || 'StreamSave Worker',
      address: 'G-Worker-Stellar-3129',
      kycVerified: true
    });
  };

  return (
    <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)', padding: '24px', justifyContent: 'center' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '64px', height: '64px', margin: '0 auto 16px',
          background: 'white', borderRadius: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(45,106,79,0.15)',
          border: '1.5px solid var(--border)'
        }}>
          <ShieldCheck size={36} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          StreamSave
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', marginTop: '4px' }}>
          Earn. Stream. Save. Own.
        </p>
      </div>

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className="glass-card animate-fade" style={{ margin: 0 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', textAlign: 'center' }}>
            Select your role to onboard
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div 
              onClick={() => handleRoleSelect('worker')}
              style={{
                padding: '20px',
                border: '2px solid var(--border)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#d8f3dc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <User size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '800', fontSize: '15px' }}>I am a Worker</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Receive real-time streamed wages and auto-save</p>
              </div>
            </div>

            <div 
              onClick={() => handleRoleSelect('employer')}
              style={{
                padding: '20px',
                border: '2px solid var(--border)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcf2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a73e8' }}>
                <Briefcase size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '800', fontSize: '15px' }}>I am an Employer</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Setup wage streams and fund workforce payroll</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Connect Stellar Wallet */}
      {step === 2 && (
        <div className="glass-card animate-fade" style={{ margin: 0, textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#1a73e8' }}>
            <Key size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Connect Stellar Wallet</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            StreamSave runs on-chain. Connect Freighter or xBull wallet browser extension to sign transactions.
          </p>

          {isConnecting ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px' }}>
              <div className="spinner" style={{ borderTopColor: '#1a73e8' }} />
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a73e8' }}>Connecting wallet signature client...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={handleConnectWallet}
                className="btn-premium btn-primary"
                style={{ width: '100%', background: '#1a73e8' }}
              >
                Connect Freighter Wallet
              </button>
              <button 
                onClick={handleConnectWallet}
                className="btn-premium"
                style={{ width: '100%', border: '1.5px solid var(--border)', background: 'white' }}
              >
                Connect xBull Wallet
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: KYC Verification (Regulatory Hook) */}
      {step === 3 && (
        <div className="glass-card animate-fade" style={{ margin: 0 }}>
          {isVerifying ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Verifying Identity</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Cross-checking credentials with FIU-IND and tax registries. Please wait...
              </p>
            </div>
          ) : (
            <form onSubmit={handleKycSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Landmark size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Compliance KYC Hook</h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                To comply with India regulatory standards (30% crypto tax & 1% TDS), please link your identity document.
              </p>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>FULL LEGAL NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. Amrit Raj"
                  value={kycData.name}
                  onChange={(e) => setKycData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border)', outline: 'none', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>AADHAAR / PAN CARD NUMBER</label>
                <input 
                  type="text" 
                  placeholder="e.g. 5567 XXXX XXXX"
                  value={kycData.idNumber}
                  onChange={(e) => setKycData(prev => ({ ...prev, idNumber: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border)', outline: 'none', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={kycData.agreeToTax}
                  onChange={(e) => setKycData(prev => ({ ...prev, agreeToTax: e.target.checked }))}
                  id="taxAgreement"
                  style={{ marginTop: '2px' }}
                />
                <label htmlFor="taxAgreement" style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  I acknowledge the 30% flat tax on gains and 1% TDS applies to on-chain digital asset conversions under RBI/FIU-IND guidelines.
                </label>
              </div>

              <button 
                type="submit"
                className="btn-premium btn-primary"
                style={{ width: '100%', marginTop: '12px' }}
              >
                Submit Verification
              </button>
            </form>
          )}
        </div>
      )}

      {/* Step 4: Verification Complete */}
      {step === 4 && (
        <div className="glass-card animate-fade" style={{ margin: 0, textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e8f5e9', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={36} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#2e7d32', marginBottom: '8px' }}>Identity Verified</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Your on-chain profile has been successfully generated. StreamSave protocol compliance is active.
          </p>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', textAlign: 'left' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>VERIFICATION SPEC DETAILS</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}><b>Stellar Address:</b> <code style={{ fontSize: '10px' }}>G-Worker-Stellar-3129</code></p>
            <p style={{ fontSize: '12px', marginTop: '2px' }}><b>Status:</b> SECURE / COMPLIANT</p>
          </div>

          <button 
            onClick={handleFinishWorker}
            className="btn-premium btn-primary"
            style={{ width: '100%' }}
          >
            Enter Worker Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth;
