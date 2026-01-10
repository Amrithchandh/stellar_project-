import React from 'react';

const BalanceDisplay = ({ balance }) => {
  const units = Math.max(0, Math.floor(balance / 10));
  const INITIAL_MAX_UNITS = 500; // Representing ₹5,000 total possible
  const MAX_VISIBLE_UNITS = 100;

  // We want to show the 'loss' by showing spent units
  // For simplicity in this simulation, we'll show 100 units representing the 'top' of the balance
  // or a consistent grid where boxes turn grey.

  return (
    <div className="glass-card" style={{ background: 'var(--surface)', margin: '16px 20px', borderRadius: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
            Total Balance
          </h4>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginTop: '4px' }}>
            ₹{balance.toLocaleString('en-IN')}
          </h2>
        </div>
        <div style={{ background: '#e8f5e9', padding: '4px 10px', borderRadius: '8px' }}>
          <span style={{ color: '#2e7d32', fontWeight: '700', fontSize: '12px' }}>
            {units} UNITS
          </span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Visual Concretization (₹10/unit)
        </p>

        <div className="visual-loss-grid">
          {Array.from({ length: MAX_VISIBLE_UNITS }).map((_, i) => {
            // Logic: Each box represents a portion of the *current* relative to a baseline
            // For the user to "see" reduction, we can map 100 boxes to say ₹1000 total.
            // Or better: show the current units count but filled vs empty.
            const isActive = i < (units % MAX_VISIBLE_UNITS || (units > 0 ? MAX_VISIBLE_UNITS : 0));

            return (
              <div
                key={i}
                className={`currency-unit ${isActive ? 'active' : 'spent'}`}
                style={{
                  background: isActive ? '#34a853' : '#f1f3f4',
                  borderColor: isActive ? '#2e7d32' : 'transparent',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
              />
            );
          })}
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: '500' }}>
          {units > MAX_VISIBLE_UNITS ? `+ ${units - MAX_VISIBLE_UNITS} additional units` : 'All units visible'}
        </p>
      </div>
    </div>
  );
};

export default BalanceDisplay;
