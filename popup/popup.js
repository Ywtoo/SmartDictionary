import { getConfig, setConfig } from '../src/config.js';

document.getElementById('save').addEventListener('click', () => {
    const apiKey = document.getElementById('api-key').value;
    const idioma = document.getElementById('idioma').value;
    setConfig({ apiKey, idioma });
    window.close();
});

getConfig().then((config) => {
    console.log('Loaded config:', config); // Verificar o que está sendo carregado
    document.getElementById('api-key').value = config.apiKey;
    document.getElementById('idioma').value = config.idioma;
});

