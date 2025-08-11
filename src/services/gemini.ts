const GEMINI_API_KEY = 'AIzaSyDPV8Y1PIXOmYfzu38u1fyyWE3UPBETf8U';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function generateResponse(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content.parts[0]?.text || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Sorry, there was an error processing your request.';
  }
}

export async function generateImageResponse(prompt: string, imageBase64: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content.parts[0]?.text || 'Sorry, I could not analyze the image.';
  } catch (error) {
    console.error('Error calling Gemini API with image:', error);
    return 'Sorry, there was an error processing the image.';
  }
}