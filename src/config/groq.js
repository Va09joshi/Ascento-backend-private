import Groq from 'groq-sdk';

let groqInstance = null;

if (process.env.GROQ_API_KEY) {
  groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export default groqInstance;
