import { runPrompt } from "./iaHandler.js";
import { getConfig } from "./config.js";
import { marked } from "marked";
import { generatePrompt } from './prompts';
import { createBalloon, positionBalloon } from './createBallon.js';

//-------------------Main function------------------------------
export async function showDictionaryBalloon(selectionOrWord) { // Nome mais descritivo
  try {
    let word;

    if (typeof selectionOrWord === 'string') { // Verifica se é uma string
      word = selectionOrWord;
    } else {
      word = getSelectedText(selectionOrWord); // Assume que é uma seleção
      if (!word) return; // Sai se não houver palavra na seleção
    }


    clearPreviousBalloon()

    //Preparar e iniciar balão------------------
    const config = await getConfig();
    const balloon = createBalloon(word);
    positionBalloon(balloon);
    document.body.appendChild(balloon);

    const meaningDiv = balloon.querySelector(".meaning");

    document.body.appendChild(balloon);

    const isMultipleWords = word.split(" ").length > 1;
    const prompt = generatePrompt(word, config.idioma, isMultipleWords);

    // *** NEW: Check for testing mode ***
    if (config.testingMode) {
      meaningDiv.textContent = prompt;
    } else {

      currentIndex = 0;
      accumulatedText = '';
      accumulatedHtml = '';

      const handleChunk = (chunk) => updateMeaningContent(chunk, meaningDiv, accumulatedText);
      accumulatedText = '';
      await runPrompt(prompt, handleChunk);
    }

  } catch (error) {
    handleError(error);
  }
}

function getSelectedText(savedSelection) { //Mantive a função getSelectedText para maior clareza
  const range = createRangeFromSelection(savedSelection);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  const selectedText = window.getSelection().toString();
  if (!selectedText) return null; // Retorna explicitamente null se não houver texto

  const word = getWordAroundSelection();
  return word; // Retorna a palavra se houver
}

// ------------------------Restaurar seleção-----------------------
function createRangeFromSelection(savedSelection) {
  const range = document.createRange();
  range.setStart(savedSelection.startContainer, savedSelection.startOffset);
  range.setEnd(savedSelection.endContainer, savedSelection.endOffset);
  return range;
}
//----------------------updateMeaningContent variaveis-----------------------
let currentIndex = 0;
let accumulatedText = '';
let accumulatedHtml = '';

function updateMeaningContent(chunk, meaningDiv, typingSpeed = 5) {
  accumulatedText += chunk;

  accumulatedHtml = marked(accumulatedText);

  let currentContent = '';

  function typeEffect() {
    if (currentIndex < accumulatedHtml.length) {
      currentContent += accumulatedHtml[currentIndex];
      meaningDiv.innerHTML = currentContent;
      currentIndex++;
      setTimeout(typeEffect, typingSpeed);
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

//----Função que pega a palavra inteira ao redor da seleção-----
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

// -------------------------Erros showDictionaryBalloon-------------------------------
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
