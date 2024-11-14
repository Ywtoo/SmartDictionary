export const getConfig = async () => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['apiKey', 'idioma'], (result) => {
            resolve({
                apiKey: result.apiKey || 'Null',
                idioma: result.idioma || 'English'
            });
        });
    });
};
  export const setConfig = async (config) => {
    console.log('Saving config:', config); // Verificar os dados antes de salvar
    return new Promise((resolve) => {
        chrome.storage.sync.set(config, () => {
            console.log('Config saved');
            resolve();
        });
    });
};
