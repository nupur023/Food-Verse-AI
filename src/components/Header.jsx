import React from 'react';
import { Sparkles, ShieldCheck, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function Header({ backendStatus, onRefreshStatus, activeTab, setActiveTab }) {
  const isOnline = backendStatus?.online;
  const latency = backendStatus?.latency;

  const tabs = [
    { id: 'scanner',       label: 'Desi Food Scanner',  icon: '🍛' },
    { id: 'freshness',     label: 'Freshness Lab',      icon: '🥭' },
    { id: 'hygiene',       label: 'FSSAI & Hygiene',    icon: '🛡️' },
    { id: 'cooking',       label: 'Smart Desi Chef',    icon: '👨‍🍳' },
    { id: 'substitutions', label: 'Desi Substitutions', icon: '🔄' },
    { id: 'nutrition',     label: 'Thali & Nutrition',  icon: '📊' },
    { id: 'pantry',        label: 'Zero-Waste Rasoi',   icon: '♻️' },
  ];

  return (
    <header style={{ paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
      {/* Top Brand Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1.1rem',
        borderBottom: '1.5px solid rgba(249, 115, 22, 0.14)'
      }}>
        {/* Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f97316 0%, #facc15 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 22px rgba(249, 115, 22, 0.38)',
            flexShrink: 0
          }}>
            <Sparkles size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.7rem', margin: 0, fontWeight: 900, letterSpacing: '-0.03em', color: '#2d1a00' }}>
                FOOD VERSE{' '}
                <span className="gradient-text-amber">INDIA</span>
              </h1>
              <span className="badge badge-saffron" style={{ fontSize: '0.68rem' }}>🇮🇳 FSSAI v2.0</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#7c5832', margin: 0, marginTop: '1px' }}>
              Indian Food Recognition · Freshness · FSSAI Hygiene · Nutrition Intelligence
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: isOnline ? 'rgba(34, 197, 94, 0.10)' : 'rgba(249, 115, 22, 0.10)',
            border: `1px solid ${isOnline ? 'rgba(34, 197, 94, 0.32)' : 'rgba(249, 115, 22, 0.32)'}`,
            fontSize: '0.81rem',
          }}>
            {isOnline
              ? <Wifi size={14} color="#16a34a" />
              : <WifiOff size={14} color="#ea580c" />
            }
            <span style={{ fontWeight: 700, color: isOnline ? '#15803d' : '#9a3412' }}>
              {isOnline ? 'FastAPI Backend Live' : 'Offline AI Engine'}
            </span>
            {latency && (
              <span style={{ color: '#a87c52', fontSize: '0.74rem' }}>({latency}ms)</span>
            )}
            <button
              onClick={onRefreshStatus}
              title="Ping server"
              style={{
                background: 'none', border: 'none',
                color: '#a87c52', cursor: 'pointer',
                display: 'flex', alignItems: 'center', padding: '2px',
                borderRadius: '50%', transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#a87c52'}
            >
              <RefreshCw size={13} />
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            fontSize: '0.78rem',
            color: '#15803d',
            fontWeight: 600
          }}>
            <ShieldCheck size={14} color="#16a34a" />
            <span>FSSAI Schedule 4</span>
          </div>
        </div>
      </div>

      {/* Pill Navigation Bar */}
      <nav style={{ marginTop: '1.1rem' }}>
        <div className="nav-pill-list">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-pill-item ${isActive ? 'active' : ''}`}
                id={`tab-${tab.id}`}
              >
                <span style={{ fontSize: '1.05rem' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
