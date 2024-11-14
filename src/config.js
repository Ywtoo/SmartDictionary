export const getConfig = async () => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['apiKey', 'idioma'], (result) => {
            resolve({
                apiKey: result.apiKey || 'Sem Api',
                idioma: result.idioma || 'Ta errado isso aqui'
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
