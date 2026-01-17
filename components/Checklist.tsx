import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { CheckCircle2, Circle, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

// Enhanced initial checklist based on user persona
const INITIAL_CHECKLIST: ChecklistItem[] = [
  // App & Guide
  { id: 'g1', text: '下载 Naver Map (注册账号并收藏地点)', checked: false, category: 'App & Guide' },
  { id: 'g2', text: '下载 Kakao T (以防需要打车)', checked: false, category: 'App & Guide' },
  { id: 'g3', text: '下载 Papago (实时翻译神器)', checked: false, category: 'App & Guide' },
  { id: 'g4', text: 'Subway Korea (查看地铁线路)', checked: false, category: 'App & Guide' },
  
  // Documents
  { id: 'c1', text: '护照 & K-ETA (打印备份)', checked: false, category: 'Document' },
  { id: 'c2', text: '演唱会门票 (确认电子/纸质)', checked: false, category: 'Document' },
  { id: 'c3', text: 'Wowpass / T-Money 卡', checked: false, category: 'Document' },
  { id: 'c4', text: '现金 (小吃摊只收现金)', checked: false, category: 'Document' },
  
  // Electronics
  { id: 'c5', text: '转换插头 (德标两孔)', checked: false, category: 'Electronics' },
  { id: 'c6', text: '充电宝 (看演唱会必备大容量)', checked: false, category: 'Electronics' },
  { id: 'c7', text: '应援棒 (记得换新电池)', checked: false, category: 'Electronics' },
  
  // Clothing
  { id: 'c8', text: '长款羽绒服 (抗冻)', checked: false, category: 'Clothing' },
  { id: 'c10', text: '好走的鞋 (特种兵日行3万步)', checked: false, category: 'Clothing' },
];

export const Checklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('seoul_checklist');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ChecklistItem['category']>('Document');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Persist to local storage
  React.useEffect(() => {
    localStorage.setItem('seoul_checklist', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const deleteItem = (id: string) => {
    if (window.confirm('确认删除此物品？')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditValue(text);
  };

  const saveEdit = (id: string) => {
    if (editValue.trim()) {
      setItems(items.map(item => item.id === id ? { ...item, text: editValue } : item));
      setEditingId(null);
    }
  };

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newItemText,
        checked: false,
        category: newItemCategory
      };
      setItems([...items, newItem]);
      setNewItemText('');
      setIsAdding(false);
    }
  };

  const categories = Array.from(new Set(items.map(i => i.category)));
  const progress = Math.round((items.filter(i => i.checked).length / items.length) * 100) || 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-2">
          <h2 className="font-bold text-slate-800">准备进度</h2>
          <span className="text-2xl font-black text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Add Button */}
      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold border border-blue-100 border-dashed hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          添加物品
        </button>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <input 
            autoFocus
            type="text" 
            placeholder="输入物品名称..."
            className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Document', 'Clothing', 'Electronics', 'Toiletries', 'App & Guide'].map(cat => (
              <button
                key={cat}
                onClick={() => setNewItemCategory(cat as any)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap border ${
                  newItemCategory === cat 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-slate-500 border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium">确认</button>
            <button onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-medium">取消</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat} className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-1">{cat}</h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
              {items.filter(i => i.category === cat).map(item => (
                <div
                  key={item.id}
                  className="w-full flex items-center justify-between p-4 group hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button 
                      onClick={() => toggleItem(item.id)}
                      className={`flex-shrink-0 transition-colors ${item.checked ? 'text-blue-500' : 'text-slate-300'}`}
                    >
                      {item.checked ? <CheckCircle2 size={24} className="fill-blue-50" /> : <Circle size={24} />}
                    </button>
                    
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 p-1 text-sm border-b border-blue-400 focus:outline-none bg-transparent"
                        />
                        <button onClick={() => saveEdit(item.id)}><Check size={16} className="text-green-600"/></button>
                        <button onClick={() => setEditingId(null)}><X size={16} className="text-slate-400"/></button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => toggleItem(item.id)}
                        className={`flex-1 font-medium transition-all truncate cursor-pointer ${item.checked ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}`}
                      >
                        {item.text}
                      </span>
                    )}
                  </div>

                  {editingId !== item.id && (
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                       <button onClick={() => startEdit(item.id, item.text)} className="text-slate-300 hover:text-blue-600"><Edit2 size={16} /></button>
                       <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};