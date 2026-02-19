import { GoogleGenerativeAI } from "@google/generative-ai"; 


const ai = new GoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY as string,
});

export default ai;