const CONFIG_PADRAO = {
    apiKey: '',
    idioma: 'English',
    testingMode: false,
};

export const getConfig = async () => {
    const result = await chrome.storage.sync.get(Object.keys(CONFIG_PADRAO));
    return { ...CONFIG_PADRAO, ...result };
};

export const setConfig = async (config) => {
    await chrome.storage.sync.set(config);
    console.log('Config saved');
};