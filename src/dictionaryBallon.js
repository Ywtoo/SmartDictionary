import { runPrompt } from './iaHandler.js';
import { getConfig } from './config.js';
import { marked } from 'marked';


export async function showDictionaryBalloon(event) {
    const selectedText = window.getSelection().toString();
    if (!selectedText) return;

    // Encontre a palavra inteira
    const word = getWordAroundSelection();
    if (!word) return;

    // Remove existing balloons
    document.querySelectorAll('.dictionary-balloon').forEach(b => b.remove());

    const config = await getConfig();
    const balloon = createBalloon(word);

   // Verifica se a palavra contém mais de uma palavra (se tiver espaços)
   const isMultipleWords = word.split(' ').length > 1;

   try {
       let prompt;
       if (isMultipleWords) {
           // Se for uma expressão ou frase (mais de uma palavra)
           prompt = `Explicação e exemplo de uso para a expressão "${word}" no idioma ${config.idioma}. 
           Formato esperado:
           # "${word}" 
           ## Definições:
           - Explique o significado da expressão no idioma e tradução de ${config.idioma}.
           - Explique como se usa essa expressão no contexto da língua.
           **Exemplo**: 
           - "Eu gosto muito de [${word}] como [exemplo] no cotidiano."
           (Caso tenha) Curiosidade: Algo interessante ou expressões relacionadas.
           `;
       } else {
           // Se for uma única palavra
           prompt = `Significado de "${word}" em ${config.idioma}. Escreva como um dicionário de dois exemplos do dia a dia. Explicaçoes em ${config.idioma}.
           Formato esperado:
           # "${word}"
           ## Definições: (coloque 1 tradução direta e 2 palavras mais próximas em significado na língua escolhida)
           -...
           -...
           **Sinônimos**: sinonimo1, sinonimo2, ...
           **Exemplo**: 
           -*Eu adoro comer Abacaxi na sobremesa.*
           (Caso tenha) Curiosidade: Algo interessante ou expressões com essa palavra ou gírias.
           `;
       }
        const response = await runPrompt(prompt);
        const htmlContent = marked(response);  // Convertendo Markdown em HTML

        balloon.innerHTML = htmlContent;  // Exibe o conteúdo convertido no balão

    } catch (error) {
        balloon.textContent = 'Erro ao buscar significado';
        balloon.style.backgroundColor = '#ffebee';
    }
}

// Função que pega a palavra inteira ao redor da seleção
function getWordAroundSelection() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    const textNode = range.startContainer;
    if (textNode.nodeType !== 3) return null; // Certifique-se de que estamos lidando com um nó de texto

    const textContent = textNode.textContent;

    let i = startOffset;
    let j = endOffset;

    // Se a seleção começa ou termina com um espaço, não expande
    if (textContent[i] === ' ' && textContent[j - 1] === ' ') {
        return textContent.slice(i, j).trim(); // Apenas retorna a seleção atual
    }

    // Expansão para a direita (se não tiver espaço após o último caractere)
    if (textContent[j - 1] !== ' ') {
        while (j < textContent.length && textContent[j] !== ' ' && /\w/.test(textContent[j])) {
            j++;
        }
    }

    // Expansão para a esquerda (se não tiver espaço antes do primeiro caractere)
    if (textContent[i] !== ' ') {
        while (i > 0 && textContent[i - 1] !== ' ' && /\w/.test(textContent[i - 1])) {
            i--;
        }
    }

    // Retorna a palavra expandida
    const word = textContent.slice(i, j).trim();

    return word;
}

function createBalloon(text) {
    const balloon = document.createElement('div');
    balloon.className = 'dictionary-balloon'; // Classe para ser usado no CSS
    balloon.textContent = 'Carregando...';

    // Adiciona o balão à página enquanto o conteúdo está sendo carregado
    document.body.appendChild(balloon);

    // Salva a posição original da seleção para que o balão fique fixo
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Definindo a posição inicial do balão com base na seleção
    balloon.style.position = 'fixed';  // Garante que o balão vai ficar fixo na tela
    balloon.style.left = `${rect.left}px`;
    balloon.style.top = `${rect.bottom + 10}px`;

    // Garantir que o balão esteja visível na tela
    balloon.style.zIndex = '10000';
    document.body.appendChild(balloon);

    balloon.addEventListener('mousedown', (e) => {
        // Impede que a seleção de texto altere a posição do balão
        const balloonRect = balloon.getBoundingClientRect();
        if (e.clientY < balloonRect.top || e.clientY > balloonRect.bottom ||
            e.clientX < balloonRect.left || e.clientX > balloonRect.right) {
            // Se o clique for fora do balão, ele pode mudar a posição, caso contrário não faz nada
            e.preventDefault();
        }
    });

    return balloon;
}

//Just Close the balloon
document.addEventListener('mousedown', (event) => {
    const balloons = document.querySelectorAll('.dictionary-balloon');
    balloons.forEach(balloon => {
        if (!balloon.contains(event.target)) {
            balloon.remove();
        }
    });
});