import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 120000, // 2 minutes
});

export default openai;