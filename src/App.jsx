import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FoodScanner from './components/FoodScanner';
import FreshnessLab from './components/FreshnessLab';
import HygieneAudit from './components/HygieneAudit';
import CookingCompanion from './components/CookingCompanion';
import SubstitutionHub from './components/SubstitutionHub';
import NutritionPlanner from './components/NutritionPlanner';
import ZeroWastePantry from './components/ZeroWastePantry';
import ChefVerseChat from './components/ChefVerseChat';
import Footer from './components/Footer';
import { checkBackendStatus } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [backendStatus, setBackendStatus] = useState(null);

  const fetchStatus = async () => {
    const status = await checkBackendStatus();
    setBackendStatus(status);
  };

  useEffect(() => {
    fetchStatus();
    // Periodic status poll every 15 seconds
    const timer = setInterval(fetchStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* Top Header with live status and pill navigation */}
      <Header
        backendStatus={backendStatus}
        onRefreshStatus={fetchStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Tab Viewport */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeTab === 'scanner' && <FoodScanner />}
        {activeTab === 'freshness' && <FreshnessLab />}
        {activeTab === 'hygiene' && <HygieneAudit />}
        {activeTab === 'cooking' && <CookingCompanion />}
        {activeTab === 'substitutions' && <SubstitutionHub />}
        {activeTab === 'nutrition' && <NutritionPlanner />}
        {activeTab === 'pantry' && <ZeroWastePantry />}
      </main>

      {/* Floating ChefVerse AI Culinary Copilot */}
      <ChefVerseChat />

      {/* Footer */}
      <Footer />
    </div>
  );
}
