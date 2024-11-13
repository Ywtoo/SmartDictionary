document.addEventListener('mouseup', async (event) => { //Chama o balão
    const palavraSelecionada = window.getSelection().toString().trim(); //Pega oque foi selecionado
    console.log('mouseup iniciou')

    if (palavraSelecionada) {
        // Remove balões existentes
        const baloesExistentes = document.querySelectorAll('.dicionario-balao');
        baloesExistentes.forEach(balao => balao.remove());

        // Obtém a posição da seleção
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0); // Primeiro intervalo selecionado
        const rect = range.getBoundingClientRect(); // Coordenadas da seleção

        // Cria o balão
        const balao = document.createElement('div');
        balao.className = 'dicionario-balao';
        balao.textContent = 'Pesquisando...'; // Mostra apenas a palavra selecionada por enquanto
        document.body.appendChild(balao);

        // Estiliza e posiciona o balão
        balao.style.position = 'absolute';
        balao.style.left = `${rect.left + window.scrollX}px`;
        balao.style.top = `${rect.top + window.scrollY - balao.offsetHeight - 10}px`; // Acima da seleção
        balao.style.backgroundColor = 'lightyellow';
        balao.style.border = '1px solid black';
        balao.style.padding = '5px';
        balao.style.borderRadius = '5px';
        balao.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        balao.style.zIndex = '1000';
        
        //prompt inicial
        const myprompt = `Apenas o significado de ${palavraSelecionada} e outras palavras com mesmo singnificado em ${ idioma } seguindo essa estrutura: \n "Significado da palavra" \n \n Sinonimos: ...`
        module.exports = {
            myprompt,
         }

        //chama a IA
        balao.textContent = significado; // Atualiza o texto do balão com o significado
    }
});

// Remove o balão ao clicar em qualquer lugar fora do balão
document.addEventListener('mousedown', (event) => {
    console.log('mousedown iniciou')
    const baloesExistentes = document.querySelectorAll('.dicionario-balao');
    baloesExistentes.forEach(balao => {
        if (!balao.contains(event.target)) {
            balao.remove();
        }
    });
});