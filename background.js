chrome.runtime.onInstalled.addListener(() => {
  console.log("Dicionário Instantâneo instalado!");
});

// Track pending captures when we inject fallbacks (tabIds)
const pendingCaptures = new Set();

//-----------------------------OCR-------------------------------------

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "ocrImage") {
      // mark this tab as expecting a capture
      if (tab && tab.id) pendingCaptures.add(tab.id);
      
      // Inject inline overlay and capture logic directly
      try {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function() {
            if (window.__smartDictOverlayInjected) return;
            window.__smartDictOverlayInjected = true;
            
            let isDragging = false;
            let startX, startY;
            let selectionBox = null;
            let screenshotDataUrl = null;
            let capturedSelection = null;
            
            function updateSelectionBox(x, y) {
                const width = x - startX;
                const height = y - startY;
                if (!selectionBox) return;
                selectionBox.style.transform = `translate(${Math.min(startX, x)}px, ${Math.min(startY, y)}px)`;
                selectionBox.style.width = `${Math.abs(width)}px`;
                selectionBox.style.height = `${Math.abs(height)}px`;
            }
            
            function cropAndSendImage(dataUrl, selection) {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = selection.width;
                    canvas.height = selection.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, -selection.left, -selection.top);
                    const croppedDataUrl = canvas.toDataURL();
                    
                    try {
                        // Send to background which will forward to content script for processing
                        chrome.runtime.sendMessage({ action: 'processImage', dataUrl: croppedDataUrl }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error('Erro enviando imagem:', chrome.runtime.lastError);
                                return;
                            }
                            console.log('Imagem enviada para processamento');
                        });
                    } catch (error) {
                        console.error("Erro ao enviar imagem:", error);
                    }
                };
                img.src = dataUrl;
            }
            
            // Listen for messages from background
            chrome.runtime.onMessage.addListener((message) => {
                if (message.action === 'screenshotCaptured') {
                    screenshotDataUrl = message.dataUrl;
                    if (capturedSelection) {
                       cropAndSendImage(screenshotDataUrl, capturedSelection);
                    }
                }
            });
            
            function createOverlay() {
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                overlay.style.zIndex = '2147483646';
                overlay.style.cursor = 'crosshair';

                overlay.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    startX = e.clientX; startY = e.clientY;
                    selectionBox = document.createElement('div');
                    selectionBox.style.position = 'fixed';
                    selectionBox.style.border = '2px solid red';
                    selectionBox.style.width = '0'; selectionBox.style.height = '0';
                    selectionBox.style.transform = `translate(${startX}px, ${startY}px)`;
                    overlay.appendChild(selectionBox);
                });

                overlay.addEventListener('mousemove', (e) => {
                    if (isDragging) updateSelectionBox(e.clientX, e.clientY);
                });

                overlay.addEventListener('mouseup', (e) => {
                    isDragging = false;
                    overlay.style.cursor = 'default';
                    if (!selectionBox) { overlay.remove(); return; }
                    const rect = selectionBox.getBoundingClientRect();
                    capturedSelection = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
                    overlay.remove();
                    try { chrome.runtime.sendMessage({ action: 'captureVisibleTab', selection: capturedSelection }); } catch (err) { console.warn('sendMessage failed', err); }
                });

                document.body.appendChild(overlay);
            }
            
            createOverlay();
          }
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Injection failed:', chrome.runtime.lastError);
          }
        });
      } catch (e) {
        console.error('Failed to inject overlay:', e);
      }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ocrImage",
    title: "Capturar Imagem da Tela",
    contexts: ["all"]
  });
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'open_api_popup') {
    try {
      if (chrome.action && chrome.action.openPopup) {
        // open the popup so the user can set the API key
        await chrome.action.openPopup();
        sendResponse({ success: true });
      } else if (chrome.runtime.openOptionsPage) {
        // fallback: open options page if popup API not available
        chrome.runtime.openOptionsPage();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No method to open popup' });
      }
    } catch (err) {
      console.error('Failed to open popup:', err);
      sendResponse({ success: false, error: err && err.message });
    }
    return true;
  }
  if (message.action === 'captureVisibleTab') {
    // Determine target tab id: prefer sender.tab, otherwise use a pending tab
    let targetTabId = sender && sender.tab && sender.tab.id;
    if (!targetTabId) {
      if (pendingCaptures.size > 0) {
        targetTabId = Array.from(pendingCaptures.values())[0];
        pendingCaptures.delete(targetTabId);
      }
    };

    if (!targetTabId) {
      console.error('No target tab available for captureVisibleTab');
      sendResponse({ success: false, error: 'No target tab' });
      return false;
    }

    // Get the tab to find its windowId
    chrome.tabs.get(targetTabId, (tabInfo) => {
      if (chrome.runtime.lastError || !tabInfo) {
        console.error('Could not get tab for capture:', chrome.runtime.lastError);
        sendResponse({ success: false, error: 'Could not get tab' });
        return;
      }
      chrome.tabs.captureVisibleTab(tabInfo.windowId, { format: "png" }, (dataUrl) => {
        if (dataUrl) {
          chrome.tabs.sendMessage(targetTabId, { action: 'screenshotCaptured', dataUrl: dataUrl });
          sendResponse({ success: true });
        } else {
          console.error("Erro ao capturar a aba visível");
          chrome.tabs.sendMessage(targetTabId, { action: 'captureError', error: "Erro ao capturar a aba visível" });
          sendResponse({ success: false, error: "Erro ao capturar a aba visível" });
        }
      });
    });
    return true; // Manter a conexão para resposta assíncrona
  } else if (message.action === 'processImage') {
    // Forward the image processing request back to the content script
    // The content script has access to bundled geminiAPI module
    let targetTabId = sender && sender.tab && sender.tab.id;
    if (!targetTabId && pendingCaptures.size > 0) {
      targetTabId = Array.from(pendingCaptures.values())[0];
      pendingCaptures.delete(targetTabId);
    }
    
    if (targetTabId) {
      chrome.tabs.sendMessage(targetTabId, { 
        action: 'processImageInContent', 
        dataUrl: message.dataUrl 
      });
      sendResponse({ success: true, forwarded: true });
    } else {
      sendResponse({ success: false, error: 'No target tab for processing' });
    }
    return true;
  }
  return true; // Manter a porta de mensagens aberta para outras mensagens, se necessário
});
