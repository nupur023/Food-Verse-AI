import React, { useState, useEffect } from 'react';
import { Recycle, Plus, X, Sparkles, Leaf, Clock, CheckCircle2, Lightbulb, IndianRupee } from 'lucide-react';
import { generateZeroWasteRecipes } from '../api';

const INDIAN_PANTRY_SUGGESTIONS = [
  'Leftover Dal', 'Stale Rotis', 'Boiled Potatoes', 'Curd / Dahi',
  'Leftover Rice', 'Onions', 'Tomatoes', 'Mustard Seeds',
  'Green Chillies', 'Ajwain', 'Besan (Gram Flour)', 'Paneer Scraps'
];

export default function ZeroWastePantry() {
  const [ingredients, setIngredients] = useState(['Leftover Dal', 'Stale Rotis', 'Boiled Potatoes', 'Curd / Dahi']);
  const [inputValue, setInputValue] = useState('');
  const [maxTime, setMaxTime] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fetchRecipes = async (items = ingredients, time = maxTime) => {
    setLoading(true);
    try {
      const data = await generateZeroWasteRecipes(items, time);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(ingredients, maxTime);
  }, []);

  const addIngredient = (item) => {
    const trimmed = item.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      const updated = [...ingredients, trimmed];
      setIngredients(updated);
      fetchRecipes(updated, maxTime);
    }
    setInputValue('');
  };

  const removeIngredient = (item) => {
    const updated = ingredients.filter((i) => i !== item);
    setIngredients(updated);
    fetchRecipes(updated, maxTime);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient(inputValue);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-emerald">Zero-Waste Desi Rasoi</span>
            <span className="badge badge-amber">Rupee & Carbon Savings</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Zero-Waste Indian Kitchen & Leftover Recycler</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Transform yesterday's dal, stale rotis, and boiled potatoes into high-protein breakfasts and snacks, saving money in INR (₹) and cutting food waste.
          </p>
        </div>
      </div>

      <div className="responsive-grid-2">
        {/* Left Column: Interactive Pantry Ingredients */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Available Rasoi Staples & Leftovers</h3>

          {/* Active Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '60px', padding: '0.75rem', background: 'rgba(10, 16, 28, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {ingredients.length === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                No ingredients added yet. Click suggested items below or type your own!
              </span>
            )}
            {ingredients.map((ing, i) => (
              <div key={i} className="tag-chip">
                <span>{ing}</span>
                <button onClick={() => removeIngredient(ing)} className="remove-btn" title="Remove">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Input field */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Add another ingredient (e.g. leftover sabzi, bread, poha)..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field"
            />
            <button
              onClick={() => addIngredient(inputValue)}
              className="btn btn-primary"
              style={{ padding: '0 1rem' }}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Quick Suggestions */}
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              Common Indian Leftovers & Staples:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {INDIAN_PANTRY_SUGGESTIONS.filter((s) => !ingredients.includes(s)).map((s, i) => (
                <button
                  key={i}
                  onClick={() => addIngredient(s)}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Prep time slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Maximum Cooking Time</span>
              <span style={{ fontWeight: 700, color: '#fbbf24' }}>{maxTime} minutes</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              step="5"
              value={maxTime}
              onChange={(e) => {
                const t = parseInt(e.target.value);
                setMaxTime(t);
                fetchRecipes(ingredients, t);
              }}
            />
          </div>
        </div>

        {/* Right Column: Generated Indian Zero-Waste Recipes & Savings */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Recycle size={18} color="#34d399" />
              <span>Gourmet Desi Leftover Upcycles</span>
            </h3>
            <span className="badge badge-emerald">Circular Rasoi</span>
          </div>

          {/* Recipes List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(result?.recipes_generated || []).map((recipe, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.02rem', color: '#ffffff' }}>{recipe.title}</h4>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                      {recipe.match_rate} Match
                    </span>
                    <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                      Saved: {recipe.saved_rupees}
                    </span>
                    <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                      <Leaf size={11} style={{ marginRight: '2px' }} />
                      {recipe.saved_carbon_footprint}
                    </span>
                    <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
                      <Clock size={11} style={{ marginRight: '2px' }} />
                      {recipe.prep_time}
                    </span>
                  </div>
                </div>

                {/* Recipe Instructions */}
                <ol style={{ paddingLeft: '1.2rem', margin: '0.35rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {recipe.instructions.map((step, sIdx) => (
                    <li key={sIdx} style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          {/* Kitchen Waste Reduction Tips */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>
              <Lightbulb size={16} />
              <span>Desi Rasoi Zero-Waste Wisdom</span>
            </div>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {(result?.waste_reduction_tips || [
                'Store leftover rotis wrapped in a cotton muslin cloth inside an airtight box to prevent hardening.',
                'Vegetable peelings (bottle gourd, potato, pea pods) can be tempered into nutritious fibrous sabzi or stock.',
                'Leftover sour curd makes the perfect fermentation starter for instant bhatura or rava dhokla.'
              ]).map((tip, tIdx) => (
                <li key={tIdx} style={{ marginBottom: '2px' }}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
