import { GoogleGenerativeAI } from '@google/generative-ai';
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

//Função Princial para rodar os prompts
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

export async function getGeminiText(imageDataURL, model) {
    try {
        const image_parts = imageDataURL.split(",");
        const image_base64 = image_parts[1]; // Só precisa dos dados base64
        console.log(image_base64)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await model.generateContent([
            {
                inlineData: {
                    data: image_base64,
                    mimeType: 'image/png' // Ou o tipo MIME correto
                }
            },
            {
                text: `Escreva nada alem do texto dessa imagem. Se não tiver texto, retorne vazio.`
            }
        ]);

        // ----> LOG DETALHADO <----
        console.log("Resposta completa do Gemini (estrutura detalhada):", JSON.stringify(response, null, 2));

        // Extrair o texto CORRETAMENTE
        const extractedText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  
        if (!extractedText) {
          console.error("Não foi possível extrair o texto da resposta do Gemini. Resposta:", JSON.stringify(response, null, 2));
          throw new Error("Não foi possível extrair o texto.");
        }
  
        return extractedText;
  
    } catch (error) {
      console.error("Erro na API Gemini:", error); // Log mais descritivo
      throw error; // Relança o erro para ser tratado pelo chamador
    }
  }