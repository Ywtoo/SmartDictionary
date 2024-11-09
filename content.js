

document.addEventListener('mouseup', async (event) => { //Chama o balão
    const palavraSelecionada = window.getSelection().toString().trim(); //Pega oque foi selecionado

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

        const prompt = `Apenas o significado de ${palavraSelecionada} e outras palavras com mesmo singnificado em ${idiomaDeTraducao} seguindo essa estrutura: \n "Significado da palavra" \n \n Sinonimos: ...`

        const significado = await apiCall(palavraSelecionada, apiKey);
        balao.textContent = significado; // Atualiza o texto do balão com o significado
    }
});

// Remove o balão ao clicar em qualquer lugar fora do balão
document.addEventListener('mousedown', (event) => {
    const baloesExistentes = document.querySelectorAll('.dicionario-balao');
    baloesExistentes.forEach(balao => {
        if (!balao.contains(event.target)) {
            balao.remove();
        }
    });
});

// Função para chamar a API Gemini e gerar o conteúdo
async function apiCall(prompt, chaveAPI) {
    const apiKey = chaveAPI; // Substitua com a sua chave de API
    const url = 'https://generativeai.googleapis.com/v1beta2/generateText'; // URL da API

    const body = JSON.stringify({
        model: 'gemini-1.5-flash', // Modelo do Gemini que você deseja usar
        prompt: prompt,           // O prompt que você quer gerar
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`, // Autenticação com a API Key
            },
            body: body,
        });

        // Verifique se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro ao gerar conteúdo: ' + response.statusText);
        }

        const data = await response.json();
        return data;  // Retorna a resposta da API
    } catch (error) {
        console.error('Erro ao chamar Gemini API:', error);
        return null;
    }
}

// Exemplo de uso
const prompt = 'Escreva uma história sobre uma mochila mágica.';
apiCall(prompt).then(data => {
    if (data) {
        console.log('Conteúdo gerado:', data);
        // Aqui você pode tratar o resultado como quiser, por exemplo, exibir no balão
    }
});