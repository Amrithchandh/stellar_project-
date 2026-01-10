import React, { useState } from 'react';
import { ArrowLeft, Plus, Landmark, MoreVertical, ChevronRight } from 'lucide-react';

const BankAccounts = ({ onBack, onAddBank, accounts = [] }) => {
  return (
    <div className="app-shell animate-fade" style={{ background: 'var(--bg-color)' }}>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ArrowLeft onClick={onBack} cursor="pointer" size={24} color="var(--text-main)" />
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Bank accounts</h3>
        </div>
      </header>

      <div style={{ padding: '16px' }}>
        <div 
          className="glass-card" 
          style={{ margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', cursor: 'pointer', border: '1px dashed var(--primary)' }}
          onClick={onAddBank}
        >
          <div className="icon-circle" style={{ background: '#e8f0fe', border: 'none' }}>
            <Plus size={24} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '600', fontSize: '15px' }}>Add bank account</p>
          </div>
          <ChevronRight size={20} color="var(--text-secondary)" />
        </div>

        <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
          Linked Accounts
        </h4>

        {accounts.map((acc, i) => (
          <div key={i} className="glass-card" style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
            <div className="icon-circle" style={{ background: '#f1f3f4', border: 'none' }}>
              <Landmark size={24} color="var(--text-main)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '700', fontSize: '16px' }}>{acc.bankName}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Savings Account  {acc.lastFour}</p>
            </div>
            <MoreVertical size={20} color="var(--text-secondary)" />
          </div>
        ))}

        {accounts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            <Landmark size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p style={{ fontSize: '14px' }}>No bank accounts linked yet.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', padding: '24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#1a73e8' }}>
            <Landmark size={20} style={{ margin: 'auto' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>
            Your bank accounts are secured with industry-standard encryption.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankAccounts;
