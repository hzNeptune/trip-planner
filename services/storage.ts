export const STORAGE_KEYS = {
    API_KEY: 'trip_genius_api_key_v1',
    BASE_URL: 'trip_genius_base_url_v1',
};

export const saveApiKey = (key: string) => {
    if (!key) return;
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
};

export const getApiKey = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
};

export const saveBaseUrl = (url: string) => {
    if (!url) {
        localStorage.removeItem(STORAGE_KEYS.BASE_URL);
        return;
    }
    localStorage.setItem(STORAGE_KEYS.BASE_URL, url.trim().replace(/\/+$/, '')); // remove trailing slash
};

export const getBaseUrl = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.BASE_URL);
};

export const clearSettings = () => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.BASE_URL);
};

export const hasApiKey = (): boolean => {
    return !!getApiKey();
};
