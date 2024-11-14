import { runPrompt } from './iaHandler.js';
import { getConfig } from './config.js';

export async function showDictionaryBalloon(event) {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    // Remove existing balloons
    document.querySelectorAll('.dictionary-balloon').forEach(b => b.remove());

    const config = await getConfig();
    const balloon = createBalloon(selectedText);
    
    try {
        const prompt = `Significado de "${selectedText}" e sinônimos em ${config.idioma}`;
        console.log(prompt)
        console.log(config.apiKey)
        const response = await runPrompt(prompt);
        balloon.textContent = response;
    } catch (error) {
        balloon.textContent = 'Erro ao buscar significado';
        balloon.style.backgroundColor = '#ffebee';
    }
}

function createBalloon(text) {
    const balloon = document.createElement('div');
    balloon.className = 'dictionary-balloon';
    balloon.textContent = 'Carregando...';
    
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    balloon.style.position = 'fixed';
    balloon.style.left = `${rect.left}px`;
    balloon.style.top = `${rect.bottom + 10}px`;
    balloon.style.backgroundColor = '#fff';
    balloon.style.border = '1px solid #ccc';
    balloon.style.padding = '8px';
    balloon.style.borderRadius = '4px';
    balloon.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    balloon.style.zIndex = '10000';
    balloon.style.maxWidth = '300px';
    balloon.style.color = '#000';

    
    document.body.appendChild(balloon);
    return balloon;
}

// Close balloon when clicking outside
document.addEventListener('mousedown', (event) => {
    const balloons = document.querySelectorAll('.dictionary-balloon');
    balloons.forEach(balloon => {
        if (!balloon.contains(event.target)) {
            balloon.remove();
        }
    });
});