chrome.runtime.onInstalled.addListener(() => {
  console.log("Dicionário Instantâneo instalado!");
});

//-----------------------------OCR-------------------------------------

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ocrImage") {
      chrome.scripting.executeScript({
          target: {tabId: tab.id},
          files: ['src/text-from-images/printSelection.js'],
          injectImmediately: true
      }, (injectionResults) => {
          if (chrome.runtime.lastError) {
              console.error("Erro injetando script:", chrome.runtime.lastError);
          } else {

              console.log("Script injetado:", injectionResults);
              // Envia a mensagem para o content script
              chrome.tabs.sendMessage(tab.id, { action: "startCapture" }, (response) => {
                if (chrome.runtime.lastError) {
                  console.error("Erro enviando mensagem:", chrome.runtime.lastError);
                } else {
                  console.log("Resposta da mensagem 'startCapture':", response);
                }
              });
          }

      });
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
  if (message.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" }, (dataUrl) => {
      if (dataUrl) {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'screenshotCaptured', dataUrl: dataUrl });
        sendResponse({ success: true });
      } else {
        console.error("Erro ao capturar a aba visível");
        chrome.tabs.sendMessage(sender.tab.id, { action: 'captureError', error: "Erro ao capturar a aba visível" });
        sendResponse({ success: false, error: "Erro ao capturar a aba visível" });
      }
    });
    return true; // Manter a conexão para resposta assíncrona
  } else if (message.action === 'processImage') {
    if (initializedModel === "ERRO_INICIALIZACAO") {
      console.error("Gemini não inicializado. Não é possível processar.");
      sendResponse({ success: false, error: "Gemini não inicializado" });
      return; // Importante: interrompe a execução aqui.
    }

    try {
      const text = await getGeminiText(message.dataUrl, initializedModel); // Passa o modelo inicializado
      console.log("Texto extraído:", text);
      if (sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'geminiResult', text: text });
      }
      sendResponse({ success: true, text: text });


    } catch (error) {
      console.error("Erro ao processar a imagem:", error);
      const errorMessage = error.message || "Erro desconhecido ao processar a imagem.";
      if (sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'geminiError', error: errorMessage });
      }
      sendResponse({ success: false, error: errorMessage });
    }

    return true; // Importante para respostas assíncronas
  }
  return true; // Manter a porta de mensagens aberta para outras mensagens, se necessário
});
