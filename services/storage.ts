export const STORAGE_KEYS = {
    API_KEY: 'trip_genius_api_key_v1',
    BASE_URL: 'trip_genius_base_url_v1',
    MODEL_NAME: 'trip_genius_model_name_v1',
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
    // Remove all trailing slashes and '/v1' suffixes to normalize
    let cleanUrl = url.trim().replace(/\/+$/, '');
    if (cleanUrl.endsWith('/v1')) {
        cleanUrl = cleanUrl.slice(0, -3);
    }
    localStorage.setItem(STORAGE_KEYS.BASE_URL, cleanUrl);
};

export const getBaseUrl = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.BASE_URL);
};

export const saveModelName = (modelName: string) => {
    if (!modelName) {
        localStorage.removeItem(STORAGE_KEYS.MODEL_NAME);
        return;
    }
    localStorage.setItem(STORAGE_KEYS.MODEL_NAME, modelName.trim());
};

export const getModelName = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.MODEL_NAME);
};

export const clearSettings = () => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.BASE_URL);
    localStorage.removeItem(STORAGE_KEYS.MODEL_NAME);
};
