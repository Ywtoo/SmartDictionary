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

         // Agora, injetamos o conteúdo dentro da div meaningDiv
         const meaningDiv = balloon.querySelector('.meaning');
         meaningDiv.innerHTML = htmlContent;
 
     } catch (error) {
         const meaningDiv = balloon.querySelector('.meaning');
         meaningDiv.textContent = 'Erro ao buscar significado';
         meaningDiv.style.backgroundColor = '#ffebee';
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
    balloon.className = 'dictionary-balloon';
    balloon.textContent = 'Carregando...';

    // Adiciona o balão à página enquanto o conteúdo está sendo carregado
    document.body.appendChild(balloon);

    balloon.style.userSelect = 'none';  // Bloqueia a seleção de texto dentro do balão

    // Captura a posição da seleção de texto
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    balloon.style.left = `${rect.left}px`;
    balloon.style.top = `${rect.bottom + 10}px`;

    // Div para o significado
    const meaningDiv = document.createElement('div');
    meaningDiv.className = 'meaning';
    balloon.appendChild(meaningDiv);

    // Adiciona o histórico de mensagens e o input
    const messageHistory = document.createElement('div');
    messageHistory.className = 'message-history';
    balloon.appendChild(messageHistory);

    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Digite sua pergunta...';
    const sendButton = document.createElement('button');
    sendButton.textContent = 'Enviar';
    inputContainer.appendChild(inputField);
    inputContainer.appendChild(sendButton);
    balloon.appendChild(inputContainer);

    let isUserInteracting = false; // Flag para controlar se o usuário está interagindo

    // Evento para enviar a pergunta
    sendButton.addEventListener('click', async () => {
        const userMessage = inputField.value.trim();
        if (userMessage) {
            isUserInteracting = true;  // Marca como interagindo
            addMessage(messageHistory, 'Usuário', userMessage);  // Adiciona a pergunta ao histórico
            inputField.value = '';  // Limpa o campo de input

            const aiResponse = await getAiResponse(userMessage, messageHistory);

            addMessage(messageHistory, 'IA', aiResponse);  // Adiciona a resposta ao histórico
            isUserInteracting = false; // Marca como não interagindo
        }
    });

    // Função para adicionar mensagens ao histórico
    function addMessage(container, sender, message) {
        const messageElement = document.createElement('div');
        
        // Aplique a classe 'usuario' ou 'ia' de acordo com o tipo da mensagem
        messageElement.classList.add('message');
        if (sender === 'Usuário') {
            messageElement.classList.add('usuario');
        } else if (sender === 'IA') {
            messageElement.classList.add('ia');
        }
        
        // Adiciona o conteúdo da mensagem
        messageElement.textContent = `${sender}: ${message}`;
        
        // Adiciona ao container
        container.appendChild(messageElement);
        
        // Scroll para o fim do histórico
        container.scrollTop = container.scrollHeight;
    }

    // Garantir que o balão esteja visível na tela
    balloon.style.zIndex = '10000';
    document.body.appendChild(balloon);

    // Impede a propagação do evento de clique dentro do balão
    balloon.addEventListener('mousedown', (e) => {
        e.stopImmediatePropagation();  // Impede que o clique dentro do balão afete o evento no corpo
    });

    // Flag para controlar se o balão pode ser fechado
    let canClose = true;

    // Detecta quando o usuário clica fora do balão e o fecha, mas só se não estiver interagindo
    document.addEventListener('mousedown', (event) => {
        if (canClose && !isUserInteracting) {  // Só fecha se não estiver interagindo
            const balloons = document.querySelectorAll('.dictionary-balloon');
            balloons.forEach(balloon => {
                if (!balloon.contains(event.target)) {
                    balloon.remove();  // Remove o balão se o clique for fora
                }
            });
        }
    });

    // Ao clicar dentro do balão, impede o fechamento
    document.addEventListener('mousedown', (event) => {
        if (balloon.contains(event.target)) {
            canClose = false;  // Impede o fechamento enquanto o balão estiver sendo interagido
        } else {
            canClose = true;  // Reabilita o fechamento se o clique for fora do balão
        }
    });

    return balloon;
}

// Função para gerar o histórico e pegar as respostas
export async function getAiResponse(userMessage, messageHistory) {
    // Limite de mensagens que vamos enviar para a IA (somente as últimas 6)
    const maxHistoryLength = 6;
    const config = await getConfig();

    // Função para pegar as últimas mensagens do histórico
    function getRecentMessages(messageHistory) {
        // Pega todos os elementos de mensagem dentro do container de mensagens
        const messages = Array.from(messageHistory.getElementsByClassName('message'));
        
        // Extrai o texto das mensagens em um array
        const messageTexts = messages.map(msg => msg.textContent);
        
        // Retorna as últimas 6 mensagens ou menos
        return messageTexts.slice(-maxHistoryLength);
    }

    // Construa o histórico com as últimas 6 mensagens para o prompt
    const recentMessages = getRecentMessages(messageHistory);

    // Transforma as últimas mensagens em uma string com formatação adequada
    const conversationContext = recentMessages.join("\n"); // Usando `join` para transformar em uma string

    // Prompt para a IA pedindo respostas curtas e objetivas
    const prompt = `Aqui está o contexto da conversa com o usuario. Responda de forma curta, clara de acordo com o contexto:

    ${conversationContext}

    Responda à última pergunta no idioma escolhido (${config.idioma}). Pergunta: "${userMessage}"`;

    // Exibindo o contexto da conversa no console para debugging
    console.log(conversationContext);

    // Chama o prompt com o histórico completo (limitado às últimas 6 interações)
    const response = await runPrompt(prompt);
    return response;
}
