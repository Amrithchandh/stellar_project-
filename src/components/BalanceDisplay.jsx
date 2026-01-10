import React from 'react';

const BalanceDisplay = ({ balance, studyGroup }) => {
  // Logic for 10 bundles concretization
  // If balance is 3000, 10 bundles of 300. Spent bundles are removed.
  const BUNDLE_COUNT = 10;
  const bundleValue = balance > 0 ? 300 : 0; // Fixed value per bundle for study simplicity
  const activeBundles = Math.floor(balance / 299.9);

  if (studyGroup === 'control') {
    return (
      <div className="glass-card" style={{ background: 'var(--surface)', margin: '16px 20px', borderRadius: '24px' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
          Account Balance
        </h4>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginTop: '4px' }}>
          ₹{balance.toLocaleString('en-IN')}
        </h2>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ background: 'var(--surface)', margin: '16px 20px', borderRadius: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
            Total Liquidity
          </h4>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginTop: '4px' }}>
            ₹{balance.toLocaleString('en-IN')}
          </h2>
        </div>
        <div style={{ background: 'rgba(26, 115, 232, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '12px' }}>
            TEST GROUP
          </span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Visual Resource Bundles (₹300/bundle)
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {Array.from({ length: BUNDLE_COUNT }).map((_, i) => (
            <div
              key={i}
              className={`bundle-icon ${i < activeBundles ? 'active' : 'spent'}`}
              style={{
                height: '40px',
                borderRadius: '8px',
                background: i < activeBundles ? 'var(--primary)' : 'var(--border)',
                opacity: i < activeBundles ? 1 : 0.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: i < activeBundles ? 'scale(1)' : 'scale(0.85)'
              }}
            >
              {i < activeBundles && <div style={{ width: '60%', height: '2px', background: 'rgba(255,255,255,0.3)', borderRadius: '1px' }} />}
            </div>
          ))}
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '12px', textAlign: 'center' }}>
          Concrete depiction of available spending energy
        </p>
      </div>
    </div>
  );
};

export default BalanceDisplay;
