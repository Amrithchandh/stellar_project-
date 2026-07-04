import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, LayoutGrid, DollarSign, Clock, Sliders, ArrowRight } from 'lucide-react';

const EmployerDashboard = ({ balanceState, fundStream, resetStream, getLiveBalances, onSwitchRole }) => {
  const [amount, setAmount] = useState('1000');
  const [rate, setRate] = useState('0.05'); // ₹0.05 per second = ₹180/hour
  const [allocations, setAllocations] = useState({
    spending: 50,
    savings: 20,
    goals: 20,
    bills: 10
  });

  const [liveOutflow, setLiveOutflow] = useState(0);
  const [employerRemaining, setEmployerRemaining] = useState(0);

  // Poll for live stream outflow simulation
  useEffect(() => {
    if (!balanceState.isActive) {
      setLiveOutflow(0);
      setEmployerRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const { totalAccrued, employerRemaining } = getLiveBalances();
      setLiveOutflow(totalAccrued);
      setEmployerRemaining(employerRemaining);
    }, 100);

    return () => clearInterval(interval);
  }, [balanceState.isActive, getLiveBalances]);

  const handleSliderChange = (vaultId, val) => {
    const newVal = Number(val);
    const oldVal = allocations[vaultId];
    const diff = newVal - oldVal;

    // Distribute the difference proportionally among other vaults
    const otherVaults = Object.keys(allocations).filter(k => k !== vaultId);
    const sumOthers = otherVaults.reduce((sum, k) => sum + allocations[k], 0);

    let updated = { ...allocations, [vaultId]: newVal };
    
    if (sumOthers > 0) {
      let allocatedDiff = 0;
      otherVaults.forEach((k, idx) => {
        let correction = 0;
        if (idx === otherVaults.length - 1) {
          correction = diff - allocatedDiff; // handle rounding
        } else {
          correction = Math.round(diff * (allocations[k] / sumOthers));
          allocatedDiff += correction;
        }
        updated[k] = Math.max(0, Math.min(100, updated[k] - correction));
      });
    } else {
      // If others are zero, just give it all to the first available other vault
      updated[otherVaults[0]] = 100 - newVal;
    }

    // Double check sum is exactly 100
    const finalSum = Object.values(updated).reduce((a, b) => a + b, 0);
    if (finalSum !== 100) {
      updated[otherVaults[0]] += (100 - finalSum);
    }

    setAllocations(updated);
  };

  const handleStartStream = (e) => {
    e.preventDefault();
    if (Number(amount) <= 0 || Number(rate) <= 0) {
      alert("Please enter valid positive values for stream funding");
      return;
    }
    fundStream(amount, rate, allocations);
  };

  return (
    <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)', minHeight: '100vh', padding: '20px' }}>
      
      {/* Top Navigation / Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Employer Console</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Stellar Stream Payroll System</p>
        </div>
        <button 
          onClick={onSwitchRole}
          className="btn-premium"
          style={{ fontSize: '12px', padding: '8px 12px', background: 'var(--border)', color: 'var(--text-main)', border: 'none', borderRadius: '12px' }}
        >
          Switch to Worker App
        </button>
      </div>

      {/* Ticker for active wage streaming */}
      {balanceState.isActive ? (
        <div className="glass-card animate-fade" style={{ margin: '0 0 24px', background: 'white', textAlign: 'center', borderColor: 'var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--primary)', marginBottom: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2e7d32', animation: 'pulse 1.5s infinite' }} />
            <h4 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>STREAMING ACCRUING WAGES</h4>
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'monospace', color: 'var(--primary)' }}>
            ₹{liveOutflow.toFixed(4)}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Rate: <b>₹{balanceState.streamRate}/sec</b> (₹{(balanceState.streamRate * 3600).toFixed(0)}/hour)
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border)', marginTop: '20px', paddingTop: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PAID TO WORKER</p>
              <p style={{ fontSize: '15px', fontWeight: '800' }}>₹{liveOutflow.toFixed(2)}</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>UNSTREAMED BALANCE</p>
              <p style={{ fontSize: '15px', fontWeight: '800' }}>₹{employerRemaining.toFixed(2)}</p>
            </div>
          </div>

          <button 
            onClick={resetStream}
            className="btn-premium"
            style={{ width: '100%', marginTop: '20px', background: '#fce8e6', color: '#d93025', gap: '4px', padding: '12px' }}
          >
            <RotateCcw size={16} /> Stop & Reclaim Stream
          </button>
        </div>
      ) : (
        /* Configuration Form */
        <form onSubmit={handleStartStream} className="glass-card animate-fade" style={{ margin: '0 0 24px', background: 'white' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>Fund Wage Stream</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>TOTAL BUDGET FUND (INR)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>₹</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 24px', borderRadius: '10px', border: '1.5px solid var(--border)', outline: 'none', fontSize: '15px', fontWeight: '600' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>STREAM ACCRUAL RATE (₹ / SEC)</label>
              <input 
                type="number" 
                step="0.001"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--border)', outline: 'none', fontSize: '15px', fontWeight: '600' }}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                ₹0.05/sec ≈ ₹180/hour. Worker balance updates continuously.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <Sliders size={18} color="var(--primary)" />
                <h5 style={{ fontSize: '12px', fontWeight: '800' }}>Initial Vault Split Allocations</h5>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', color: '#2d6a4f' }}>Spending Vault</span>
                    <span style={{ fontWeight: '800' }}>{allocations.spending}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100"
                    value={allocations.spending}
                    onChange={(e) => handleSliderChange('spending', e.target.value)}
                    className="allocation-slider"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', color: '#1a73e8' }}>Savings Vault (DCA)</span>
                    <span style={{ fontWeight: '800' }}>{allocations.savings}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100"
                    value={allocations.savings}
                    onChange={(e) => handleSliderChange('savings', e.target.value)}
                    className="allocation-slider"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', color: '#e09f3e' }}>Goals Vault (Locked)</span>
                    <span style={{ fontWeight: '800' }}>{allocations.goals}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100"
                    value={allocations.goals}
                    onChange={(e) => handleSliderChange('goals', e.target.value)}
                    className="allocation-slider"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', color: '#d93025' }}>Bills Vault (Auto-Pay)</span>
                    <span style={{ fontWeight: '800' }}>{allocations.bills}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100"
                    value={allocations.bills}
                    onChange={(e) => handleSliderChange('bills', e.target.value)}
                    className="allocation-slider"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="btn-premium btn-primary"
              style={{ width: '100%', marginTop: '16px', gap: '8px' }}
            >
              <Play size={18} fill="white" /> Deploy Stream to Stellar
            </button>
          </div>
        </form>
      )}

      {/* Info / Explanation Card */}
      <div className="glass-card" style={{ margin: 0, background: '#f8fafc', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <h5 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>How Wage Streaming Works</h5>
        <p style={{ lineHeight: '1.5' }}>
          StreamSave uses Stellar-native protocols to distribute payroll. Instead of receiving lump sums, the worker receives wages incrementally every elapsed second. This avoids the "lump-sum trap" and enables frictionless automated saving at the moment of earning.
        </p>
      </div>

      {/* CSS injection for pulsar dots */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(0.9); opacity: 1; }
        }
      `}</style>

    </div>
  );
};

export default EmployerDashboard;
