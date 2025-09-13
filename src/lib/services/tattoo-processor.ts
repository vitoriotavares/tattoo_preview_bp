import { processImageWithGemini, getMimeType, bufferToBase64 } from "./gemini-client";
import sharp from "sharp";

export type TattooMode = 'add' | 'remove' | 'enhance';

export interface TattooProcessingOptions {
  bodyPart?: string;
  size?: number; // percentage
  position?: string;
  rotation?: number; // degrees
  style?: string;
}

export interface TattooProcessingResult {
  success: boolean;
  imageBuffer?: Buffer;
  mimeType?: string;
  processingTimeMs?: number;
  error?: string;
  retryAfter?: number; // seconds to wait before retrying
  isRateLimited?: boolean;
}

export class TattooProcessor {
  
  /**
   * Generate optimized prompt for adding tattoo
   */
  private static generateAddTattooPrompt(
    bodyPart: string = "arm",
    size: number = 100,
    position: string = "center",
    rotation: number = 0,
    style: string = "realistic"
  ): string {
    return `TATTOO TRANSFER TASK:
You will receive TWO images:
1. PERSON IMAGE: Shows the person where the tattoo should be applied
2. TATTOO REFERENCE IMAGE: Shows the tattoo design on any body part

CRITICAL INSTRUCTION: Transfer the tattoo design from the reference image to the EXACT body part specified (${bodyPart}) on the person, regardless of where it appears in the reference image.

MAPPING PROCESS:
- DETECT: First, identify where the tattoo is located in the reference image (face, arm, leg, back, etc.)
- EXTRACT: Carefully extract the tattoo design from its current location in the reference image
- ADAPT: Scale, rotate, and adapt the design to fit naturally on the person's ${bodyPart}
- APPLY: Place the tattoo on the person's ${bodyPart} with photorealistic integration

CRITICAL: If the reference tattoo is on a different body part than the target (${bodyPart}), you MUST adapt the design to look natural on the ${bodyPart}. For example:
- If reference shows face tattoo but target is ${bodyPart}, resize and adapt proportionally
- If reference shows large back tattoo but target is ${bodyPart}, scale down appropriately
- Always prioritize natural appearance on the target ${bodyPart} over exact replication

TARGET LOCATION: ${bodyPart}
- Size: ${size}% of the ${bodyPart} area
- Position: ${position} of the ${bodyPart}  
- Rotation: ${rotation} degrees following body curve
- Style: ${style} tattoo appearance

QUALITY REQUIREMENTS:
- Natural integration with skin texture and pores
- Proper perspective following body contours of the ${bodyPart}
- Realistic ink saturation as if freshly healed
- Appropriate shadow and highlight integration
- Seamless blending with existing skin tone
- Preserve any natural marks like moles or freckles around the area

IMPORTANT NOTES:
- Do NOT copy the placement from the reference image
- DO copy the design and apply it to the specified ${bodyPart}
- Maintain original aspect ratio and image proportions
- Professional tattoo portfolio photography quality

The final result should show the person with the tattoo design beautifully applied to their ${bodyPart}, regardless of where that design originally appeared in the reference image.`;
  }

  /**
   * Generate optimized prompt for removing tattoo
   */
  private static generateRemoveTattooPrompt(location: string = "skin"): string {
    return `Remove the tattoo from the ${location} while maintaining photorealistic skin appearance.

Requirements:
- Reconstruct underlying skin texture with natural pores and fine lines
- Match surrounding skin tone variations and patterns perfectly
- Preserve all natural body marks (moles, freckles, scars, birthmarks)
- Maintain consistent lighting and shadows across the area
- No visible artifacts, blur, smoothing, or digital editing marks
- Keep the same skin age, condition, and natural imperfections
- Ensure seamless blending with surrounding untouched skin

Technical Approach: Use advanced skin reconstruction techniques that analyze surrounding skin patterns and naturally fill the tattoo area with realistic skin texture that matches the person's natural skin characteristics.

Do not change the aspect ratio or image dimensions.
The result should look completely natural as if the tattoo never existed.`;
  }

  /**
   * Generate optimized prompt for enhancing tattoo
   */
  private static generateEnhanceTattooPrompt(style: string = "traditional"): string {
    return `Enhance and restore this existing tattoo to professional photography quality.

Adjustments needed:
- Sharpen line work to crisp black definition and clean edges
- Restore color vibrancy to fresh ink appearance 
- Fix any fading, blur, or age-related deterioration
- Enhance contrast between ink and skin for better definition
- Preserve original artistic style and design intent completely
- Apply subtle highlights to make the tattoo pop and appear fresh
- Improve overall saturation while maintaining realistic ink appearance
- Clean up any areas where the tattoo may appear washed out

Style: ${style} tattoo photography with professional lighting
Quality: High-resolution tattoo portfolio standard

Preserve: Original design, proportions, and artistic elements.
Do not change the aspect ratio or image dimensions.
Do not alter the fundamental design - only enhance and restore quality.`;
  }

