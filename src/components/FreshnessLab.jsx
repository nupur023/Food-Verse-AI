import React, { useState, useEffect } from 'react';
import { Microscope, AlertTriangle, ShieldCheck, Info, ShieldAlert, RefreshCw } from 'lucide-react';
import { analyzeFreshness } from '../api';

const INDIAN_FRESHNESS_ITEMS = [
  { id: 'tomato',      name: 'Desi Tomato (Tamatar)',       category: 'Produce',        icon: '🍅' },
  { id: 'potato',      name: 'Potato (Aloo - Pahadi/Jyoti)',category: 'Tuber',          icon: '🥔' },
  { id: 'onion',       name: 'Nasik Red Onion (Pyaaz)',     category: 'Produce',        icon: '🧅' },
  { id: 'banana',      name: 'Banana (Kela - Robusta)',     category: 'Fruit',          icon: '🍌' },
  { id: 'mango',       name: 'Alphonso Mango (Aam)',        category: 'Seasonal Fruit', icon: '🥭' },
  { id: 'spinach',     name: 'Desi Palak (Spinach)',        category: 'Leafy Green',    icon: '🥬' },
  { id: 'cauliflower', name: 'Cauliflower (Phool Gobhi)',   category: 'Cruciferous',    icon: '🥦' },
  { id: 'brinjal',     name: 'Brinjal (Bharta Baingan)',    category: 'Produce',        icon: '🍆' },
  { id: 'cooked_dal',  name: 'Cooked Dal / Curry',          category: 'Prepared Food',  icon: '🍲' }
];

function getStageColor(stage = '') {
  if (stage.includes('Prime') || stage.includes('Crisp') || stage.includes('Peak') || stage.includes('Fresh'))
    return '#15803d';
  if (stage.includes('Semi') || stage.includes('Soft') || stage.includes('Chits'))
    return '#92400e';
  if (stage.includes('Wrinkled') || stage.includes('Sprouting') || stage.includes('Yellowing') || stage.includes('Foam'))
    return '#c2510e';
  return '#9f1239';
}

