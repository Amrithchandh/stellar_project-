import React from 'react';

const WALLETS = [
  { id: 'leisure', name: 'Leisure', icon: '', color: '#1a73e8' },
  { id: 'savings', name: 'Savings', icon: '', color: '#34a853' },
  { id: 'goals', name: 'Goals', icon: '', color: '#f9ab00' },
  { id: 'bills', name: 'Bills & EMI', icon: '', color: '#d93025' },
];

const WalletSelector = ({ selectedId, onSelect, balances }) => {
  return (
    <div className="wallet-container">
      {WALLETS.map(wallet => (
        <div 
          key={wallet.id}
          className={`wallet-card ${selectedId === wallet.id ? 'active' : ''}`}
          onClick={() => onSelect(wallet)}
        >
          <div className="wallet-icon">{wallet.icon}</div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{wallet.name}</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              ?{balances[wallet.id].toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletSelector;
