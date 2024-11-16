import { showDictionaryBalloon } from './dictionaryBallon.js';

let savedSelection = null;  // Variável global para armazenar a seleção de texto

document.addEventListener('mouseup', (event) => {

    // Verifica se há algum balão já aberto
    const balloon = document.querySelector('.dictionary-balloon');
    const miniballoon = document.querySelector('.mini-balloon');

    // Se já há um balão de dicionário ou mini balão, não faz nada
    if (balloon || miniballoon) {
        console.log('Já existe um balão aberto');
        return;
    }

    // Verifica se há texto selecionado
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
        console.log('Nenhuma seleção de texto');
        return;  // Não faz nada se não há seleção
    }

    savedSelection = {
        startContainer: selection.getRangeAt(0).startContainer,
        startOffset: selection.getRangeAt(0).startOffset,
        endContainer: selection.getRangeAt(0).endContainer,
        endOffset: selection.getRangeAt(0).endOffset,
    };

    console.log('Seleção salva', savedSelection);

    // Se houver seleção, cria o mini balão
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    console.log('Criando o mini balão');
    // Cria o mini balão
    const miniballoonElement = document.createElement('div');
    miniballoonElement.className = 'mini-balloon';
    miniballoonElement.innerHTML = '🔍';

    // Posiciona o mini balão próximo à seleção
    miniballoonElement.style.left = `${rect.left}px`;
    miniballoonElement.style.top = `${rect.bottom + 10}px`;

    // Adiciona o mini balão à página
    document.body.appendChild(miniballoonElement);

    // Quando clicar no mini balão
    miniballoonElement.addEventListener('click', (e) => {
        e.stopPropagation();  // Impede o evento de se propagar

        // Agora apenas chama o showDictionaryBalloon, passando a seleção
        showDictionaryBalloon(savedSelection);
        removeMiniBalloon()
    });
});

// Função para remover o mini balão
function removeMiniBalloon() {
    const existingBalloon = document.querySelector('.mini-balloon');
    if (existingBalloon) {
        existingBalloon.remove();
    }
}

// Remove o mini balão quando clicar fora
document.addEventListener('mousedown', (event) => {
    if (!event.target.closest('.mini-balloon') && !event.target.closest('.dictionary-balloon')) {
        removeMiniBalloon();
        balloon.remove();  // Remove o balão se o clique for fora
    }
});