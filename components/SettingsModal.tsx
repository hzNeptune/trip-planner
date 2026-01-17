import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Eraser } from 'lucide-react';
import { saveApiKey, getApiKey, clearApiKey } from '../services/storage';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [savedKey, setSavedKey] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const current = getApiKey();
            setSavedKey(current);
            // Don't auto-fill input for security/privacy visible feel, or do masked? 
            // Let's just show status.
        }
    }, [isOpen]);

    const handleSave = () => {
        if (apiKey.trim()) {
            saveApiKey(apiKey);
            setSavedKey(apiKey);
            setApiKey(''); // clear input
            onClose(); // Auto close on save? Or just show success? Let's auto close for convenience.
        }
    };

    const handleClear = () => {
        clearApiKey();
        setSavedKey(null);
        setApiKey('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Key size={18} className="text-blue-600" />
                        API 设置
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 block">
                            Google Gemini API Key
                        </label>
                        <input
                            type="password"
                            placeholder="粘贴你的 API Key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                        />
                        <p className="text-xs text-slate-400">
                            Key 仅保存在你的浏览器本地，不会上传到服务器。
                        </p>
                    </div>

                    <div className="bg-blue-50/50 rounded-lg p-3 text-xs text-blue-700 flex gap-2 items-start">
                        <ExternalLink size={14} className="mt-0.5 shrink-0" />
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-800"
                        >
                            点击获取免费的 Gemini API Key
                        </a>
                    </div>

                    {savedKey && (
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            当前已设置 Key (结尾: ...{savedKey.slice(-4)})
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        {savedKey && (
                            <button
                                onClick={handleClear}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Eraser size={16} />
                                清除
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!apiKey.trim()}
                            className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                        >
                            保存设置
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
