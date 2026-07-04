import React, { useState, useEffect } from 'react';
import { 
  Leaf, ShieldCheck, Lock, Calendar, Landmark, Coins, 
  ArrowUpRight, AlertCircle, Sparkles, Send, TrendingUp 
} from 'lucide-react';
import { getOraclePrice } from '../hooks/useBalance';

const WorkerDashboard = ({ 
  balanceState, 
  getLiveBalances, 
  withdraw, 
  triggerDca, 
  updateAllocations, 
  onSwitchRole 
}) => {
  const [liveData, setLiveData] = useState({
    balances: { spending: 0, savings: 0, goals: 0, bills: 0 },
    totalAccrued: 0,
    employerRemaining: 0,
    elapsedTime: 0
  });

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'vaults', 'history'
  const [selectedVault, setSelectedVault] = useState(null); // for withdrawal modal
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [frictionDelay, setFrictionDelay] = useState(0); // friction countdown
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState('Welcome! StreamSave is active. Watch your wages grow in real-time.');
  
  // Reflector Price tracking
  const [oraclePrice, setOraclePrice] = useState(6500);

  // Poll real-time stream data
  useEffect(() => {
    // Initial fetch
    const initial = getLiveBalances();
    setLiveData(initial);
    setOraclePrice(getOraclePrice(balanceState.targetAsset));

    const timer = setInterval(() => {
      const data = getLiveBalances();
      setLiveData(data);
      setOraclePrice(getOraclePrice(balanceState.targetAsset));
    }, 1000);

    return () => clearInterval(timer);
  }, [getLiveBalances, balanceState.targetAsset]);

  // Update AI Coach Nudge messages dynamically based on user state
  useEffect(() => {
    if (!balanceState.isActive) {
      setNudgeMessage('No active payroll stream detected. Ask your employer to deploy a StreamSave payroll contract.');
      return;
    }

    const { balances } = liveData;
    const totalDca = balanceState.accumulatedDcaAsset;
    
    // Choose nudge
    if (totalDca > 0.05) {
      setNudgeMessage(`✨ Sparkles: You have saved ${(totalDca).toFixed(4)}g of Digital Gold! At this rate, your buffer targets are fully secured.`);
    } else if (balances.goals > 150) {
      setNudgeMessage(`💡 Suggestion: Your Goals vault has ₹${balances.goals.toFixed(2)} accumulated. Think before withdrawing to preserve your compound interest.`);
    } else if (balances.bills > 80) {
      setNudgeMessage('📅 Calendar Check: Bills & EMI vault is auto-accruing. Your next scheduled payment is fully covered.');
    } else {
      setNudgeMessage('🌱 Financial Coach: Your wages are streaming into 4 separate vaults. The spending pain is gone because the saving is automated.');
    }
  }, [liveData.balances, balanceState.accumulatedDcaAsset, balanceState.isActive]);

  const handleWithdrawClick = (vaultId) => {
    setSelectedVault(vaultId);
    setWithdrawAmount('');
    setFrictionDelay(0);
  };

  const executeWithdrawal = () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return;

    if (liveData.balances[selectedVault] < amount) {
      alert("Insufficient vault balance!");
      return;
    }

    // Apply friction delays based on vault type (Behavioral economics friction inversion)
    if (selectedVault === 'goals') {
      // 5 second delay for Goals vault
      setIsWithdrawing(true);
      let count = 5;
      setFrictionDelay(count);
      
      const interval = setInterval(() => {
        count -= 1;
        setFrictionDelay(count);
        if (count <= 0) {
          clearInterval(interval);
          withdraw(selectedVault, amount);
          setIsWithdrawing(false);
          setSelectedVault(null);
          alert(`Successfully withdrew ₹${amount} from Goals Vault! Transaction logged on Stellar ledger.`);
        }
      }, 1000);
    } else if (selectedVault === 'savings') {
      // 3 second delay for Savings
      setIsWithdrawing(true);
      let count = 3;
      setFrictionDelay(count);
      
      const interval = setInterval(() => {
        count -= 1;
        setFrictionDelay(count);
        if (count <= 0) {
          clearInterval(interval);
          withdraw(selectedVault, amount);
          setIsWithdrawing(false);
          setSelectedVault(null);
          alert(`Successfully withdrew ₹${amount} from Savings! Note: This interrupts your DCA accumulation.`);
        }
      }, 1000);
    } else {
      // Instantly withdraw for spending/bills
      withdraw(selectedVault, amount);
      setSelectedVault(null);
      alert(`Successfully withdrew ₹${amount} from ${selectedVault} vault!`);
    }
  };

  // Asset projection: what will I own in 30 days at current savings rate
  const monthlySavingsAccrual = balanceState.streamRate * (balanceState.vaultAllocations.savings / 100) * 3600 * 24 * 30;
  const projectedGold = monthlySavingsAccrual / oraclePrice;

  return (
    <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)', minHeight: '100vh', padding: '20px 20px 100px' }}>
      
      {/* Top Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Leaf size={24} color="var(--primary)" />
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' }}>StreamSave</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={onSwitchRole}
            className="btn-premium"
            style={{ fontSize: '11px', padding: '6px 10px', background: 'var(--border)', border: 'none', borderRadius: '10px' }}
          >
            Employer App
          </button>
          <div className="kyc-badge">
            <ShieldCheck size={14} /> Verified
          </div>
        </div>
      </header>

      {/* Main Streaming Ticker */}
      <div className="glass-card" style={{ margin: '0 0 20px', background: 'white', textAlign: 'center', padding: '24px' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
          On-Chain Wage Stream
        </h4>
        
        {balanceState.isActive ? (
          <div className="live-ticker">
            ₹{liveData.totalAccrued.toFixed(4)}
          </div>
        ) : (
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-secondary)', margin: '12px 0' }}>
            No Wage Stream
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <TrendingUp size={14} color="var(--primary)" />
          <span>Accruing ₹{(balanceState.streamRate * 3600).toFixed(0)}/hr continuously</span>
        </div>
      </div>

      {/* AI Coach Nudge Panel */}
      <div className="nudge-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Sparkles size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <span style={{ fontWeight: '800', fontSize: '11px', color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>AI FINANCIAL COACH</span>
          <p style={{ lineHeight: '1.4' }}>{nudgeMessage}</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '16px', gap: '16px' }}>
        <span 
          onClick={() => setActiveTab('overview')}
          style={{ paddingBottom: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : 'none' }}
        >
          Vaults
        </span>
        <span 
          onClick={() => setActiveTab('projection')}
          style={{ paddingBottom: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: activeTab === 'projection' ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'projection' ? '2px solid var(--primary)' : 'none' }}
        >
          DCA & Projection
        </span>
        <span 
          onClick={() => setActiveTab('history')}
          style={{ paddingBottom: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : 'none' }}
        >
          Ledger History
        </span>
      </div>

      {/* Overview/Vaults Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Spending Vault */}
          <div className="wallet-card spending-wallet" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <div className="wallet-icon">🌱</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>SPENDING (Instant)</span>
              <p style={{ fontSize: '18px', fontWeight: '800' }}>₹{liveData.balances.spending.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => handleWithdrawClick('spending')}
              className="btn-premium btn-primary"
              style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '10px' }}
            >
              Withdraw
            </button>
          </div>

          {/* Savings Vault */}
          <div className="wallet-card savings-wallet" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <div className="wallet-icon">📈</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>SAVINGS (Auto-DCA)</span>
              <p style={{ fontSize: '18px', fontWeight: '800' }}>₹{liveData.balances.savings.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => handleWithdrawClick('savings')}
              className="btn-premium"
              style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white' }}
            >
              Withdraw
            </button>
          </div>

          {/* Goals Vault */}
          <div className="wallet-card goals-wallet" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <div className="wallet-icon"><Lock size={16} /></div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>GOALS (Time-Locked)</span>
              <p style={{ fontSize: '18px', fontWeight: '800' }}>₹{liveData.balances.goals.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => handleWithdrawClick('goals')}
              className="btn-premium"
              style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '10px', background: '#e09f3e', color: 'white', border: 'none' }}
            >
              Unlock
            </button>
          </div>

          {/* Bills Vault */}
          <div className="wallet-card bills-wallet" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <div className="wallet-icon"><Calendar size={16} /></div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>BILLS (Auto-Pay)</span>
              <p style={{ fontSize: '18px', fontWeight: '800' }}>₹{liveData.balances.bills.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => handleWithdrawClick('bills')}
              className="btn-premium"
              style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '10px', background: '#d93025', color: 'white', border: 'none' }}
            >
              Pay
            </button>
          </div>
        </div>
      )}

      {/* Projection & DCA Tab */}
      {activeTab === 'projection' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* SaveVault DCA Status */}
          <div className="glass-card" style={{ margin: 0, background: 'white' }}>
            <h5 style={{ fontWeight: '800', fontSize: '13px', marginBottom: '12px' }}>SaveVault DCA Asset Accumulation</h5>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
              <span>Target Asset:</span>
              <span style={{ fontWeight: '700' }}>{balanceState.targetAsset}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
              <span>Oracle Price (XAU):</span>
              <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>₹{oraclePrice.toLocaleString('en-IN')}/g</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
              <span>Accumulated Asset:</span>
              <span style={{ fontWeight: '800', color: 'var(--primary)' }}>{balanceState.accumulatedDcaAsset.toFixed(4)} g</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '12px' }}>
              <span>Total Converted Cash:</span>
              <span style={{ fontWeight: '700' }}>₹{balanceState.totalDcaSpent.toFixed(2)}</span>
            </div>

            <button 
              onClick={triggerDca}
              disabled={liveData.balances.savings <= 0}
              className="btn-premium btn-primary"
              style={{ width: '100%', gap: '8px' }}
            >
              <Sparkles size={16} /> Execute Weekly DCA Conversion
            </button>
          </div>

          {/* Savings goal progress */}
          <div className="glass-card" style={{ margin: 0, background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
              <span style={{ fontWeight: '700' }}>Goal Progress:</span>
              <span>₹{balanceState.totalDcaSpent.toFixed(0)} / ₹{balanceState.goalAmount}</span>
            </div>
            <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${Math.min(100, (balanceState.totalDcaSpent / balanceState.goalAmount) * 100)}%`, 
                  height: '100%', 
                  background: 'var(--primary)',
                  transition: 'width 0.5s' 
                }} 
              />
            </div>
          </div>

          {/* 30 Day projections */}
          <div className="glass-card" style={{ margin: 0, background: '#f8fafc', border: '1px solid var(--border)' }}>
            <h5 style={{ fontWeight: '800', fontSize: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} color="var(--primary)" /> 30-Day "What will I own" Projection
            </h5>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Based on your active stream allocation of <b>{balanceState.vaultAllocations.savings}%</b> to Savings, in 30 days your stream will auto-convert:
            </p>
            <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700' }}>
                <span>Future Gold Accrued:</span>
                <span style={{ color: 'var(--primary)' }}>+{projectedGold.toFixed(4)} grams</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span>Equivalent Cash savings:</span>
                <span>₹{monthlySavingsAccrual.toFixed(0)}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Ledger History Tab */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h5 style={{ fontWeight: '800', fontSize: '13px', marginBottom: '4px' }}>On-Chain Transaction Log</h5>
          {balanceState.transactions.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '24px' }}>
              No transactions recorded on this stream yet.
            </p>
          ) : (
            balanceState.transactions.map((tx, idx) => (
              <div key={idx} style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginBottom: '2px' }}>
                  <span>
                    {tx.type === 'withdraw' && `Withdraw - ${tx.vaultId}`}
                    {tx.type === 'dca_conversion' && `DCA Asset Conversion`}
                    {tx.type === 'fund_stream' && `Fund Stream deployed`}
                    {tx.type === 'update_allocations' && `Allocation Map update`}
                  </span>
                  <span style={{ color: tx.type === 'withdraw' ? '#d93025' : 'var(--primary)' }}>
                    {tx.type === 'withdraw' && `-₹${tx.amount}`}
                    {tx.type === 'dca_conversion' && `+${tx.receivedAsset.toFixed(4)}g`}
                    {tx.type === 'fund_stream' && `+₹${tx.amount}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '10px' }}>
                  <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  <span>{tx.type === 'dca_conversion' ? `Gold Price: ₹${tx.price}` : `Stellar Tx`}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Withdrawal and Friction Dialog */}
      {selectedVault && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-card animate-fade" style={{ background: 'white', width: '100%', maxWidth: '360px', margin: 0 }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '8px' }}>
              Withdraw from {selectedVault.toUpperCase()} Vault
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Available: <b>₹{liveData.balances[selectedVault].toFixed(2)}</b>
            </p>

            {frictionDelay > 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#e09f3e' }} />
                <h5 style={{ color: '#e09f3e', fontWeight: '800', fontSize: '14px' }}>
                  BEHAVIORAL FRICTION DELAY
                </h5>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Friction is active on goals/savings to prevent impulsive spending.
                </p>
                <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '12px', color: 'var(--text-main)' }}>
                  {frictionDelay}s remaining...
                </div>
              </div>
            ) : (
              <div>
                <input 
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border)', outline: 'none', fontSize: '15px', marginBottom: '16px' }}
                />

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setSelectedVault(null)}
                    disabled={isWithdrawing}
                    className="btn-premium"
                    style={{ flex: 1, border: '1.5px solid var(--border)', background: 'white' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executeWithdrawal}
                    disabled={isWithdrawing || !withdrawAmount || Number(withdrawAmount) <= 0}
                    className="btn-premium btn-primary"
                    style={{ flex: 1 }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkerDashboard;
