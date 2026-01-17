import React, { useState } from 'react';
import { TripProfile } from '../types';
import { Sparkles, Plane, MapPin, Coffee, Heart, Calendar, Globe, ArrowLeft } from 'lucide-react';

interface TripPlannerFormProps {
  onGenerate: (profile: TripProfile) => void;
  isLoading: boolean;
  onCancel?: () => void;
}

export const TripPlannerForm: React.FC<TripPlannerFormProps> = ({ onGenerate, isLoading, onCancel }) => {
  // Loading Text Carousel
  const [loadingText, setLoadingText] = useState("正在启动 AI 引擎...");
  
  React.useEffect(() => {
    if (isLoading) {
      const messages = [
        "正在联络当地向导...",
        "正在分析历史天气数据...",
        "正在寻找隐秘美食...",
        "正在规划最佳路线...",
        "正在整理穿搭建议...",
        "马上就好..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(messages[i % messages.length]);
        i++;
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const [profile, setProfile] = useState<TripProfile>({
    destination: '',
    dates: '',
    hotel: '',
    travelerType: '',
    interests: '',
    mustVisit: '',
    foodPrefs: ''
  });

  const fillDemoData = () => {
    setProfile({
      destination: '首尔',
      dates: '1月22日 - 1月27日',
      hotel: '明洞 L7 酒店',
      travelerType: 'Chill Life & 大学生党',
      interests: '追星 (SM/HYBE), 氛围感咖啡厅, 逛街',
      mustVisit: '首尔林, 汉南洞, 弘大',
      foodPrefs: '薄荷巧克力!! 烤肉, 炸鸡'
    });
  };
  
  const fillDemoDataJapan = () => {
    setProfile({
      destination: '东京',
      dates: '3月15日 - 3月20日',
      hotel: '新宿王子酒店',
      travelerType: '二次元 & 摄影',
      interests: '动漫, 胶片摄影, 古着店',
      mustVisit: '秋叶原, 下北泽, 镰仓',
      foodPrefs: '拉面, 居酒屋, 抹茶甜点'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.destination) {
      alert("请至少输入目的地！");
      return;
    }
    onGenerate(profile);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
            <Plane size={40} className="text-blue-600" />
          </div>
          <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">{loadingText}</h3>
          <p className="text-slate-500 text-sm mt-2">AI 正在为你定制专属【{profile.destination}】行程</p>
        </div>
        <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite] w-1/3 rounded-full"></div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 max-w-lg mx-auto mt-4 relative">
      {onCancel && (
        <button 
          onClick={onCancel}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          title="返回行程"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <div className="text-center mb-6 pt-2">
        <h2 className="text-2xl font-black text-slate-800">Trip Genius ✨</h2>
        <p className="text-slate-500 mt-1 text-sm">输入你想去的地方，剩下的交给我。</p>
        <div className="flex gap-2 justify-center mt-3">
            <button type="button" onClick={fillDemoData} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded hover:bg-slate-200 transition-colors">
               试一试: 首尔 🇰🇷
            </button>
            <button type="button" onClick={fillDemoDataJapan} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded hover:bg-slate-200 transition-colors">
               试一试: 东京 🇯🇵
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Destination */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Globe size={16} className="text-indigo-500"/> 目的地
          </label>
          <input
            type="text"
            required
            value={profile.destination}
            onChange={(e) => setProfile({...profile, destination: e.target.value})}
            placeholder="例：首尔、大阪、伦敦..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base font-semibold"
          />
        </div>

        {/* Dates */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Calendar size={16} className="text-blue-500"/> 时间
          </label>
          <input
            type="text"
            required
            value={profile.dates}
            onChange={(e) => setProfile({...profile, dates: e.target.value})}
            placeholder="例：5天4晚，或者具体日期"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
        </div>

        {/* Hotel */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <MapPin size={16} className="text-blue-500"/> 住宿位置 (可选)
          </label>
          <input
            type="text"
            value={profile.hotel}
            onChange={(e) => setProfile({...profile, hotel: e.target.value})}
            placeholder="例：新宿站附近 / 还没定"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
        </div>

        {/* Traveler Type */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Heart size={16} className="text-rose-500"/> 旅行风格
          </label>
          <input
            type="text"
            value={profile.travelerType}
            onChange={(e) => setProfile({...profile, travelerType: e.target.value})}
            placeholder="例：特种兵 / 佛系 / 穷游"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
          />
        </div>

        {/* Food & Interests */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Sparkles size={16} className="text-purple-500"/> 兴趣 & 美食
          </label>
          <textarea
            rows={3}
            value={profile.interests}
            onChange={(e) => setProfile({...profile, interests: e.target.value})}
            placeholder="想去哪？想吃啥？(例：想看海，必须吃一次顶级寿司，喜欢逛古着店)"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-black text-white font-bold py-4 rounded-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="animate-pulse" />
          生成行程
        </button>
      </form>
    </div>
  );
};