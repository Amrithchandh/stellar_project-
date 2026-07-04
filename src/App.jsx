import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import EmployerDashboard from './components/EmployerDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import { useBalance } from './hooks/useBalance';
import { ShieldCheck, Moon, Sun, Info } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);
  const balanceState = useBalance();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [showComplianceModal, setShowComplianceModal] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleSwitchRole = () => {
    if (!user) return;
    const nextRole = user.role === 'worker' ? 'employer' : 'worker';
    setUser(prev => ({
      ...prev,
      role: nextRole,
      name: nextRole === 'worker' ? 'StreamSave Worker' : 'Global Gig Corp',
      address: nextRole === 'worker' ? 'G-Worker-Stellar-3129' : 'G-Employer-Stellar-8892'
    }));
  };

  const handleLogout = () => {
    setUser(null);
    balanceState.resetStream();
  };

  return (
    <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Floating Control Bar */}
      <div style={{
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>StreamSave Demo</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Info Modal Button */}
          <button 
            onClick={() => setShowComplianceModal(true)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
            title="Regulatory / Tech Info"
          >
            <Info size={18} />
          </button>
          
          {/* Dark Mode toggle */}
          <button 
            onClick={toggleTheme} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user && (
            <button 
              onClick={handleLogout}
              style={{ fontSize: '11px', fontWeight: '700', color: '#d93025', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Core Views Router */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!user ? (
          <Auth onLogin={handleLogin} />
        ) : user.role === 'employer' ? (
          <EmployerDashboard 
            balanceState={balanceState.state}
            fundStream={balanceState.fundStream}
            resetStream={balanceState.resetStream}
            getLiveBalances={balanceState.getLiveBalances}
            onSwitchRole={handleSwitchRole}
          />
        ) : (
          <WorkerDashboard 
            balanceState={balanceState.state}
            getLiveBalances={balanceState.getLiveBalances}
            withdraw={balanceState.withdraw}
            triggerDca={balanceState.triggerDca}
            updateAllocations={balanceState.updateAllocations}
            onSwitchRole={handleSwitchRole}
          />
        )}
      </div>

      {/* Compliance / Tech Specification Modal */}
      {showComplianceModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 2000, padding: '20px'
        }}>
          <div className="glass-card animate-fade" style={{ background: 'white', width: '100%', maxWidth: '400px', margin: 0, maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck color="var(--primary)" /> Protocol Specifications
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              <div>
                <b style={{ color: 'var(--text-main)' }}>1. Tech Stack Integration:</b>
                <p>Built with Stellar SDK, Soroban smart contracts simulation, Reflector Price oracle integration, and Horizon API client polls.</p>
              </div>

              <div>
                <b style={{ color: 'var(--text-main)' }}>2. Regulatory Compliance Statement:</b>
                <p>This is a protocol demonstration. Real-world deployment in India requires a regulated stablecoin on-ramp partner and compliance with FIU-IND reporting obligations.</p>
              </div>

              <div>
                <b style={{ color: 'var(--text-main)' }}>3. Crypto Taxation Hook:</b>
                <p>Includes built-in automated 1% TDS deduction accounting and simulated 30% flat tax on gains for on-chain digital conversions.</p>
              </div>

              <div>
                <b style={{ color: 'var(--text-main)' }}>4. Behavioral Economics Architecture:</b>
                <p>Mental accounting (4 vaults: Spending, Savings, Goals, Bills) designed to counter hyper-discounting and prevent dopamine-driven impulse doom-spending.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowComplianceModal(false)}
              className="btn-premium btn-primary"
              style={{ width: '100%', marginTop: '20px' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
