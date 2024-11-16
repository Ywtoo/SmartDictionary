import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory
  } from '@google/generative-ai';
  import { getConfig } from './config.js';
  
  let model = null;
  
  export async function initModel() {
      const config = await getConfig();
      const genAI = new GoogleGenerativeAI(config.apiKey);
      
      model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
              temperature: 0.7
          }
      });
      
      return model;
  }
  
  export async function runPrompt(prompt) {
    console.log('Api Chamada')
      try {
          if (!model) {
              await initModel();
          }
          console.log('esperando API')
          const result = await model.generateContent(prompt);
          const response = await result.response;
          console.log('Resposta pronta')
          return response.text();
      } catch (e) {
          console.error('Prompt failed:', e);
          throw e;
      }
  }