import React, { useState, useRef, useEffect } from 'react';
import { DayPlan, ItineraryProps } from '../types';
import { MapPin, Clock, Trash2, Edit2, ChevronDown, ChevronUp, Calendar, CloudSun, Thermometer, Shirt, Check, X, TrainFront, RefreshCw } from 'lucide-react';

export const Itinerary: React.FC<ItineraryProps> = ({ plans, onUpdatePlans, onReset }) => {
  const [expandedDay, setExpandedDay] = useState<string | null>('d1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleDelete = (dayId: string, itemId: string) => {
    if (window.confirm('确定要删除这个行程吗？')) {
      const newPlans = plans.map(day => {
        if (day.id === dayId) {
          return { ...day, items: day.items.filter(item => item.id !== itemId) };
        }
        return day;
      });
      onUpdatePlans(newPlans);
    }
  };

  const startEdit = (itemId: string, currentActivity: string) => {
    setEditingId(itemId);
    setEditValue(currentActivity);
  };

  const saveEdit = (dayId: string, itemId: string) => {
    if (!editValue.trim()) return;
    
    const newPlans = plans.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          items: day.items.map(i => 
            i.id === itemId ? { ...i, activity: editValue } : i
          )
        };
      }
      return day;
    });
    onUpdatePlans(newPlans);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const toggleDay = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-end mb-2">
         <button 
           onClick={onReset}
           className="text-xs font-medium text-slate-500 flex items-center gap-1 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100"
         >
           <RefreshCw size={12} />
           重新规划行程
         </button>
      </div>

      {plans.map((day) => (
        <div key={day.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
          <button 
            onClick={() => toggleDay(day.id)}
            className={`w-full flex items-center justify-between p-4 transition-colors ${
              expandedDay === day.id 
                ? 'bg-blue-50/50' 
                : 'bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 shadow-sm transition-colors ${
                expandedDay === day.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <Calendar size={20} />
              </div>
              <div className="text-left">
                <h3 className={`font-bold ${expandedDay === day.id ? 'text-blue-900' : 'text-slate-800'}`}>
                  {day.date}
                </h3>
                <p className="text-xs text-blue-600 font-medium">{day.dayOfWeek}</p>
              </div>
            </div>
            {expandedDay === day.id ? <ChevronUp className="text-blue-400" /> : <ChevronDown className="text-slate-300" />}
          </button>

          {expandedDay === day.id && (
            <div className="p-4 space-y-4">
              {/* Weather & Outfit Widget */}
              {day.weather && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100/60 shadow-sm mb-4">
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-blue-100/50">
                    <div className="flex items-center gap-2">
                      <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-400">
                         <CloudSun size={18} />
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{day.weather.condition}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md text-slate-600 font-mono text-sm font-semibold">
                      <Thermometer size={14} className="text-rose-400"/>
                      {day.weather.temp}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-600 text-xs sm:text-sm">
                    <div className="mt-0.5 bg-indigo-100 text-indigo-600 p-1 rounded">
                      <Shirt size={14} />
                    </div>
                    <span className="leading-relaxed font-medium mt-0.5">{day.weather.outfit}</span>
                  </div>
                </div>
              )}

              {day.items.length === 0 ? (
                <p className="text-slate-400 text-center text-sm py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  今天暂无行程，好好休息 😴
                </p>
              ) : (
                day.items.map((item) => (
                  <div key={item.id} className="relative pl-6 pb-2 border-l-2 border-blue-100 last:border-0 last:pb-0">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    </div>

                    <div className="flex justify-between items-start group rounded-lg p-2 -ml-2 hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                          <Clock size={12} />
                          <span>{item.time}</span>
                        </div>
                        
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2 mt-1 mb-2">
                            <input
                              ref={inputRef}
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(day.id, item.id);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-full p-2 text-sm border-2 border-blue-400 rounded-md focus:outline-none shadow-sm"
                            />
                            <button onClick={() => saveEdit(day.id, item.id)} className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200">
                              <Check size={16} />
                            </button>
                            <button onClick={cancelEdit} className="p-2 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200">
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h4 
                              onClick={() => startEdit(item.id, item.activity)}
                              className="font-bold text-slate-800 text-sm sm:text-base mb-1 cursor-text hover:text-blue-700 transition-colors truncate"
                            >
                              {item.activity}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                              <MapPin size={12} />
                              <span className="truncate">{item.location}</span>
                            </div>

                            {/* Transport Badge */}
                            {item.transport && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md mb-2 w-fit">
                                <TrainFront size={12} className="text-slate-500" />
                                <span>{item.transport}</span>
                              </div>
                            )}

                            {/* Notes */}
                            {item.notes && (
                              <div className="text-xs text-amber-700 bg-amber-50/80 px-2 py-1.5 rounded border border-amber-100/50 inline-block max-w-full leading-relaxed">
                                <span className="mr-1">💡</span>
                                {item.notes}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {editingId !== item.id && (
                        <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEdit(item.id, item.activity)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(day.id, item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};