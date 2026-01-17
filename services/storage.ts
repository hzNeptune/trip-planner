export const STORAGE_KEYS = {
    API_KEY: 'trip_genius_api_key_v1',
};

export const saveApiKey = (key: string) => {
    if (!key) return;
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
};

export const getApiKey = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
};

export const clearApiKey = () => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
};

export const hasApiKey = (): boolean => {
    return !!getApiKey();
};
