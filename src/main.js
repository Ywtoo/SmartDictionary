import { showDictionaryBalloon } from './dictionaryBallon.js';

let savedSelection = null;  // Variável global para armazenar a seleção de texto

//Função principal
document.addEventListener('mouseup', (event) => {

    const balloon = document.querySelector('.dictionary-balloon');
    const miniballoon = document.querySelector('.mini-balloon');

    if (balloon || miniballoon) {
        return;
    }

    // Verifica se há texto selecionado
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
        return;
    }
    savedSelection = {
        startContainer: selection.getRangeAt(0).startContainer,
        startOffset: selection.getRangeAt(0).startOffset,
        endContainer: selection.getRangeAt(0).endContainer,
        endOffset: selection.getRangeAt(0).endOffset,
    };
    //Guarda a seleção para não perder nas interaçoes e quebrar tudo

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    console.log('Criando o mini balão');
    const miniballoonElement = document.createElement('div');
    miniballoonElement.className = 'mini-balloon';
    miniballoonElement.innerHTML = '🔍';

    miniballoonElement.style.left = `${rect.right}px`;
    miniballoonElement.style.top = `${rect.bottom + 10}px`;

    document.body.appendChild(miniballoonElement);

    // Quando clicar no mini balão
    miniballoonElement.addEventListener('click', (e) => {
        e.stopPropagation();

        showDictionaryBalloon(savedSelection);
        removeBalloons()
    });
});

//remove balões (geral)
document.addEventListener('mousedown', (event) => {
    if (!event.target.closest('.mini-balloon') && !event.target.closest('.dictionary-balloon')) {
        removeBalloons();
        console.log("Balões removidos");
    }
});

function removeBalloons() {
    const balloons = document.querySelectorAll('.mini-balloon, .dictionary-balloon');
    balloons.forEach(balloon => balloon.remove());
}