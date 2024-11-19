import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory
} from '@google/generative-ai';
import { getConfig } from './config.js';

let model = null;

// Inicializa o modelo apenas uma vez
export async function initModel() {
    if (!model) {
        const config = await getConfig();
        const genAI = new GoogleGenerativeAI(config.apiKey);

        model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 1
            }
        });
        console.log('Modelo inicializado');
    }
    return model;
}

//Função Princial para rodar os prompts (19/11/2024 gemini esta muito ruim sempre da erro)
export async function runPrompt(prompt, onStreamChunk = null) {
    try {
        await initModel();

        if (!onStreamChunk) {
            console.log('Esperando API...');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }

        console.log('Iniciando streaming...');
        const result = await model.generateContentStream(prompt);

        let fullText = '';

        console.log('Streaming iniciado:', result.stream);

        for await (const chunk of result.stream) {
            console.log('Chunk recebido (antes de processar):', chunk);

            const chunkText = await chunk.text();
            console.log("Texto do chunk:", chunkText);

            fullText += chunkText;

            if (onStreamChunk) {
                console.log('Enviando chunk para o callback de streaming...');
                onStreamChunk(chunkText);
            }
        }

        return fullText;

    } catch (e) {
        console.error('Prompt falhou:', e);
        throw e;
    }
}