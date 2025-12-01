import { GoogleGenAI } from "@google/genai";

export const generateMissionReport = async (password: number, totalSteps: number, matchedSteps: number) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are the Chief Security Officer for Santa's Workshop. 
    An agent has just successfully bypassed the decoy safe dial mechanism at the Secret Entrance.
    
    Here is the mission data:
    - Total Dial Rotations Executed: ${totalSteps}
    - Times Dial Landed on '0' (The Password): ${password}
    - Number of Critical Intercepts: ${matchedSteps}

    Write a short, immersive, and slightly humorous "Security Clearance Log" confirming their access. 
    Use a tech-noir / Christmas sci-fi tone. 
    Mention that the '0' alignment was the key.
    Keep it under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful and thematic AI assistant for a Christmas puzzle app.",
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ACCESS GRANTED. (Automated report system offline due to solar flare).";
  }
};
