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
      console.log(config.apiKey)
      
      model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
              temperature: 0.5
          }
      });
      
      return model;
  }
  
  export async function runPrompt(prompt) {
      try {
          if (!model) {
              await initModel();
          }
          const result = await model.generateContent(prompt);
          const response = await result.response;
          return response.text();
      } catch (e) {
          console.error('Prompt failed:', e);
          throw e;
      }
  }