  /**
   * Preprocess image for optimal Gemini processing
   */
  private static async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Convert to standard format and optimize for AI processing
      const processed = await sharp(imageBuffer)
        .jpeg({ quality: 90, progressive: false })
        .resize(2048, 2048, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .toBuffer();
      
      return processed;
    } catch (error) {
      console.error("Image preprocessing failed:", error);
      return imageBuffer; // Return original if preprocessing fails
    }
  }

  /**
   * Process tattoo with ADD mode
   */
  static async addTattoo(
    bodyImageBuffer: Buffer,
    tattooImageBuffer: Buffer,
    options: TattooProcessingOptions = {}
  ): Promise<TattooProcessingResult> {
    const startTime = Date.now();

    try {
      // Preprocess images
      const processedBodyImage = await this.preprocessImage(bodyImageBuffer);
      const processedTattooImage = await this.preprocessImage(tattooImageBuffer);

      // Generate prompt
      const prompt = this.generateAddTattooPrompt(
        options.bodyPart || "arm",
        options.size || 100,
        options.position || "center", 
        options.rotation || 0,
        options.style || "realistic"
      );

      // Prepare images for Gemini
      const images = [
        {
          data: bufferToBase64(processedBodyImage),
          mimeType: getMimeType(processedBodyImage)
        },
        {
          data: bufferToBase64(processedTattooImage), 
          mimeType: getMimeType(processedTattooImage)
        }
      ];

      // Process with Gemini
      const result = await processImageWithGemini(prompt, images);

      const processingTimeMs = Date.now() - startTime;

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          processingTimeMs,
          isRateLimited: result.isRateLimited,
          retryAfter: result.retryAfter
        };
      }

      return {
        success: true,
        imageBuffer: result.imageBuffer,
        mimeType: result.mimeType,
        processingTimeMs
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown processing error",
        processingTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Process tattoo with REMOVE mode
   */
  static async removeTattoo(
    imageBuffer: Buffer,
    options: TattooProcessingOptions = {}
  ): Promise<TattooProcessingResult> {
    const startTime = Date.now();

    try {
      // Preprocess image
      const processedImage = await this.preprocessImage(imageBuffer);

      // Generate prompt
      const prompt = this.generateRemoveTattooPrompt(
        options.bodyPart || "skin area"
      );

      // Prepare image for Gemini
      const images = [{
        data: bufferToBase64(processedImage),
        mimeType: getMimeType(processedImage)
      }];

      // Process with Gemini
      const result = await processImageWithGemini(prompt, images);

      const processingTimeMs = Date.now() - startTime;

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          processingTimeMs,
          isRateLimited: result.isRateLimited,
          retryAfter: result.retryAfter
        };
      }

      return {
        success: true,
        imageBuffer: result.imageBuffer,
        mimeType: result.mimeType,
        processingTimeMs
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown processing error",
        processingTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Process tattoo with ENHANCE mode
   */
  static async enhanceTattoo(
    imageBuffer: Buffer,
    options: TattooProcessingOptions = {}
  ): Promise<TattooProcessingResult> {
    const startTime = Date.now();

    try {
      // Preprocess image
      const processedImage = await this.preprocessImage(imageBuffer);

      // Generate prompt
      const prompt = this.generateEnhanceTattooPrompt(
        options.style || "traditional"
      );

      // Prepare image for Gemini
      const images = [{
        data: bufferToBase64(processedImage),
        mimeType: getMimeType(processedImage)
      }];

      // Process with Gemini
      const result = await processImageWithGemini(prompt, images);

      const processingTimeMs = Date.now() - startTime;

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          processingTimeMs,
          isRateLimited: result.isRateLimited,
          retryAfter: result.retryAfter
        };
      }

      return {
        success: true,
        imageBuffer: result.imageBuffer,
        mimeType: result.mimeType,
        processingTimeMs
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown processing error",
        processingTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Main processing function that routes to the appropriate method
   */
  static async processTattoo(
    mode: TattooMode,
    bodyImageBuffer: Buffer,
    tattooImageBuffer: Buffer | null,
    options: TattooProcessingOptions = {}
  ): Promise<TattooProcessingResult> {
    
    switch (mode) {
      case 'add':
        if (!tattooImageBuffer) {
          return {
            success: false,
            error: "Tattoo reference image is required for ADD mode"
          };
        }
        return this.addTattoo(bodyImageBuffer, tattooImageBuffer, options);

      case 'remove':
        return this.removeTattoo(bodyImageBuffer, options);

      case 'enhance':
        return this.enhanceTattoo(bodyImageBuffer, options);

      default:
        return {
          success: false,
          error: `Invalid processing mode: ${mode}`
        };
    }
  }
}