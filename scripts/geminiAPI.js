import { GoogleGenerativeAI } from '@google/generative-ai';
import { getConfig } from './config.js';

const REQUEST_TIMEOUT_MS = 10000;
let model = null;

// Inicializa o modelo apenas uma vez
async function initModel() {
    if (!model) {
        const config = await getConfig();
        const genAI = new GoogleGenerativeAI(config.apiKey);

        model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 1
            }
        });
    }
    return model;
}

//Função Princial para rodar os prompts do meaningdiv
export async function runPrompt(prompt, onStreamChunk = null) {
    try {
        await initModel();

        if (onStreamChunk) {
            const result = await model.generateContentStream(prompt);
            let fullText = '';
            for await (const chunk of result.stream) {
                const chunkText = await chunk.text();
                fullText += chunkText;
                onStreamChunk(chunkText);
            }
            return fullText;
        } else {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }

    } catch (e) {
        console.error('Erro ao executar prompt:', e);
        throw e;
    }
}

//Função que funciona como OCR
export async function extractTextFromImage(imageDataURL) {
    try {
        await initModel();

        const image_parts = imageDataURL.split(",");
        const image_base64 = image_parts[1];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await model.generateContent([
            { inlineData: { data: image_base64, mimeType: 'image/png' } },
            { text: `Escreva nada além do texto dessa imagem sem traduzir no idioma que é visto. Se não tiver texto, retorne vazio.` }
        ], { signal: controller.signal });

        clearTimeout(timeoutId); // Limpa o timeout se a requisição for bem-sucedida

        const extractedText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";


        if (!extractedText) {
            console.error("Não foi possível extrair o texto da imagem.");
            throw new Error("Falha na extração de texto da imagem.");
        }

        return extractedText;

    } catch (error) {
        console.error("Erro na API Gemini (extractTextFromImage):", error);
        throw error;
    }
}
