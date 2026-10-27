import React, { useState, useEffect } from 'react';
import { Camera, Upload, Sparkles, AlertTriangle, CheckCircle, Clock, Heart, Flame, ShieldAlert, Sliders, ChevronDown, Check, HelpCircle } from 'lucide-react';
import { recognizeFood, estimateIndianPortions } from '../api';

const INDIAN_PRESETS = [
  {
    id: 'poha',
    name: 'Indori Poha with Sev & Jeeravan',
    category: 'Breakfast',
    thumb: '🌾',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    description: 'Fluffy steamed flattened rice tempered with mustard, fennel seeds, peanuts, and topped with crisp nylon sev and jeeravan masala.'
  },
  {
    id: 'dosa',
    name: 'Crispy Masala Dosa with Sambar & Chutney',
    category: 'South Indian',
    thumb: '🥞',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    description: 'Fermented lentil-rice crepe stuffed with turmeric-mustard potato masala, paired with tangy toor dal sambar.'
  },
  {
    id: 'thali',
    name: 'Traditional Indian Vegetarian Thali',
    category: 'Complete Meal',
    thumb: '🍱',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    description: 'Balanced meal with 2 wheat phulkas, 1 katori dal tadka, seasonal aloo-gobhi sabzi, jeera rice, fresh kachumber, and curd.'
  },
  {
    id: 'paneer',
    name: 'Shahi Paneer Butter Masala',
    category: 'North Indian',
    thumb: '🧀',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    description: 'Tender cottage cheese cubes simmered in silken tomato-cashew gravy scented with kasuri methi and green cardamom.'
  },
  {
    id: 'biryani',
    name: 'Hyderabadi Dum Vegetable Biryani',
    category: 'Specialty',
    thumb: '🍚',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    description: 'Aged basmati rice slow-cooked on dum with spiced garden vegetables, saffron milk, fried onions (birista), and mint.'
  },
  {
    id: 'samosa',
    name: 'Crispy Punjabi Samosa with Chutneys',
    category: 'Street Snack',
    thumb: '🥟',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    description: 'Golden flaky ajwain pastry stuffed with cumin-spiced potatoes and green peas, served with sweet saunth and mint chutney.'
  },
  {
    id: 'litti',
    name: 'Bihari Litti Chokha with Desi Ghee',
    category: 'Regional Specialty',
    thumb: '🫓',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
    description: 'Roasted wheat balls stuffed with sattu (roasted gram flour) and kalonji, dipped in pure ghee and served with baingan chokha.'
  }
];

