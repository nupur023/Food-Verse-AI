import React, { useState, useEffect } from 'react';
import { ChefHat, Play, Pause, RotateCcw, CheckCircle, Flame, Sparkles, Clock, Users, Heart, Leaf, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { trackCookingStep } from '../api';

const INDIAN_RECIPES = [
  {
    id: 'poha',
    name: 'Authentic Indori Poha',
    regional: 'Madhya Pradesh / Central',
    baseServings: 4,
    prepTime: '10 mins',
    cookTime: '12 mins',
    caloriesPerServing: 260,
    proteinPerServing: '5.2g',
    steps: [
      {
        title: 'Rinsing & Softening Poha',
        durationSec: 120,
        instruction: 'Place thick poha in a colander and rinse gently under running water for 30 seconds. Drain completely. Toss with 1/2 tsp sugar and salt, then set aside to steam-soften without turning mushy.'
      },
      {
        title: 'Aromatic Sweet-Savory Tempering (Tadka)',
        durationSec: 180,
        instruction: 'Heat 1.5 tbsp oil in a kadai. Add 1 tsp mustard seeds (rai) and 1 tsp fennel seeds (saunf); let them splutter. Add peanuts and fry until golden. Add slit green chillies and chopped onions; saute until translucent.'
      },
      {
        title: 'Steaming with Turmeric',
        durationSec: 180,
        instruction: 'Sprinkle 1/2 tsp turmeric powder (haldi) into the tempering. Gently fold in the softened poha. Sprinkle 1 tbsp water, cover tightly with a lid, and steam on the lowest flame for 3 minutes.'
      },
      {
        title: 'Garnishing with Jeeravan & Sev',
        durationSec: 120,
        instruction: 'Transfer hot steaming poha to plates. Dust with generous authentic Jeeravan masala, top with crunchy Ratlami/Nylon sev, fresh chopped coriander, and squeeze fresh lemon juice.'
      }
    ],
    proTip: 'Indori poha is steamed, not fried! Adding fennel seeds (saunf) to the tempering is the secret sweet-aromatic signature.',
    healthierSuggestion: 'Reduce tadka oil to 1 tsp in a non-stick pan; substitute fried sev with roasted makhana crumbs or fresh pomegranate arils.',
    jainMod: 'Omit onions; add 1/4 tsp pure compounded asafoetida (hing) directly into the hot oil tempering.'
  },
  {
    id: 'paneer_butter_masala',
    name: 'Low-Oil Restaurant-Style Paneer Butter Masala',
    regional: 'North Indian',
    baseServings: 4,
    prepTime: '15 mins',
    cookTime: '20 mins',
    caloriesPerServing: 285,
    proteinPerServing: '14.5g',
    steps: [
      {
        title: 'Silk Puree Preparation',
        durationSec: 300,
        instruction: 'Boil 4 ripe tomatoes, ginger, and 15g soaked cashews (or melon seeds) in 1/2 cup water for 8 minutes. Puree smoothly in a blender and strain through a sieve for a velvet restaurant texture.'
      },
      {
        title: 'Whole Spice Blooming',
        durationSec: 120,
        instruction: 'Heat 1 tbsp butter/ghee in a heavy pan. Add a bay leaf, green cardamom, and 1.5 tsp Kashmiri Degi Mirch over low flame for 20 seconds to release natural ruby-red color.'
      },
      {
        title: 'Slow Simmering Gravy',
        durationSec: 360,
        instruction: 'Pour the pureed tomato-cashew sauce into the spiced butter. Simmer covered on medium-low heat for 10 minutes until tiny oil bubbles appear along the pan edges.'
      },
      {
        title: 'Paneer Infusion & Kasuri Methi',
        durationSec: 180,
        instruction: 'Stir in 3 tbsp low-fat milk, salt, and crushed kasuri methi. Slide in fresh soft paneer cubes. Simmer gently for 3 minutes so paneer stays soft and succulent.'
      }
    ],
    proTip: 'Never overcook or boil paneer for more than 3-4 minutes, or it becomes rubbery. Rub kasuri methi between your palms before adding.',
    healthierSuggestion: 'Blend half cashews and half boiled bottle gourd/carrots for rich velvety thickness with 60% less saturated fat.',
    jainMod: 'Ensure zero onion or garlic; add a pinch of green cardamom powder and extra kasuri methi for royal aroma.'
  },
  {
    id: 'khichdi',
    name: 'Healing Moong Dal & Vegetable Khichdi',
    regional: 'All-India Ayurvedic Classic',
    baseServings: 4,
    prepTime: '10 mins',
    cookTime: '18 mins',
    caloriesPerServing: 240,
    proteinPerServing: '11.8g',
    steps: [
      {
        title: 'Dal & Grain Soaking',
        durationSec: 120,
        instruction: 'Wash 1/2 cup split yellow moong dal and 1/2 cup rice together until water runs clear. Soak in warm water for 15 minutes to maximize digestibility.'
      },
      {
        title: 'Digestive Cumin-Hing Tadka',
        durationSec: 180,
        instruction: 'Heat 1 tbsp pure cow ghee in a pressure cooker. Add 1 tsp cumin seeds (jeera), 1/4 tsp pure hing, grated ginger, and slit green chillies.'
      },
      {
        title: 'Vegetable & Spice Saute',
        durationSec: 180,
        instruction: 'Add diced carrots, green peas, and tomatoes. Saute for 2 minutes with 1/2 tsp turmeric and rock salt.'
      },
      {
        title: 'Pressure Cooking to Comfort Perfection',
        durationSec: 300,
        instruction: 'Add drained rice-dal with 4 cups water (1:4 ratio for a soft creamy porridge texture). Pressure cook for 4 whistles on medium flame, let pressure release naturally, and serve warm with a spoon of ghee.'
      }
    ],
    proTip: 'Split yellow moong dal combined with rice creates a complete protein profile with all 9 essential amino acids in an easily digestible matrix.',
    healthierSuggestion: 'Substitute white rice with broken wheat (daliya) or foxtail millet for high fiber and low glycemic index.',
    jainMod: 'Naturally Jain compliant; ensure ginger is omitted if following strict root vegetable restrictions.'
  }
];

export default function CookingCompanion() {
  const [selectedRecipe, setSelectedRecipe] = useState(INDIAN_RECIPES[0]);
  const [servings, setServings] = useState(4);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(INDIAN_RECIPES[0].steps[0].durationSec);
  const [timerRunning, setTimerRunning] = useState(false);
  const [stepData, setStepData] = useState(null);
  const [finished, setFinished] = useState(false);
  const [isJain, setIsJain] = useState(false);
  const [healthierMode, setHealthierMode] = useState(false);

  const currentStep = selectedRecipe.steps[currentStepIdx] || selectedRecipe.steps[0];
  const scale = servings / selectedRecipe.baseServings;

  const updateStepInfo = async () => {
    try {
      const data = await trackCookingStep(
        selectedRecipe.name,
        currentStepIdx,
        selectedRecipe.steps.length,
        servings,
        healthierMode,
        isJain
      );
      setStepData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    updateStepInfo();
    setSecondsRemaining(currentStep.durationSec);
    setTimerRunning(false);
  }, [currentStepIdx, selectedRecipe, servings, isJain, healthierMode]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => sec - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && timerRunning) {
      setTimerRunning(false);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsRemaining]);

  const handleNextStep = () => {
    if (currentStepIdx < selectedRecipe.steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      setFinished(true);
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
  };

  const handleResetRecipe = () => {
    setCurrentStepIdx(0);
    setFinished(false);
    setSecondsRemaining(selectedRecipe.steps[0].durationSec);
    setTimerRunning(false);
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-amber">Smart Desi Rasoi Assistant</span>
            <span className="badge badge-emerald">Tadka & Dum Engine</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Step-by-Step Indian Cooking Companion</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Adaptive chef guidance for Indian tempering timings, spice blooming, portion scaling (2, 4, 6 persons), and healthier low-oil swaps.
          </p>
        </div>

        {/* Recipe Picker */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {INDIAN_RECIPES.map((rec) => (
            <button
              key={rec.id}
              onClick={() => {
                setSelectedRecipe(rec);
                setCurrentStepIdx(0);
                setFinished(false);
              }}
              className={`btn ${selectedRecipe.id === rec.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
            >
              <span>{rec.id === 'poha' ? '🌾' : rec.id === 'khichdi' ? '🍲' : '🧀'}</span>
              <span>{rec.name.split(' ')[0]} {rec.name.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Serving Scaler & Dietary Preference Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Serving Scaler */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Users size={18} color="#34d399" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Recipe Servings:</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[2, 4, 6].map((num) => (
              <button
                key={num}
                onClick={() => setServings(num)}
                className={`btn ${servings === num ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              >
                {num} People
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer', color: isJain ? '#fbbf24' : 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={isJain}
              onChange={(e) => setIsJain(e.target.checked)}
            />
            <span>Jain Friendly (No Onion/Garlic)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer', color: healthierMode ? '#34d399' : 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={healthierMode}
              onChange={(e) => setHealthierMode(e.target.checked)}
            />
            <span>Healthier / Low-Oil Mode</span>
          </label>
        </div>
      </div>

      <div className="responsive-grid-2">
        {/* Left Column: Interactive Stepper & Tadka Timer */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-amber">
              Step {currentStepIdx + 1} of {selectedRecipe.steps.length}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {selectedRecipe.regional}
            </span>
          </div>

          <h3 style={{ fontSize: '1.35rem', margin: 0, color: '#ffffff' }}>
            {currentStep.title}
          </h3>

          <p style={{ fontSize: '0.98rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
            {currentStep.instruction}
          </p>

          {/* Big Digital Cooking Timer */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              fontSize: '3.75rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              color: secondsRemaining === 0 ? '#34d399' : '#fbbf24',
              lineHeight: 1
            }}>
              {formatTime(secondsRemaining)}
            </div>

            {/* Timer controls */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.4rem' }}
              >
                {timerRunning ? <Pause size={18} /> : <Play size={18} />}
                <span>{timerRunning ? 'Pause Tadka Timer' : 'Start Tadka Timer'}</span>
              </button>

              <button
                onClick={() => {
                  setTimerRunning(false);
                  setSecondsRemaining(currentStep.durationSec);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1rem' }}
                title="Reset timer"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Stepper Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            {finished ? (
              <button
                onClick={handleResetRecipe}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.8rem' }}
              >
                <Sparkles size={18} />
                <span>Cook Dish Again</span>
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.8rem' }}
              >
                <CheckCircle size={18} />
                <span>{currentStepIdx === selectedRecipe.steps.length - 1 ? 'Finish Dish & Celebrate' : 'Next Cooking Step'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Pro Chef Secrets & Scaled Ingredients */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChefHat size={20} color="#fbbf24" />
            <span>Master Desi Chef Secrets</span>
          </h3>

          {/* Pro Chef Tip */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>
              <Flame size={16} />
              <span>Authentic Tadka & Spice Secret</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.90rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.45 }}>
              "{selectedRecipe.proTip}"
            </p>
          </div>

          {/* Healthier Preparation Tip */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>
              <Heart size={16} />
              <span>Healthier Low-Oil Adaptation</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
              {selectedRecipe.healthierSuggestion}
            </p>
          </div>

          {/* Scaled Ingredients Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
                Scaled Ingredients (For {servings} Servings)
              </h4>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                ~{selectedRecipe.caloriesPerServing} kcal/person
              </span>
            </div>

            <div style={{
              background: 'rgba(10, 16, 28, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              maxHeight: '180px',
              overflowY: 'auto'
            }}>
              {(stepData?.scaled_ingredients || []).map((ing, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '3px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <span style={{ color: 'var(--text-main)' }}>• {ing.name}</span>
                  <span style={{ fontWeight: 700, color: '#fbbf24' }}>{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
