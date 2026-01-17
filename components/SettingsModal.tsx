import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Eraser, Globe } from 'lucide-react';
import { saveApiKey, getApiKey, saveBaseUrl, getBaseUrl, clearSettings } from '../services/storage';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [savedKey, setSavedKey] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSavedKey(getApiKey());
            setBaseUrl(getBaseUrl() || '');
        }
    }, [isOpen]);

    const handleSave = () => {
        if (apiKey.trim()) {
            saveApiKey(apiKey);
            setSavedKey(apiKey);
        }
        // Always save/update base URL (empty string means clear)
        saveBaseUrl(baseUrl);

        if (apiKey.trim() || savedKey) {
            onClose();
        }
    };

    const handleClear = () => {
        clearSettings();
        setSavedKey(null);
        setApiKey('');
        setBaseUrl('');
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

                <div className="p-6 space-y-5">
                    {/* API Key Input */}
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
                    </div>

                    {/* Base URL Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                            <Globe size={14} />
                            代理/转发地址 (选填)
                        </label>
                        <input
                            type="text"
                            placeholder="例如: https://api.openai-proxy.com"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-mono text-slate-600 placeholder:text-slate-300"
                        />
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            如果你使用公益站或中转 API，请在此填入 Base URL。官方接口请留空。
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
                            没有 Key? 点击获取官方免费 Key
                        </a>
                    </div>

                    {savedKey && (
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            当前 Key 已激活 (结尾: ...{savedKey.slice(-4)})
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
                            disabled={!apiKey.trim() && !savedKey}
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