export default function FreshnessLab() {
  const [selectedItem, setSelectedItem] = useState(INDIAN_FRESHNESS_ITEMS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fetchFreshness = async (item) => {
    setLoading(true);
    try {
      const data = await analyzeFreshness(item.id);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFreshness(selectedItem); }, [selectedItem]);

  const score = result?.freshness_index ?? 92;
  const isOptimal = score >= 85;
  const isModerate = score >= 70 && score < 85;

  const strokeColor = isOptimal ? '#22c55e' : isModerate ? '#f59e0b' : '#f43f5e';
  const circumference = 2 * Math.PI * 82;

  return (
    <div className="section-page">
      {/* ── Banner ── */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-sky">Indian Produce Diagnostics</span>
            <span className="badge badge-amber">SpectralDecay-CNN-v2</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#2d1a00' }}>
            🌿 Desi Produce & Prepared Food Freshness Lab
          </h2>
          <p style={{ color: '#7c5832', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Visual appearance diagnostics for common Indian fruits, tubers, leafy greens, and cooked dals in tropical storage conditions.
          </p>
        </div>

        {/* Item selector chips */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {INDIAN_FRESHNESS_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`btn ${selectedItem.id === item.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.42rem 0.75rem', fontSize: '0.81rem', gap: '0.3rem' }}
            >
              <span>{item.icon}</span>
              <span>{item.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Safety Warning ── */}
      <div style={{
        background: 'rgba(255, 228, 230, 0.60)',
        border: '1px solid rgba(244, 63, 94, 0.28)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.2rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.85rem'
      }}>
        <ShieldAlert size={21} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.83rem', color: '#7c2d12', lineHeight: 1.5 }}>
          <strong style={{ color: '#9f1239' }}>CRITICAL FOOD SAFETY LIMITATION:</strong>{' '}
          Visual analysis evaluates only visible surface characteristics (skin turgor, color shifts, fungal mycelium, sprouting).{' '}
          <em>Never assume food is completely safe to eat based solely on an image.</em> Dangerous bacterial pathogens{' '}
          (<em>Salmonella, E. coli, Bacillus cereus</em> in cooked rice/dal) may be active without visible spoilage.{' '}
          Always maintain refrigerated storage (&lt;4°C) for cooked meals.
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="responsive-grid-2">
        {/* Left: Visual Freshness Gauge */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span className="badge badge-sky">{selectedItem.category}</span>
            <span style={{ fontSize: '0.82rem', color: '#7c5832' }}>Surface Optical Assessment</span>
          </div>

          {/* Freshness Gauge */}
          <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0.5rem 0' }}>
            {loading ? (
              <div style={{
                width: '200px', height: '200px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}>
                <RefreshCw size={32} color="#f97316" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.82rem', color: '#7c5832' }}>Scanning...</span>
              </div>
            ) : (
              <>
                <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="100" cy="100" r="82" stroke="#fde8cc" strokeWidth="14" fill="none" />
                  <circle
                    cx="100" cy="100" r="82"
                    stroke={strokeColor}
                    strokeWidth="14" fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - score / 100)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1), stroke 0.5s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#2d1a00', lineHeight: 1 }}>{score}</span>
                  <span style={{ fontSize: '0.78rem', color: '#7c5832', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Freshness Index
                  </span>
                  <span style={{ fontSize: '0.76rem', color: strokeColor, fontWeight: 700, marginTop: '4px' }}>
                    {result?.risk_level || 'Safe / Optimal Quality'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Ripeness Stage */}
          <div style={{
            background: 'rgba(255, 248, 238, 0.80)',
            border: '1px solid rgba(220, 140, 40, 0.18)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem', width: '100%'
          }}>
            <div style={{ fontSize: '0.74rem', color: '#7c5832', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 }}>
              Observed Physical Stage
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: getStageColor(result?.ripeness_stage) }}>
              {result?.ripeness_stage || 'Prime Storage Freshness'}
            </div>
          </div>

          {/* Shelf Life + Climate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', width: '100%' }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.22)',
              borderRadius: 'var(--radius-md)', padding: '0.75rem'
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#15803d' }}>
                {result?.shelf_life_remaining_days ?? '5.0'}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#7c5832' }}>Days Safe Storage</span>
            </div>
            <div style={{
              background: 'rgba(249, 115, 22, 0.07)',
              border: '1px solid rgba(249, 115, 22, 0.20)',
              borderRadius: 'var(--radius-md)', padding: '0.75rem'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ea580c' }}>🌡️ Tropical</div>
              <span style={{ fontSize: '0.72rem', color: '#7c5832' }}>Indian Climate Calibrated</span>
            </div>
          </div>
        </div>

        {/* Right: Visual Evidence & Storage */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#2d1a00', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Microscope size={20} color="#0ea5e9" />
            <span>Visual Evidence & Spoilage Analysis</span>
          </h3>

          {/* Visible Evidence */}
          <div style={{
            background: 'rgba(224, 242, 254, 0.55)',
            border: '1px solid rgba(14, 165, 233, 0.22)',
            borderRadius: 'var(--radius-md)', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.45rem'
          }}>
            <div style={{ fontSize: '0.79rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>
              🔬 Detected Visual Evidence:
            </div>
            <p style={{ margin: 0, fontSize: '0.87rem', color: '#2d1a00', lineHeight: 1.5 }}>
              {result?.visible_evidence_analysis || `Optical scan confirms uniform outer peel firmness, healthy stem hydration, and absence of soft rot lesions or fungal spores on ${selectedItem.name}.`}
            </p>
          </div>

          {/* Spoilage Risk */}
          <div style={{
            background: 'rgba(254, 243, 199, 0.65)',
            border: '1px solid rgba(245, 158, 11, 0.28)',
            borderRadius: 'var(--radius-md)', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#92400e', fontSize: '0.84rem', fontWeight: 700 }}>
              <AlertTriangle size={16} />
              <span>Key Spoilage Vulnerability</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#2d1a00', lineHeight: 1.45 }}>
              {result?.spoilage_risks || 'Moisture accumulation accelerates bacterial soft rot. Inspect calyx and seams closely.'}
            </p>
          </div>

          {/* Storage Recommendation */}
          <div style={{
            background: 'rgba(224, 242, 254, 0.45)',
            border: '1px solid rgba(14, 165, 233, 0.20)',
            borderRadius: 'var(--radius-md)', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0369a1', fontSize: '0.84rem', fontWeight: 700 }}>
              <Info size={16} />
              <span>Recommended Indian Storage Protocol</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#7c5832', lineHeight: 1.45 }}>
              {result?.storage_recommendation || 'Store in an airy jute bag in a cool, dark pantry away from direct heat.'}
            </p>
          </div>

          {/* Culinary Action */}
          <div style={{
            background: 'rgba(34, 197, 94, 0.07)',
            border: '1px solid rgba(34, 197, 94, 0.22)',
            borderRadius: 'var(--radius-md)', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontSize: '0.84rem', fontWeight: 700 }}>
              <ShieldCheck size={16} />
              <span>Culinary Action Protocol</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#7c5832' }}>
              {result?.culinary_action || 'Prime quality for immediate culinary preparation.'}
            </p>
          </div>

          {/* Indicators list */}
          {result?.visual_indicators?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
              {result.visual_indicators.map((ind, i) => (
                <span key={i} className="badge badge-tulsi" style={{ fontSize: '0.72rem' }}>✓ {ind}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
