export const getConfig = async () => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['apiKey', 'idioma', 'testingMode'], (result) => { // Get testingMode
            resolve({
                apiKey: result.apiKey || '',
                idioma: result.idioma || 'English',
                testingMode: result.testingMode || false,
            });
        });
    });
};

export const setConfig = async (config) => {
    console.log('Saving config:', config);
    return new Promise((resolve) => {
        chrome.storage.sync.set(config, () => {
            console.log('Config saved');
            resolve();
        });
    });
};
