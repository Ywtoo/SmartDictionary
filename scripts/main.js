import { showDictionaryBalloon } from './dictionaryBallon.js';
import './text-from-images/printSelection.js'

let savedSelection = null;  // Variável global para armazenar a seleção de texto e usar em outros arquivos

function removeBalloons() {
    document.querySelectorAll('.mini-balloon, .dictionary-balloon').forEach(balloon => balloon.remove());
}

function createMiniBalloon(rect) {
    const miniballoonElement = document.createElement('div');
    miniballoonElement.className = 'mini-balloon';
    miniballoonElement.textContent = '🔍';
    miniballoonElement.style.left = `${rect.right}px`;
    miniballoonElement.style.top = `${rect.bottom + 10}px`;

    miniballoonElement.addEventListener('click', (e) => {
        e.stopPropagation();
        showDictionaryBalloon(savedSelection);
        removeBalloons();
    });

    document.body.appendChild(miniballoonElement);
}

document.addEventListener('mouseup', (event) => {
    if (document.querySelector('.dictionary-balloon') || document.querySelector('.mini-balloon')) {
        return;
    }

    //Salva seleção do usuario para não ser perdida durante os processos
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
        return;
    }

    savedSelection = selection.getRangeAt(0).cloneRange();

    const rect = savedSelection.getBoundingClientRect();
    createMiniBalloon(rect);
});

document.addEventListener('mousedown', (event) => {
    if (!event.target.closest('.mini-balloon') && !event.target.closest('.dictionary-balloon')) {
        removeBalloons();
    }
});