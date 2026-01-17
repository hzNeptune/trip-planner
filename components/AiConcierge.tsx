import React, { useState } from 'react';
import { getFoodRecommendations, getActivityRecommendations, translateToLocal } from '../services/geminiService';
import { FoodRecommendation, ActivityRecommendation, TranslationResult } from '../types';
import { Search, Utensils, MessageCircle, Sparkles, Volume2, Map, Camera } from 'lucide-react';

enum AiMode {
  TRANSLATE = 'TRANSLATE',
  FOOD = 'FOOD',
  ACTIVITY = 'ACTIVITY'
}

interface AiConciergeProps {
  destination?: string;
}

export const AiConcierge: React.FC<AiConciergeProps> = ({ destination = "当地" }) => {
  const [mode, setMode] = useState<AiMode>(AiMode.FOOD);
  
  // Translation State
  const [transInput, setTransInput] = useState('');
  const [transResult, setTransResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Food Radar State
  const [location, setLocation] = useState('');
  const [craving, setCraving] = useState('');
  const [foodRecs, setFoodRecs] = useState<FoodRecommendation[]>([]);
  const [isSearchingFood, setIsSearchingFood] = useState(false);

  // Activity Scout State
  const [actLocation, setActLocation] = useState('');
  const [interest, setInterest] = useState('');
  const [actRecs, setActRecs] = useState<ActivityRecommendation[]>([]);
  const [isSearchingAct, setIsSearchingAct] = useState(false);

  const handleTranslate = async () => {
    if (!transInput.trim()) return;
    setIsTranslating(true);
    setTransResult(null);
    try {
      const result = await translateToLocal(transInput, destination);
      setTransResult(result);
    } catch (e) {
      alert("AI 正在学习当地语言，请稍后再试。");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFoodSearch = async () => {
    if (!location.trim() || !craving.trim()) return;
    setIsSearchingFood(true);
    setFoodRecs([]);
    try {
      const results = await getFoodRecommendations(location, craving, destination);
      setFoodRecs(results);
    } catch (e) {
      alert("AI 正在排队，暂时无法推荐。");
    } finally {
      setIsSearchingFood(false);
    }
  };

  const handleActivitySearch = async () => {
    if (!interest.trim()) return;
    setIsSearchingAct(true);
    setActRecs([]);
    try {
      const results = await getActivityRecommendations(actLocation, interest, destination);
      setActRecs(results);
    } catch (e) {
      alert("AI 正在看地图，稍后再试。");
    } finally {
      setIsSearchingAct(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center mb-2">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Location: {destination}</p>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <button
          onClick={() => setMode(AiMode.FOOD)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            mode === AiMode.FOOD ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Utensils size={16} />
          美食
        </button>
        <button
          onClick={() => setMode(AiMode.ACTIVITY)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            mode === AiMode.ACTIVITY ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Camera size={16} />
          玩乐
        </button>
        <button
          onClick={() => setMode(AiMode.TRANSLATE)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            mode === AiMode.TRANSLATE ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <MessageCircle size={16} />
          翻译
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 min-h-[400px]">
        
        {/* FOOD RADAR UI */}
        {mode === AiMode.FOOD && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-2xl">🕵️‍♂️</span> 美食雷达
              </h2>
              <p className="text-slate-500 text-sm">告诉我地点和想吃什么，不踩雷推荐。</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">地点</label>
                <input
                  type="text"
                  placeholder="例：市中心 / 某某街"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">想吃什么</label>
                <input
                  type="text"
                  placeholder="例：当地特色菜"
                  value={craving}
                  onChange={(e) => setCraving(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              onClick={handleFoodSearch}
              disabled={isSearchingFood}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSearchingFood ? (
                <>
                  <Sparkles className="animate-spin" size={20} />
                  搜寻中...
                </>
              ) : (
                <>
                  <Search size={20} />
                  开始探店
                </>
              )}
            </button>

            {/* Food Results */}
            <div className="space-y-4 pt-2">
              {foodRecs.map((rec, idx) => (
                <div key={idx} className="group relative bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{rec.name}</h3>
                      <p className="text-sm text-blue-600 font-medium font-sans">{rec.localName}</p>
                    </div>
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                      {rec.price}
                    </span>
                  </div>
                  <div className="relative pl-3 border-l-2 border-slate-200 mt-3">
                    <p className="text-slate-600 text-sm leading-relaxed italic">
                      "{rec.reason}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITY SCOUT UI */}
        {mode === AiMode.ACTIVITY && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-2xl">📸</span> 玩乐探秘
              </h2>
              <p className="text-slate-500 text-sm">告诉我你在哪，想玩什么。</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">地点 (可选)</label>
                <input
                  type="text"
                  placeholder="例：附近"
                  value={actLocation}
                  onChange={(e) => setActLocation(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">兴趣/取向</label>
                <input
                  type="text"
                  placeholder="例：拍照/历史/购物"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              onClick={handleActivitySearch}
              disabled={isSearchingAct}
              className="w-full bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSearchingAct ? (
                <>
                  <Sparkles className="animate-spin" size={20} />
                  寻找好去处...
                </>
              ) : (
                <>
                  <Map size={20} />
                  发现好玩
                </>
              )}
            </button>

            {/* Activity Results */}
            <div className="space-y-4 pt-2">
              {actRecs.map((rec, idx) => (
                <div key={idx} className="group relative bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{rec.name}</h3>
                    <p className="text-sm text-pink-600 font-medium font-sans">{rec.localName}</p>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">
                    {rec.description}
                  </p>
                  <div className="bg-pink-50 text-pink-800 text-xs p-2 rounded-lg">
                    💡 {rec.tips}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSLATE UI */}
        {mode === AiMode.TRANSLATE && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-2xl">🗣️</span> 地道翻译官
              </h2>
              <p className="text-slate-500 text-sm">输入中文，生成最大号的{destination}语言卡片。</p>
            </div>

            <div className="relative">
              <textarea
                value={transInput}
                onChange={(e) => setTransInput(e.target.value)}
                placeholder="请输入中文，例如：请问这个多少钱？"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !transInput}
                className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg shadow-md disabled:opacity-50 transition-all active:scale-95"
              >
                {isTranslating ? <Sparkles size={20} className="animate-spin" /> : <Volume2 size={20} />}
              </button>
            </div>

            {transResult && (
              <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-6 text-center shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider mb-2">Show this to local</p>
                <div className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight mb-4 break-keep">
                  {transResult.original}
                </div>
                <div className="inline-block bg-white px-3 py-1 rounded-full text-indigo-600 text-sm font-medium border border-indigo-100">
                  {transResult.pronunciation}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};