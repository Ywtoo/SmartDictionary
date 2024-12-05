import { runPrompt } from "./geminiAPI.js";
import { getConfig } from "./config.js";
import { marked } from "marked";
import { generatePrompt } from '../scripts/promptGenerator.js';
import { createBalloon, positionBalloon } from './createBallon.js';

const TYPING_SPEED = 5;
// TODO: Investigar e corrigir o bug que exige estas variáveis globais.
// O meaningDiv fica em branco se estas variáveis forem locais.
let currentIndex = 0;
let accumulatedText = '';
let accumulatedHtml = '';

async function getWordFromSelection(selectionOrWord) {
  if (typeof selectionOrWord === 'string') {
    return selectionOrWord;
  }

  const range = createRangeFromSelection(selectionOrWord);
  if (!range) return null;

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  const selectedText = window.getSelection().toString();
  if (!selectedText) return null;

  return getWordAroundSelection();
}

export async function showDictionaryBalloon(selectionOrWord) {
  try {
    const word = await getWordFromSelection(selectionOrWord);
    if (!word) return;


    clearPreviousBalloon()

    //Preparar e iniciar balão
    const config = await getConfig();
    const balloon = createBalloon(word);
    positionBalloon(balloon);
    document.body.appendChild(balloon);

    const meaningDiv = balloon.querySelector(".meaning");

    document.body.appendChild(balloon);

    if (config.testingMode) {
      meaningDiv.textContent = word;
      return;
    } else {
      currentIndex = 0;
      accumulatedText = '';
      accumulatedHtml = '';

      const prompt = generatePrompt(word, 'dictionary');
      const handleChunk = (chunk) => updateMeaningContent(chunk, meaningDiv, TYPING_SPEED);
      accumulatedText = '';
      await runPrompt(prompt, handleChunk);
    }

  } catch (error) {
    handleError(error);
  }
}

//Restaurar seleção
function createRangeFromSelection(savedSelection) {
  const range = document.createRange();
  range.setStart(savedSelection.startContainer, savedSelection.startOffset);
  range.setEnd(savedSelection.endContainer, savedSelection.endOffset);
  return range;
}

function updateMeaningContent(chunk, meaningDiv) {
  accumulatedText += chunk;
  accumulatedHtml = marked(accumulatedText);

  let currentContent = '';

  function typeEffect() {
    if (currentIndex < accumulatedHtml.length) {
      currentContent += accumulatedHtml[currentIndex];
      meaningDiv.innerHTML = currentContent;
      currentIndex++;
      setTimeout(typeEffect, TYPING_SPEED);
    }
  }

  if (meaningDiv) {
    if (meaningDiv.textContent === "Carregando...") {
      meaningDiv.textContent = '';
    }
    if (currentIndex === 0) {
      typeEffect();
    }
  }

  return accumulatedText;
}

//Funções que pega a palavra inteira ao redor da seleção 
function getWordAroundSelection() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  const startOffset = range.startOffset;
  const endOffset = range.endOffset;

  const textNode = range.startContainer;
  if (textNode.nodeType !== 3) return null;

  const textContent = textNode.textContent;

  let startIndex = startOffset;
  let endIndex = endOffset;

  if (textContent[startIndex] === " " && textContent[endIndex - 1] === " ") {
    return textContent.slice(startIndex, endIndex).trim();
  }

  if (textContent[endIndex - 1] !== " ") {
    endIndex = adjustEndIndex(textContent, endIndex);
  }

  if (textContent[startIndex] !== " ") {
    startIndex = adjustStartIndex(textContent, startIndex);
  }

  const word = textContent.slice(startIndex, endIndex).trim();
  return word;
}

function adjustEndIndex(textContent, index) {
  const length = textContent.length;
  while (index < length && textContent[index] !== " " && /\w/.test(textContent[index])) {
    index++;
  }
  return index;
}

function adjustStartIndex(textContent, index) {
  while (index > 0 && textContent[index - 1] !== " " && /\w/.test(textContent[index - 1])) {
    index--;
  }
  return index;
}

// -------------------------Erros-------------------------------
function handleError(error) {
  console.error('Error in showDictionaryBalloon:', error);
  const balloon = document.querySelector(".dictionary-balloon");
  if (balloon) {
    const meaningDiv = balloon.querySelector(".meaning");
    if (meaningDiv) {
      meaningDiv.innerHTML = "Erro ao buscar significado";
      meaningDiv.style.backgroundColor = "#ffebee";
    }
  }
}

//------------------------------Limpa--------------------------------
function clearPreviousBalloon() {
  document.querySelectorAll(".dictionary-balloon").forEach((balloon) => balloon.remove());
}
