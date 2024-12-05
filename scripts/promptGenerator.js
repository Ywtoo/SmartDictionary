import { getConfig } from "./config.js";

export function generatePrompt(word = null, promptType, conversationContext = null) {
    const config = getConfig();
    const idioma = config.idioma;

    if (promptType === 'dictionary') {

        // Função auxiliar para evitar repetição de código
        function createPromptSections(word) {
            const traducao = ` # "${word}"\n - (Se o idioma for diferente: escreva "**Tradução (${idioma})**:" \nSempre explique se é formal, em que contexto é usada e o que significa e pode significar. Se for igual ao pedido: apenas explique como pedido anteriormente)`;
            const exemplo = ` **Exemplo**:\n - (Exemplo: a frase precisa ser escrita no idioma original de "${word}" e explicada em ${idioma})\n - (No segundo exemplo, o mesmo)\n(Caso tenha) **Curiosidade**:\n Algo interessante, expressões com essa palavra ou gírias.`;

            return { traducao, exemplo };
        }

        const isMultipleWords = word.split(" ").length > 1;
        const { traducao, exemplo } = createPromptSections(word);

        if (isMultipleWords) {
            return ` Explicação e exemplo de uso para a expressão "${word}" no idioma ${idioma}. Escrever como dicionario de expressões\n${traducao}\n\n**Sinônimos**: (Apenas expressoes com mesmo significado se ouver)\n\n${exemplo}`;
        } else {
            return ` Significado de "${word}" em ${idioma}. Escreva como um dicionário.\n${traducao}\n\n**Sinônimos**: - Palavra1, Palavra 2, palavra 3(3 ate 5 palavras mais próximas em significado no mesmo idioma de ${word})\n\n${exemplo}`;
        }
        
    } else if (promptType === 'conversation') {

        return ` Aqui está o contexto da conversa com o usuário. Responda de forma curta e clara, de acordo com o contexto: ${conversationContext}\n Responda à última pergunta no mesmo idioma da pergunta. Pergunta:`;
    } else {
        return null;
    }
}
