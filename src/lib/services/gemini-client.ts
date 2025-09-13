import { GoogleGenAI } from '@google/genai';
import mime from 'mime';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

export const geminiAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

export const MODEL_NAME = 'gemini-2.5-flash-image-preview';

export interface GeminiConfig {
  responseModalities: ('IMAGE' | 'TEXT')[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
  };
}

export const defaultConfig: GeminiConfig = {
  responseModalities: ['IMAGE', 'TEXT'],
  generationConfig: {
    temperature: 0.4, // Lower for more consistency
    topK: 32,
    topP: 0.8,
  },
};

export interface ImageProcessingResult {
  success: boolean;
  imageBuffer?: Buffer;
  mimeType?: string;
  textResponse?: string;
  error?: string;
  retryAfter?: number; // seconds to wait before retrying
  isRateLimited?: boolean;
}

export interface ImageAnalysisResult {
  success: boolean;
  bodyPartDetected?: string;
  tattooLocation?: string;
  suitable?: boolean;
  issues?: string[];
  error?: string;
  retryAfter?: number;
  isRateLimited?: boolean;
}

// Helper function to wait for a specific duration
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse retry delay from error response
function parseRetryDelay(error: Error): number {
  try {
    const errorData = JSON.parse(error.message);
    const retryInfo = errorData.error?.details?.find((detail: { '@type': string }) => 
      detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
    );
    if (retryInfo?.retryDelay) {
      const delayStr = retryInfo.retryDelay.replace('s', '');
      return parseInt(delayStr, 10) || 60; // default 60 seconds
    }
  } catch {
    // Ignore parse errors
  }
  return 60; // default retry delay
}

export async function processImageWithGemini(
  prompt: string,
  images: { data: string; mimeType: string }[],
  config: GeminiConfig = defaultConfig,
  maxRetries: number = 2
): Promise<ImageProcessingResult> {
  let lastError: Error = new Error('No error occurred');
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Use Advanced Composition format: images first, then prompt
      const contents = [
        {
          role: 'user' as const,
          parts: [
            // All images first
            ...images.map(img => ({
              inlineData: {
                mimeType: img.mimeType,
                data: img.data
              }
            })),
            // Then the text prompt
            { text: prompt }
          ],
        },
      ];

      const response = await geminiAI.models.generateContentStream({
        model: MODEL_NAME,
        config,
        contents,
      });

      let textResponse = '';
      let imageBuffer: Buffer | undefined;
      let imageMimeType: string | undefined;

      for await (const chunk of response) {
        if (!chunk.candidates?.[0]?.content?.parts) {
          continue;
        }

        const parts = chunk.candidates[0].content.parts;
        
        for (const part of parts) {
          if (part.inlineData) {
            // Image response
            imageBuffer = Buffer.from(part.inlineData.data || '', 'base64');
            imageMimeType = part.inlineData.mimeType;
          } else if (part.text) {
            // Text response
            textResponse += part.text;
          }
        }
      }

      return {
        success: true,
        imageBuffer,
        mimeType: imageMimeType,
        textResponse: textResponse || undefined,
      };

    } catch (error: unknown) {
      lastError = error as Error;
      console.error(`Gemini API Error (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      
      // Check if it's a rate limit error
      const errorObj = error as { status?: number; code?: number };
      if (errorObj.status === 429 || errorObj.code === 429) {
        const retryDelay = parseRetryDelay(lastError);
        
        if (attempt < maxRetries) {
          console.log(`Rate limited. Waiting ${retryDelay} seconds before retry...`);
          await wait(retryDelay * 1000);
          continue;
        } else {
          // Final attempt, return rate limit info
          return {
            success: false,
            error: 'Cota da API excedida. Tente novamente em alguns minutos.',
            isRateLimited: true,
            retryAfter: retryDelay,
          };
        }
      }
      
      // For non-rate-limit errors, don't retry
      break;
    }
  }

  // Return the last error if all attempts failed
  return {
    success: false,
    error: lastError instanceof Error ? lastError.message : 'Erro desconhecido na API do Gemini',
  };
}

export function getMimeType(buffer: Buffer): string {
  // Simple mime type detection based on buffer headers
  const header = buffer.toString('hex', 0, 4);
  
  switch (header) {
    case '89504e47':
      return 'image/png';
    case 'ffd8ffe0':
    case 'ffd8ffe1':
    case 'ffd8ffe2':
      return 'image/jpeg';
    case '47494638':
      return 'image/gif';
    case '52494646':
      return 'image/webp';
    default:
      return 'image/png'; // default fallback
  }
}

export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

export async function analyzeImagesWithGemini(
  bodyImage: { data: string; mimeType: string },
  tattooImage?: { data: string; mimeType: string },
  maxRetries: number = 2
): Promise<ImageAnalysisResult> {
  let lastError: Error = new Error('No error occurred');
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const contents = [
        {
          role: 'user' as const,
          parts: [
            {
              inlineData: {
                mimeType: bodyImage.mimeType,
                data: bodyImage.data
              }
            },
            ...(tattooImage ? [{
              inlineData: {
                mimeType: tattooImage.mimeType,
                data: tattooImage.data
              }
            }] : []),
            {
              text: `Analyze these images and provide ONLY a JSON response:

For the first image (person): 
- What body part is most prominently visible and suitable for tattoo application?
- Is the image quality good enough for tattoo processing?

${tattooImage ? `For the second image (tattoo reference):
- Where is the tattoo located on this person?
- What is the general style of the tattoo?` : ''}

Respond ONLY with JSON in this exact format:
{
  "bodyPartDetected": "arm|forearm|shoulder|back|chest|leg|neck|hand|face",
  ${tattooImage ? '"tattooLocation": "specific location of existing tattoo",' : ''}
  "suitable": true|false,
  "issues": ["list any quality or suitability issues"],
  "confidence": 0.0-1.0
}

No explanations, just the JSON object.`
            }
          ],
        },
      ];

      const response = await geminiAI.models.generateContent({
        model: MODEL_NAME,
        config: {
          responseModalities: ['TEXT'], // Text-only response for analysis
        },
        contents,
      });

      const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        // Parse JSON response
        const analysis = JSON.parse(textResponse.trim());
        
        return {
          success: true,
          bodyPartDetected: analysis.bodyPartDetected,
          tattooLocation: analysis.tattooLocation,
          suitable: analysis.suitable,
          issues: analysis.issues || [],
        };
      } catch (parseError) {
        console.error('Failed to parse analysis JSON:', textResponse);
        throw new Error('Invalid JSON response from analysis');
      }

    } catch (error: unknown) {
      lastError = error as Error;
      console.error(`Gemini Analysis Error (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      
      // Check if it's a rate limit error
      const errorObj = error as { status?: number; code?: number };
      if (errorObj.status === 429 || errorObj.code === 429) {
        const retryDelay = parseRetryDelay(lastError);
        
        if (attempt < maxRetries) {
          console.log(`Analysis rate limited. Waiting ${retryDelay} seconds before retry...`);
          await wait(retryDelay * 1000);
          continue;
        } else {
          return {
            success: false,
            error: 'Cota da API excedida para análise. Tente novamente em alguns minutos.',
            isRateLimited: true,
            retryAfter: retryDelay,
          };
        }
      }
      
      // For non-rate-limit errors, don't retry
      break;
    }
  }

  return {
    success: false,
    error: lastError instanceof Error ? lastError.message : 'Erro desconhecido na análise das imagens',
  };
}