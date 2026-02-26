import { GoogleGenAI } from '@google/genai';
import { getConfig } from './config.js';

const REQUEST_TIMEOUT_MS = 15000;
let aiClient = null;
const MODEL_NAME = 'gemini-2.5-flash-lite';

// Inicializa o cliente apenas uma vez
async function initModel() {
    if (!aiClient) {
        const config = await getConfig();
        if (!config.apiKey) {
            // Do not manipulate UI from this module. Throw a clear error
            // so callers (content scripts) can handle it and notify the user
            // via the extension popup instead of showing in-page errors.
            throw new Error('API key not configured. Please set your API key in the extension settings.');
        }
        aiClient = new GoogleGenAI({ apiKey: config.apiKey });
    }
    return aiClient;
}

// Helper to add a timeout to API calls to avoid hanging forever
async function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('API request timed out')), ms);
    });
    try {
        return await Promise.race([promise, timeout]);
    } finally {
        clearTimeout(timer);
    }
}

//Função Princial para rodar os prompts do meaningdiv
export async function runPrompt(prompt, onStreamChunk = null) {
    try {
        const ai = await initModel();

        // The newer SDK returns output in a nested structure; for streaming
        // we fall back to a single-chunk callback to keep behavior consistent.
        const contents = [{ text: prompt }];

        const result = await withTimeout(ai.models.generateContent({ model: MODEL_NAME, contents }), REQUEST_TIMEOUT_MS);

        // Try multiple paths to access the text
        const fullText = result?.text || 
                        result?.output?.[0]?.content?.[0]?.text || 
                        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
                        result?.response?.text() || 
                        '';
        
        if (onStreamChunk) {
            if (fullText) {
                onStreamChunk(fullText);
            } else {
                onStreamChunk('Erro: sem resposta da API.');
            }
        }
        return fullText;
    } catch (e) {
        console.error('Erro ao executar prompt:', e);
        throw e;
    }
}

//Função que funciona como OCR
export async function extractTextFromImage(imageDataURL) {
    try {
        const ai = await initModel();

        const image_parts = imageDataURL.split(',');
        const image_base64 = image_parts[1];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await withTimeout(ai.models.generateContent({
            model: MODEL_NAME,
            contents: [
                { inlineData: { data: image_base64, mimeType: 'image/png' } },
                { text: `Escreva nada além do texto dessa imagem sem traduzir no idioma que é visto. Se não tiver texto, retorne vazio.` }
            ]
        }), REQUEST_TIMEOUT_MS);

        clearTimeout(timeoutId);

        const extractedText = response?.text || 
                             response?.output?.[0]?.content?.[0]?.text || 
                             response?.candidates?.[0]?.content?.parts?.[0]?.text || 
                             response?.response?.text() || 
                             "";

        if (!extractedText) {
            console.error("Não foi possível extrair o texto da imagem.");
            // Return empty so callers can handle; throwing would also be fine
            return "";
        }

        return extractedText;
    } catch (error) {
        console.error("Erro na API GenAI (extractTextFromImage):", error);
        throw error;
    }
}
