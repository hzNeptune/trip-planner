import React, { useState, useEffect } from 'react';
import { Tab, DayPlan, TripProfile } from './types';
import { Itinerary } from './components/Itinerary';
import { AiConcierge } from './components/AiConcierge';
import { Checklist } from './components/Checklist';
import { TripPlannerForm } from './components/TripPlannerForm';
import { generateCustomItinerary } from './services/geminiService';
import { CalendarDays, Sparkles, CheckSquare, Plane, Settings } from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';
import { hasApiKey } from './services/storage';

const STORAGE_KEY = 'trip_genius_plans_v2';
const DESTINATION_KEY = 'trip_genius_destination_v2';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ITINERARY);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Destination State
  const [destination, setDestination] = useState<string>(() => {
    return localStorage.getItem(DESTINATION_KEY) || '首尔';
  });

  const [plans, setPlans] = useState<DayPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      return [];
    } catch (e) {
      return [];
    }
  });

  // Effect to toggle "Planning Mode" if there are no plans
  useEffect(() => {
    if (plans.length === 0) {
      setIsPlanning(true);
    }
  }, [plans]);

  // Persist State
  useEffect(() => {
    if (plans.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    }
    localStorage.setItem(DESTINATION_KEY, destination);
  }, [plans, destination]);

  const handleGenerateItinerary = async (profile: TripProfile) => {
    // Check for API Key first
    if (!hasApiKey() && !process.env.GEMINI_API_KEY) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    try {
      setDestination(profile.destination); // Update generic destination
      const generatedPlans = await generateCustomItinerary(profile);
      setPlans(generatedPlans);
      setIsPlanning(false);
      setActiveTab(Tab.ITINERARY);
    } catch (error: any) {
      console.error("Failed to generate itinerary", error);
      if (error?.message === 'MISSING_API_KEY') {
        setShowSettings(true);
      } else {
        // Show exact error for debugging
        alert(`生成行程失败: ${error.toString()}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPlanning = () => {
    setIsPlanning(true);
  };

  const handleCancelPlanning = () => {
    setIsPlanning(false);
  };

  // Dynamic Avatar Initial
  const avatarInitial = destination ? destination.charAt(0).toUpperCase() : 'T';

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-2xl">
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 px-6 py-4 transition-all">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Plane className="text-blue-600" size={24} />
              Trip <span className="text-blue-600">Genius</span>
            </h1>
            {!isPlanning && <p className="text-xs text-slate-500 font-medium mt-0.5">Exploring {destination} 🌍</p>}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Settings size={20} />
            </button>

            {/* Clickable Avatar to Reset/Edit (Only when NOT planning) */}
            {!isPlanning && (
              <button
                onClick={handleResetPlanning}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-black text-lg border-2 border-white shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title="重新规划"
              >
                {avatarInitial}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {isPlanning ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <TripPlannerForm
              onGenerate={handleGenerateItinerary}
              isLoading={isLoading}
              onCancel={plans.length > 0 ? handleCancelPlanning : undefined}
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === Tab.ITINERARY && (
              <Itinerary
                plans={plans}
                onUpdatePlans={setPlans}
                onReset={handleResetPlanning}
                destination={destination}
              />
            )}
            {activeTab === Tab.AI_CONCIERGE && <AiConcierge destination={destination} />}
            {activeTab === Tab.CHECKLIST && <Checklist />}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      {!isPlanning && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-6 py-3 pb-6 z-20 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setActiveTab(Tab.ITINERARY)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.ITINERARY ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <CalendarDays size={24} strokeWidth={activeTab === Tab.ITINERARY ? 2.5 : 2} />
            <span className="text-[10px] font-bold">行程表</span>
          </button>

          <button
            onClick={() => setActiveTab(Tab.AI_CONCIERGE)}
            className="relative -top-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all active:scale-95"
          >
            <Sparkles size={24} fill="white" />
          </button>

          <button
            onClick={() => setActiveTab(Tab.CHECKLIST)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.CHECKLIST ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <CheckSquare size={24} strokeWidth={activeTab === Tab.CHECKLIST ? 2.5 : 2} />
            <span className="text-[10px] font-bold">清单</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;