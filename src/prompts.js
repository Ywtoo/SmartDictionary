export function generatePrompt(word, idioma, isMultipleWords) {
    const traducao = `
    Formato esperado em MarkDown Não escrever oque esta entre ():
    # "${word}"
    - (Se o idioma for diferente: escreva "**Tradução(No idioma escolhido)**:" sempre explica se e formal em que contexto usada e oque significa e pode significar. Se for igual ao pedido: apenas explica como pedido anteriormente)
    `;
    const exemplo = `
    **Exemplo**: 
    - (Exemplo a frase precisa ser escrita no idioma original de ${word} e explica em ${idioma})
    - (No segundo exemplo o mesmo)
    (Caso tenha) Curiosidade: Algo interessante ou expressões com essa palavra ou expressão ou gírias.
    `;

    if (isMultipleWords) {
        return `
        Explicação e exemplo de uso para a expressão "${word}" no idioma ${idioma}. Escrever como dicionario de expressões
        ${traducao}

        **Sinônimos**: (Apenas expressoes com mesmo significado se ouver)
  
        ${exemplo}
        `;
    } else {
        return `
        Significado de "${word}" em ${idioma}. Escreva como um dicionário.
        ${traducao}

        **Sinônimos**: - Palavra1, Palavra 2, palavra 3(3 ate 5 palavras mais próximas em significado no mesmo idioma de ${word})

        ${exemplo}
        `;
    }
}

// Função para montar o prompt com o contexto da conversa
export function createPrompt(userMessage, conversationContext, idioma) {
    return `Aqui está o contexto da conversa com o usuário. Responda de forma curta, clara de acordo com o contexto: ${conversationContext}
    Responda à última pergunta no mesmo idioma da pergunta. Pergunta: "${userMessage}"`;
}