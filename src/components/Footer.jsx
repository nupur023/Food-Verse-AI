import React from 'react';
import { ShieldCheck, Heart, Terminal, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      paddingTop: '2.5rem',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      color: 'var(--text-muted)',
      fontSize: '0.84rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontWeight: 800, color: '#2d1a00' }}>🇮🇳 FOOD VERSE INDIA</span>
          <span>— Indian Multimodal Food Intelligence Architecture</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
            <ShieldCheck size={12} style={{ marginRight: '3px' }} />
            FSSAI Schedule 4 & ICMR-NIN Ready
          </span>
          <span className="badge badge-tulsi" style={{ fontSize: '0.7rem' }}>
            FastAPI + React 19 + ViT-Food-India
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        color: 'var(--text-dim)',
        fontSize: '0.78rem'
      }}>
        <span>© 2026 Food Verse AI India Systems. Designed for Indian kitchens, dhabas, street food, and wellness.</span>
        <span>Empowering authentic regional food recognition, circular zero-waste rasoi, and FSSAI standards.</span>
      </div>
    </footer>
  );
}
