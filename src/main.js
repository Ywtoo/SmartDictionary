import { showDictionaryBalloon } from './dictionaryBallon.js';

document.addEventListener('mouseup', (event) => {
    // Verifica se o clique foi fora do balão
    const balloon = document.querySelector('.dictionary-balloon');
    
    // Se o balão não existe ou o clique foi fora do balão, então chama a função
    if (!balloon || !balloon.contains(event.target)) {
        showDictionaryBalloon(event);
    }
});