export default function FoodScanner() {
  const [selectedPreset, setSelectedPreset] = useState(INDIAN_PRESETS[0]);
  const [customFile, setCustomFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(INDIAN_PRESETS[0].image);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // Portion adjustment state
  const [showPortionModal, setShowPortionModal] = useState(false);
  const [portions, setPortions] = useState({
    rotis_count: 2,
    has_ghee_on_roti: true,
    dal_katoris: 1.0,
    rice_bowls: 1.0,
    sabzi_katoris: 1.0,
    curd_chaas_glasses: 1.0,
    extra_ghee_tsp: 0
  });
  const [portionNutrition, setPortionNutrition] = useState(null);

  // User Confirmation state (when model confidence is uncertain)
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState(null);

  const handleScan = async (dishName = selectedPreset.name, file = null) => {
    setAnalyzing(true);
    setNeedsConfirmation(false);
    setSelectedAlternative(null);
    try {
      const data = await recognizeFood(dishName, file);
      setResult(data);
      if (data.needs_confirmation) {
        setNeedsConfirmation(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    handleScan(selectedPreset.name);
  }, []);

  const handlePresetSelect = (dish) => {
    setSelectedPreset(dish);
    setCustomFile(null);
    setPreviewUrl(dish.image);
    handleScan(dish.name, null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      handleScan(file.name.replace(/\.[^/.]+$/, ''), file);
    }
  };

  const handleConfirmDish = (dishName) => {
    setNeedsConfirmation(false);
    handleScan(dishName, null);
  };

  const calculateCustomPortions = async () => {
    try {
      const data = await estimateIndianPortions(portions);
      setPortionNutrition(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    calculateCustomPortions();
  }, [portions]);

  const dish = result?.dish;
  const isConfidenceHigh = (dish?.confidence || 0) >= 0.85;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-amber">Desi Vision Intelligence</span>
            <span className="badge badge-emerald">ViT-Food-India-1000</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Multimodal Indian Food Recognition & Portion Breakdown</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Identify authentic Indian dishes across regional cuisines with serving sizes in Indian units (Rotis, Katoris, Bowls, Thalis).
          </p>
        </div>

        {/* Quick Indian Sample Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {INDIAN_PRESETS.map((d) => (
            <button
              key={d.id}
              onClick={() => handlePresetSelect(d)}
              className={`btn ${selectedPreset.id === d.id && !customFile ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            >
              <span>{d.thumb}</span>
              <span>{d.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Banner if Confidence is Low */}
      {needsConfirmation && result?.candidate_dishes?.length > 0 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '0.92rem', fontWeight: 700 }}>
            <HelpCircle size={18} />
            <span>Uncertain Recognition ({Math.round((dish?.confidence || 0.65) * 100)}% Confidence) — Please Confirm Your Dish</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>
            Because many Indian curries and gravies share similar visual textures (e.g. dal tadka vs sambar vs kadhi), please confirm your intended dish for accurate nutrition:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setNeedsConfirmation(false)}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
            >
              ✓ Yes, It's {result.predicted_dish_name}
            </button>
            {result.candidate_dishes.map((c, i) => (
              <button
                key={i}
                onClick={() => handleConfirmDish(c.name)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
              >
                It's {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="responsive-grid-2">
        {/* Left Column: Image Preview with Camera / Scan Line */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '340px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: '#0a0f1d',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={previewUrl}
              alt="Indian food scan preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: analyzing ? 'brightness(0.7) contrast(1.1)' : 'none',
                transition: 'filter 0.3s'
              }}
            />

            {analyzing && <div className="scan-line" />}

            {/* Overlaid Confidence Badge */}
            {dish && !analyzing && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                backgroundColor: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(8px)',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${isConfidenceHigh ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                color: isConfidenceHigh ? '#34d399' : '#fbbf24',
                fontWeight: 600
              }}>
                <Sparkles size={14} />
                <span>{(dish.confidence * 100).toFixed(1)}% {isConfidenceHigh ? 'ViT High Confidence' : 'Moderate Match'}</span>
              </div>
            )}

            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              right: '1rem',
              backgroundColor: 'rgba(10, 16, 28, 0.90)',
              backdropFilter: 'blur(10px)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>
                  {dish?.name || selectedPreset.name}
                </h4>
                <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                  {dish?.regional_tag || selectedPreset.category}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedPreset.description}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label className="btn btn-secondary" style={{ flex: 1, minWidth: '180px', cursor: 'pointer', margin: 0 }}>
              <Upload size={16} />
              <span>Upload Custom Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>

            <button
              onClick={() => handleScan(selectedPreset.name, customFile)}
              disabled={analyzing}
              className="btn btn-primary"
              style={{ flex: 1, minWidth: '160px' }}
            >
              <Camera size={16} />
              <span>{analyzing ? 'Scanning Indian ViT...' : 'Rescan Dish'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Authentic Indian Nutritional Breakdown & Serving Units */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Approximate Nutrition & Serving Breakdown</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Calculated for Indian culinary standards</span>
            </div>
            {dish && (
              <span className="badge badge-emerald">
                Unit: {dish.serving_unit || `${dish.portion_g}g`}
              </span>
            )}
          </div>

          {/* 4 Macro Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 0.5rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Calories</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem' }}>
                {dish?.calories || '--'}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kcal (approx)</span>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 0.5rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Protein</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                {dish?.macronutrients?.protein || '--'}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>plant/dairy</span>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 0.5rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Carbs</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                {dish?.macronutrients?.carbohydrates || '--'}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>fiber: {dish?.macronutrients?.dietary_fiber}</span>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 0.5rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Fats / Ghee</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.2rem' }}>
                {dish?.macronutrients?.fats || '--'}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>tadka/curd</span>
            </div>
          </div>

          {/* Oil & Ghee Impact Callout */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <Flame size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
              <strong>Oil / Ghee Impact Note:</strong> {dish?.oil_ghee_variation_note || 'Every 1 tsp of extra desi ghee adds +45 kcal and 5g of fat.'}
            </div>
          </div>

          {/* Common Ingredients Chips */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
              Common Authentic Ingredients
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {(dish?.common_ingredients || ['Wheat Flour', 'Toor Dal', 'Mustard Seeds', 'Turmeric', 'Cumin']).map((ing, i) => (
                <span key={i} className="tag-chip" style={{ fontSize: '0.78rem' }}>
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Portion Customizer Expandable Button */}
          <div style={{
            background: 'rgba(10, 16, 28, 0.65)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={16} color="#34d399" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                  Interactive Indian Portion Customizer
                </span>
              </div>
              <button
                onClick={() => setShowPortionModal(!showPortionModal)}
                className="btn btn-outline-emerald"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
              >
                {showPortionModal ? 'Hide Portion Sliders' : 'Adjust My Portions'}
              </button>
            </div>

            {/* Expanded Portion Sliders */}
            {showPortionModal && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {/* Rotis */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Chapatis / Rotis</span>
                      <span style={{ fontWeight: 700, color: '#34d399' }}>{portions.rotis_count} phulkas</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      value={portions.rotis_count}
                      onChange={(e) => setPortions({ ...portions, rotis_count: parseInt(e.target.value) })}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={portions.has_ghee_on_roti}
                        onChange={(e) => setPortions({ ...portions, has_ghee_on_roti: e.target.checked })}
                      />
                      <span>Brushed with Ghee (+35 kcal/roti)</span>
                    </label>
                  </div>

                  {/* Dal */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Dal (Toor/Moong)</span>
                      <span style={{ fontWeight: 700, color: '#38bdf8' }}>{portions.dal_katoris} katori ({Math.round(portions.dal_katoris * 150)}ml)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.5"
                      value={portions.dal_katoris}
                      onChange={(e) => setPortions({ ...portions, dal_katoris: parseFloat(e.target.value) })}
                    />
                  </div>

                  {/* Rice */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Steamed Rice</span>
                      <span style={{ fontWeight: 700, color: '#fbbf24' }}>{portions.rice_bowls} bowl ({Math.round(portions.rice_bowls * 150)}g)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.5"
                      value={portions.rice_bowls}
                      onChange={(e) => setPortions({ ...portions, rice_bowls: parseFloat(e.target.value) })}
                    />
                  </div>

                  {/* Curd / Chaas */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Spiced Chaas / Dahi</span>
                      <span style={{ fontWeight: 700, color: '#a78bfa' }}>{portions.curd_chaas_glasses} glass</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.5"
                      value={portions.curd_chaas_glasses}
                      onChange={(e) => setPortions({ ...portions, curd_chaas_glasses: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Recalculated Nutrition Summary */}
                {portionNutrition && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Adjusted Meal Nutrition:</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                        {portionNutrition.approximate_nutrition.total_calories} kcal
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <span style={{ color: '#34d399' }}>Protein: {portionNutrition.approximate_nutrition.protein_g}g</span>
                      <span style={{ color: '#38bdf8' }}>Carbs: {portionNutrition.approximate_nutrition.carbs_g}g</span>
                      <span style={{ color: '#a78bfa' }}>Fats: {portionNutrition.approximate_nutrition.fats_g}g</span>
                      <span style={{ color: '#fbbf24' }}>Fiber: {portionNutrition.approximate_nutrition.fiber_g}g</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verification Disclaimer */}
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            lineHeight: 1.45,
            paddingTop: '0.4rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <strong>Important Estimation Notice:</strong> Nutritional figures represent estimated culinary averages based on standard Indian recipes. Values will naturally vary with cooking oil quantity, tadka ghee, flour milling thickness, and specific dal varieties.
          </div>
        </div>
      </div>
    </div>
  );
}
