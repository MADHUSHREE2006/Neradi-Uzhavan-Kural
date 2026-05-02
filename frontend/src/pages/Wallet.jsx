import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Wallet() {
  const [data, setData] = useState({ balance: 0, transactions: [] });

  useEffect(() => { api.get('/wallet').then((r) => setData(r.data)); }, []);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 680 }}>
        <h1 className="serif" style={{ marginBottom: '2rem', color: 'var(--green-900)' }}>My Wallet</h1>

        {/* Balance card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-800), var(--green-500))',
          borderRadius: 'var(--radius-xl)', padding: '2.5rem',
          marginBottom: '2rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Available Balance
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', color: '#fff', fontWeight: 700 }}>
              ₹{data.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
              💳 Neradi Uzhavan Kural Digital Wallet
            </p>
          </div>
        </div>

        {/* Transactions */}
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--green-900)' }}>Transaction History</h3>
        {data.transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <h3>No transactions yet</h3>
            <p>Your wallet activity will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.transactions.map((t) => (
              <div key={t._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: t.type === 'credit' ? 'var(--green-100)' : 'var(--red-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem',
                }}>
                  {t.type === 'credit' ? '↓' : '↑'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.92rem' }}>{t.description}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    {new Date(t.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: t.type === 'credit' ? 'var(--green-600)' : 'var(--red-600)' }}>
                    {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bal: ₹{t.balanceAfter}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
