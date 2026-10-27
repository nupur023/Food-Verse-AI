import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Sparkles, AlertCircle, Check, Search, Scale, ShieldCheck } from 'lucide-react';
import { getIngredientSubstitution } from '../api';

const INDIAN_STAPLES = [
  'ghee',
  'curd',
  'paneer',
  'onion & garlic',
  'tomato',
  'maida',
  'sugar'
];

const DIETARY_FILTERS = [
  { id: 'jain', label: '🪷 Jain Friendly (No Root/Allium)' },
  { id: 'vegan', label: '🌱 100% Plant-Based / Vegan' },
  { id: 'low-fat', label: '📉 Low-Oil / Low-Fat' },
  { id: 'gluten-free', label: '🌾 Gluten-Free (Millets)' },
  { id: 'diabetic', label: '🩺 Low Glycemic / Diabetic' },
  { id: 'budget-saver', label: '💰 Budget Saver (Inflation Swap)' }
];

export default function SubstitutionHub() {
  const [selectedIngredient, setSelectedIngredient] = useState('ghee');
  const [customInput, setCustomInput] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('vegan');
  const [loading, setLoading] = useState(false);
  const [subResult, setSubResult] = useState(null);

  const fetchSubstitution = async (ing, diet) => {
    setLoading(true);
    try {
      const data = await getIngredientSubstitution(ing, diet);
      setSubResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ingToUse = customInput.trim() || selectedIngredient;
    fetchSubstitution(ingToUse, selectedDiet);
  }, [selectedIngredient, selectedDiet]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      fetchSubstitution(customInput.trim(), selectedDiet);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-amber">Desi Culinary Swaps</span>
            <span className="badge badge-emerald">Jain & Ayurvedic Knowledge Graph</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Smart Indian Ingredient Substitution Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Replace ghee, curd, paneer, tomatoes, or onion-garlic with authentic Indian culinary alternatives while preserving tadka flavor and gravy texture.
          </p>
        </div>
      </div>

      <div className="responsive-grid-2">
        {/* Left Column: Selectors */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', margin: 0 }}>1. Select Desi Ingredient to Substitute</h3>

          {/* Preset Indian Staples */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {INDIAN_STAPLES.map((ing) => (
              <button
                key={ing}
                onClick={() => {
                  setSelectedIngredient(ing);
                  setCustomInput('');
                }}
                className={`btn ${selectedIngredient === ing && !customInput ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 0.9rem', textTransform: 'capitalize' }}
              >
                {ing}
              </button>
            ))}
          </div>

          {/* Custom Search Input */}
          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Or type any ingredient (e.g., tamarind, mawa, besan, cashews)..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>
              <Search size={16} />
            </button>
          </form>

          <h3 style={{ fontSize: '1.15rem', margin: '0.75rem 0 0' }}>2. Choose Dietary Constraint or Preference</h3>

          {/* Diet Tag Filter Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
            {DIETARY_FILTERS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDiet(d.id)}
                className={`btn ${selectedDiet === d.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.65rem 0.8rem', justifyContent: 'flex-start', fontSize: '0.82rem' }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Substitution Result Card */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge badge-emerald">Optimal Desi Culinary Swap</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: {selectedDiet.toUpperCase()}</span>
          </div>

          {/* Swap Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Original Staple</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'capitalize', color: '#fb7185' }}>
                {subResult?.original_ingredient || selectedIngredient}
              </div>
            </div>

            <ArrowRightLeft size={24} color="#34d399" />

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Replacement</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                Smart Desi Alternative
              </div>
            </div>
          </div>

          {/* Recommendation Description */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.2rem'
          }}>
            <h4 style={{ fontSize: '0.9rem', color: '#34d399', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} />
              <span>Recommended Swap Formula</span>
            </h4>
            <p style={{ margin: 0, fontSize: '1.02rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.45 }}>
              {subResult?.smart_substitute || 'Loading smart swap...'}
            </p>
          </div>

          {/* Ratio & Culinary Impact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(10, 16, 28, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                <Scale size={14} />
                <span>Culinary Ratio</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 600 }}>
                {subResult?.ratio || '1:1 equivalent culinary replacement'}
              </div>
            </div>

            <div style={{
              background: 'rgba(10, 16, 28, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                <ShieldCheck size={14} />
                <span>Tadka & Gravy Impact</span>
              </div>
              <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                {subResult?.culinary_impact || 'Preserves authentic Indian tadka flavor, gravy emulsion, and digestive balance.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
