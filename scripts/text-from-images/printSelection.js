import { extractTextFromImage } from '../geminiAPI.js';
import { showDictionaryBalloon } from '../dictionaryBallon.js';

let screenshotDataUrl = null;
console.log("screenshot Declarado");
let selection = null;

function createOverlay() {
    console.log("createOverlay chamado"); // Adicione este log

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9999'; // Certifique-se de que o z-index é alto
    overlay.style.cursor = 'crosshair';

    let isDragging = false;
    let startX, startY;
    let selectionBox = null;

    // função para atualizar o selectionBox com transformações CSS
    function updateSelectionBox(x, y) {
        const width = x - startX;
        const height = y - startY;

        selectionBox.style.transform = `translate(${Math.min(startX, x)}px, ${Math.min(startY, y)}px)`;
        selectionBox.style.width = `${Math.abs(width)}px`;
        selectionBox.style.height = `${Math.abs(height)}px`;
    }


    overlay.addEventListener('mousedown', (e) => {
        console.log("mousedown");
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        selectionBox = document.createElement('div');
        selectionBox.style.position = 'fixed';
        selectionBox.style.border = '2px solid red';
        selectionBox.style.width = '0';
        selectionBox.style.height = '0';
        selectionBox.style.transform = `translate(${startX}px, ${startY}px)`;
        overlay.appendChild(selectionBox);
    });

    //Exemplo de função de throttle
    function throttle(func, limit) {
        let inThrottle = false;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Dentro do seu overlay.addEventListener('mousemove'...)
    overlay.addEventListener('mousemove', throttle((e) => {
        console.log("mousemove");
        if (isDragging) {
            updateSelectionBox(e.clientX, e.clientY);

        }
    }, 50)); 

    overlay.addEventListener('mouseup', (e) => {
        console.log("mouseup");
        isDragging = false;
        overlay.style.cursor = 'default';

        if (!selectionBox) return; // No selection made

        // Define as variáveis aqui, fora do if
        let left = 0;
        let top = 0;
        let width = 0;
        let height = 0

        // Dentro do if apenas atribui valores
        if (selectionBox) {
            const rect = selectionBox.getBoundingClientRect();
            left = rect.left;
            top = rect.top;
            width = rect.width;
            height = rect.height;
        }

        selection = { left, top, width, height };

        overlay.remove();
        chrome.runtime.sendMessage({ action: "captureVisibleTab" });
    });
    document.body.appendChild(overlay);
    console.log("Overlay adicionado à página"); // Adicione este log
}

// Listen for a message from the background script to start the capture process
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'startCapture') {
        createOverlay();
    } else if (message.action === 'screenshotCaptured') { // <<< Adicione este listener
        screenshotDataUrl = message.dataUrl;
        if (selection) {
           extractedText = cropAndSendImage(screenshotDataUrl, selection);
           //chamar função de balão
           

        }
    } else if (message.action === 'geminiResult') {
        console.log("Texto recebido do Gemini:", message.text); // Exibe o texto
        // ... (seu código para usar o texto) ...
    } else if (message.action === 'geminiError') {
        console.error("Erro do Gemini:", message.error); // Exibe o erro
        alert("Erro ao processar a imagem: " + message.error); // Notifica o usuário

    }
});
// Let the background script know the content script is ready
chrome.runtime.sendMessage({ action: 'contentScriptReady' });

function cropAndSendImage(dataUrl, selection) {
    const img = new Image();
    img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = selection.width;
        canvas.height = selection.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, -selection.left, -selection.top); // Recorta a região

        const croppedDataUrl = canvas.toDataURL();
        console.log(croppedDataUrl);

        try {
            const text = await extractTextFromImage(croppedDataUrl);
            console.log("Texto extraído (diretamente no script de conteúdo):", text);
            showDictionaryBalloon(text);

        } catch (error) {
            console.error("Erro ao processar a imagem:", error);
            alert("Erro ao processar a imagem: " + error.message); // Notifica o usuário
        }
    };
    img.src = dataUrl;
    return text;
}