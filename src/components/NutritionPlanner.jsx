import React, { useState, useEffect } from 'react';
import { Target, Activity, Flame, Droplets, Utensils, Award, Sparkles, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { generateNutritionPlan } from '../api';

export default function NutritionPlanner() {
  const [profile, setProfile] = useState({
    age: 28,
    gender: 'female',
    weight_kg: 64,
    height_cm: 165,
    activity_level: 'moderate',
    dietary_preference: 'vegetarian',
    regional_cuisine: 'north_indian',
    goal: 'balanced',
    meals_per_day: 4
  });

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const calculatePlan = async () => {
    setLoading(true);
    try {
      const data = await generateNutritionPlan(profile);
      setPlan(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculatePlan();
  }, [
    profile.age,
    profile.gender,
    profile.weight_kg,
    profile.height_cm,
    profile.activity_level,
    profile.dietary_preference,
    profile.regional_cuisine,
    profile.goal,
    profile.meals_per_day
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-amber">Desi Thali & Macro Intelligence</span>
            <span className="badge badge-emerald">Mifflin-St Jeor Indianized</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Personalized Indian Meal Planner & Thali Architect</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Tailored nutrition algorithms supporting Lacto-Vegetarian, Vegan, Jain, Eggitarian, and Regional Indian cuisines.
          </p>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div style={{
        background: 'rgba(6, 182, 212, 0.08)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.15rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <Info size={18} color="#22d3ee" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.80rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
          <strong>General Wellness Notice:</strong> Calorie and macronutrient values are approximate estimations designed for general dietary awareness.
          This tool does not prescribe clinical medical diets. Individuals with clinical conditions (such as diabetes, hypertension, or chronic kidney disease) should consult a registered dietitian.
        </div>
      </div>

      <div className="responsive-grid-2">
        {/* Left Column: Biometric Profile Controls */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Dietary Identity & Preferences</h3>

          {/* Dietary Preference & Regional Cuisine */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Dietary Lifestyle</label>
              <select
                className="select-field"
                value={profile.dietary_preference}
                onChange={(e) => setProfile({ ...profile, dietary_preference: e.target.value })}
              >
                <option value="vegetarian">Lacto-Vegetarian (Standard)</option>
                <option value="jain">Jain (No Onion, Garlic, Roots)</option>
                <option value="vegan">100% Vegan (Plant-Based)</option>
                <option value="eggitarian">Eggitarian</option>
                <option value="non_vegetarian">Non-Vegetarian</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Regional Cuisine</label>
              <select
                className="select-field"
                value={profile.regional_cuisine}
                onChange={(e) => setProfile({ ...profile, regional_cuisine: e.target.value })}
              >
                <option value="north_indian">North Indian (Roti-Dal-Sabzi)</option>
                <option value="south_indian">South Indian (Idli-Rice-Sambar)</option>
                <option value="west_indian">West Indian (Gujarati / Maharashtrian)</option>
                <option value="east_indian">East Indian (Rice & Lentils)</option>
              </select>
            </div>
          </div>

          {/* Primary Goal & Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Primary Goal</label>
              <select
                className="select-field"
                value={profile.goal}
                onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
              >
                <option value="balanced">Balanced Wellness</option>
                <option value="weight_loss">Weight Management (-400 kcal)</option>
                <option value="high_protein">High-Protein Vegetarian (+150 kcal)</option>
                <option value="diabetic_control">Glycemic & Diabetic Control</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Gender</label>
              <select
                className="select-field"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>

          {/* Daily Activity Level */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Daily Activity Level</label>
            <select
              className="select-field"
              value={profile.activity_level}
              onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })}
            >
              <option value="sedentary">Sedentary (Desk work, minimal exercise)</option>
              <option value="moderate">Moderate (Brisk walk / Yoga 3-4 days/week)</option>
              <option value="active">Active (Gym / Running 5-6 days/week)</option>
              <option value="very_active">Very Active (Intense sports / physical labor)</option>
            </select>
          </div>

          {/* Weight Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Body Weight</span>
              <span style={{ fontWeight: 700, color: '#34d399' }}>{profile.weight_kg} kg</span>
            </div>
            <input
              type="range"
              min="40"
              max="130"
              value={profile.weight_kg}
              onChange={(e) => setProfile({ ...profile, weight_kg: parseFloat(e.target.value) })}
            />
          </div>

          {/* Height Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Height</span>
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>{profile.height_cm} cm</span>
            </div>
            <input
              type="range"
              min="135"
              max="205"
              value={profile.height_cm}
              onChange={(e) => setProfile({ ...profile, height_cm: parseInt(e.target.value) })}
            />
          </div>

          {/* Age Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Age</span>
              <span style={{ fontWeight: 700, color: '#fbbf24' }}>{profile.age} years</span>
            </div>
            <input
              type="range"
              min="16"
              max="80"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
            />
          </div>
        </div>

        {/* Right Column: Calculated Targets & Indian Meal Itinerary */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Target Daily Calorie & Chaas Hydration Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Approximate Daily Target Energy
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                {plan?.user_profile?.target_daily_calories || 2050} <span style={{ fontSize: '1rem', color: '#fbbf24', fontWeight: 600 }}>kcal/day</span>
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                BMR: {plan?.user_profile?.bmr || 1520} kcal | TDEE: {plan?.user_profile?.tdee || 2200} kcal
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(6, 182, 212, 0.15)',
              padding: '0.6rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              <Droplets size={22} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                  {plan?.target_macros?.water_intake_liters || 2.6} L
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Water / Chaas Daily</span>
              </div>
            </div>
          </div>

          {/* Macro Split Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>PROTEIN</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>{plan?.target_macros?.protein_g || 85}g</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>CARBS</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{plan?.target_macros?.carbs_g || 275}g</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>FATS / GHEE</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa' }}>{plan?.target_macros?.fats_g || 52}g</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>FIBER</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>{plan?.target_macros?.fiber_target_g || 35}g</div>
            </div>
          </div>

          {/* 4-Meal Indian Daily Curation Timeline */}
          <div>
            <h4 style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              Daily 4-Meal Desi Curation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {(plan?.sample_daily_curation || []).map((meal, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.95rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Utensils size={16} color="#fbbf24" />
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 600 }}>{meal.meal}</div>
                      <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 600 }}>{meal.dish}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Unit: {meal.serving_unit}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fbbf24' }}>{meal.calories} kcal</div>
                    <span style={{ fontSize: '0.72rem', color: '#34d399' }}>{meal.protein} protein</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
