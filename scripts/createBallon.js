import { generatePrompt } from '../scripts/promptGenerator.js';
import { runPrompt } from "./geminiAPI.js";
import { getConfig } from "./config.js";

export function createBalloon(text) {

  const balloon = document.createElement("div");
  balloon.className = "dictionary-balloon";
  document.body.appendChild(balloon);

  // Cria e adiciona a div para o significado
  const meaningDiv = createMeaningDiv();
  balloon.appendChild(meaningDiv);

  // Cria e adiciona o histórico de mensagens
  const messageHistory = createMessageHistory();
  balloon.appendChild(messageHistory);

  // Cria e adiciona o campo de input para perguntas
  const inputContainer = createInputContainer();
  balloon.appendChild(inputContainer);
  const inputField = inputContainer.querySelector("input");

  addSendMessageEvents(inputContainer, meaningDiv, messageHistory, inputField, balloon);

  return balloon;
}

// Cria a div para exibir o significado
function createMeaningDiv() {
  const meaningDiv = document.createElement("div");
  meaningDiv.className = "meaning";
  meaningDiv.textContent = "Carregando...";
  return meaningDiv;
}

// Cria a div para o histórico de mensagens
function createMessageHistory() {
  const messageHistory = document.createElement("div");
  messageHistory.className = "message-history";
  return messageHistory;
}

// Cria o container de input com campo de texto e botão
function createInputContainer() {
  const inputContainer = document.createElement("div");
  inputContainer.className = "input-container";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.placeholder = "Digite sua pergunta...";

  const sendButton = document.createElement("button");
  sendButton.textContent = "Enviar";

  inputContainer.appendChild(inputField);
  inputContainer.appendChild(sendButton);

  return inputContainer;
}

// Adiciona eventos para enviar a mensagem ao clicar ou apertar Enter
function addSendMessageEvents(inputContainer, meaningDiv, messageHistory, inputField, balloon) {
  const sendButton = inputContainer.querySelector("button");

  sendButton.addEventListener("click", () => enviarMensagem(inputField, meaningDiv, messageHistory, balloon));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && inputField.value.trim()) {
      enviarMensagem(inputField, meaningDiv, messageHistory, balloon);
    }
  });
}

async function enviarMensagem(inputField, meaningDiv, messageHistory, balloon) {
  const userMessage = inputField.value.trim();
  if (userMessage) {
    addMessage(messageHistory, "Usuário", userMessage, balloon, false);
    inputField.value = "";

    let aiResponseText = "";
    let currentIAMessageElement = null;

    const updateChatUI = (chunkText) => {
      aiResponseText += chunkText;


      addMessage(messageHistory, "IA", aiResponseText, balloon, !!currentIAMessageElement);

      if (!currentIAMessageElement) {
        currentIAMessageElement = messageHistory.querySelector('.message:last-child.ia');
      }
    };

    await getAiResponse(userMessage, messageHistory, updateChatUI);
  }
}

function addMessage(container, sender, message, balloon, isUpdate = false) {
  let messageElement;

  if (!isUpdate) {
      messageElement = document.createElement("div");
      messageElement.classList.add("message");
      if (sender === "Usuário") {
          messageElement.classList.add("usuario");
      } else if (sender === "IA") {
          messageElement.classList.add("ia");
      }
      container.appendChild(messageElement);
  } else {
      messageElement = container.querySelector('.message:last-child.ia');
      if (!messageElement) {
          messageElement = document.createElement("div");
          messageElement.classList.add("message");
          messageElement.classList.add("ia");
          container.appendChild(messageElement);
      }
  }


  // Typing Effect
  let currentIndex = 0;
  const typingSpeed = 7; 

  function type() {
      if (currentIndex < message.length) {
          messageElement.textContent += message[currentIndex];
          currentIndex++;
          setTimeout(type, typingSpeed);
      } else {
          container.scrollTop = container.scrollHeight;
      }
  }

  type();
}

// Função para gerar o histórico e pegar as respostas
export async function getAiResponse(userMessage, messageHistory, onStreamChunk = null) {
  const maxHistoryLength = 6;
  const config = await getConfig();

  function getRecentMessages(messageHistory) {
    const messages = messageHistory.querySelectorAll(".message");
    const messageTexts = Array.from(messages, (msg) => msg.textContent);
    return messageTexts.slice(-maxHistoryLength);
  }

  const recentMessages = getRecentMessages(messageHistory);
  const conversationContext = recentMessages.join("\n");

  //todo atualizar
  const prompt = generatePrompt(null, 'conversation', conversationContext);

  if (onStreamChunk) {
    return await runPrompt(prompt, onStreamChunk);
  } else {
    console.log('Esperando resposta completa...');
    return await runPrompt(prompt);
  }
}

export function positionBalloon(balloon) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const balloonRect = { width: balloon.offsetWidth, height: balloon.offsetHeight };
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const {left, top} = getBestPosition(rect, balloonRect, viewportWidth, viewportHeight);

  balloon.style.left = `${left}px`;
  balloon.style.top = `${top}px`;
  addDragFunctionality(balloon);
}

function addDragFunctionality(balloon) {
  let isDragging = false;
  let offsetX, offsetY;

  balloon.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - balloon.offsetLeft;
      offsetY = e.clientY - balloon.offsetTop;
  });

  document.addEventListener('mousemove', (e) => {
      if (isDragging) {
          balloon.style.left = (e.clientX - offsetX) + 'px';
          balloon.style.top = (e.clientY - offsetY) + 'px';
      }
  });

  document.addEventListener('mouseup', () => {
      isDragging = false;
  });
}

function getBestPosition(rect, balloonRect, viewportWidth, viewportHeight) {
  console.log('Posicionamento iniciado')
  const leftOptions = [rect.left, rect.right - balloonRect.width];
  const topOptions = [rect.bottom + 10, rect.top - balloonRect.height - 10];

  let bestLeft = null;
  let bestTop = null;

  //Prioritize placing the balloon near the selection first
  for(let i = 0; i < leftOptions.length; i++){
      let currentLeft = leftOptions[i];
      let validLeft = true;
      //Handle edge cases:
      if (currentLeft + balloonRect.width > viewportWidth) validLeft = false;
      if (currentLeft < 0) validLeft = false;
      if (validLeft) {
          bestLeft = currentLeft;
          break;
      }
  }

  //If no valid left position found, choose a default position.
  if(bestLeft === null) bestLeft = 0;

  for (let i = 0; i < topOptions.length; i++) {
      let currentTop = topOptions[i];
      let validTop = true;
      //Handle edge cases:
      if (currentTop + balloonRect.height > viewportHeight) validTop = false;
      if (currentTop < 0) validTop = false;
      if(validTop){
          bestTop = currentTop;
          break;
      }
  }

  if (bestTop === null) bestTop = 0;

  return {left: bestLeft, top: bestTop};
}