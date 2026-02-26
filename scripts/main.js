import { showDictionaryBalloon } from './dictionaryBallon.js';
import { extractTextFromImage } from './geminiAPI.js';
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

// Listen for OCR processing requests from background
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'processImageInContent') {
        try {
            const text = await extractTextFromImage(message.dataUrl);
            console.log("Texto extraído no content script:", text);
            
            // Show dictionary balloon with the extracted text (like normal text selection)
            if (text && text.trim()) {
                showDictionaryBalloon(text.trim());
                sendResponse({ success: true, text });
            } else {
                // No text found, show simple notification
                const balloon = document.createElement('div');
                balloon.className = 'dictionary-balloon';
                balloon.style.position = 'fixed';
                balloon.style.right = '20px';
                balloon.style.bottom = '20px';
                balloon.style.maxWidth = '360px';
                balloon.style.padding = '12px';
                balloon.style.background = 'white';
                balloon.style.border = '1px solid #ccc';
                balloon.style.borderRadius = '8px';
                balloon.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
                balloon.style.zIndex = 2147483647;
                balloon.textContent = 'Nenhum texto encontrado na imagem';
                document.body.appendChild(balloon);
                setTimeout(() => balloon.remove(), 5000);
                sendResponse({ success: true, text: '' });
            }
        } catch (error) {
            console.error("Erro ao processar imagem no content script:", error);
            alert("Erro ao processar a imagem: " + error.message);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep message channel open for async response
    }
});