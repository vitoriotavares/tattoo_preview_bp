import { processImageWithGemini, analyzeImagesWithGemini, getMimeType, bufferToBase64 } from "./gemini-client";
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
   * Perform conditional pre-analysis of images
   */
  private static async performPreAnalysis(
    bodyImageBuffer: Buffer,
    tattooImageBuffer?: Buffer,
    requestedBodyPart?: string
  ): Promise<{ bodyPart: string; analysisPerformed: boolean }> {
    // If user specified a body part other than 'auto', use it directly
    if (requestedBodyPart && requestedBodyPart !== 'auto') {
      return {
        bodyPart: requestedBodyPart,
        analysisPerformed: false
      };
    }

    try {
      console.log('Performing automatic image analysis...');
      
      // Prepare images for analysis
      const bodyImage = {
        data: bufferToBase64(bodyImageBuffer),
        mimeType: getMimeType(bodyImageBuffer)
      };
      
      const tattooImage = tattooImageBuffer ? {
        data: bufferToBase64(tattooImageBuffer),
        mimeType: getMimeType(tattooImageBuffer)
      } : undefined;

      // Perform analysis
      const analysisResult = await analyzeImagesWithGemini(bodyImage, tattooImage);
      
      if (analysisResult.success && analysisResult.bodyPartDetected) {
        console.log(`Detected body part: ${analysisResult.bodyPartDetected}`);
        return {
          bodyPart: analysisResult.bodyPartDetected,
          analysisPerformed: true
        };
      } else {
        console.warn('Analysis failed, using fallback body part');
        return {
          bodyPart: 'arm', // fallback
          analysisPerformed: true
        };
      }
    } catch (error) {
      console.error('Pre-analysis error:', error);
      return {
        bodyPart: 'arm', // fallback
        analysisPerformed: false
      };
    }
  }

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
    return `Create a professional tattoo application photo. You have received:

FIRST IMAGE: Person's photo showing their ${bodyPart}
SECOND IMAGE: Tattoo design reference

TASK: Apply the tattoo design from the second image to the person's ${bodyPart} shown in the first image.

ADVANCED COMPOSITION INSTRUCTIONS:
1. EXTRACT the tattoo design from wherever it appears in the reference image
2. ADAPT the design size and orientation to fit naturally on the person's ${bodyPart}
3. APPLY with photorealistic integration matching the lighting and perspective

SPECIFICATIONS:
- Target location: ${bodyPart}
- Size: ${size}% of the ${bodyPart} area
- Position: ${position} of the ${bodyPart}
- Style: ${style} tattoo appearance
- Rotation: ${rotation} degrees following natural body contours

QUALITY STANDARDS:
✓ Natural skin texture integration with pores and fine details
✓ Proper perspective matching body contours of the ${bodyPart}
✓ Realistic ink saturation as if recently healed (not fresh)
✓ Appropriate shadows and highlights matching ambient lighting
✓ Seamless blending with existing skin tone variations
✓ Preserve natural marks (moles, freckles, scars) around the area

CRITICAL REQUIREMENTS:
• DO NOT copy the placement from the reference image
• DO copy the design and apply it to the specified ${bodyPart}
• Maintain original image aspect ratio and proportions
• Result should look like professional tattoo portfolio photography

Generate a high-quality, photorealistic result showing the person with the tattoo design beautifully integrated into their ${bodyPart}.`;
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
      // Perform conditional pre-analysis
      const analysis = await this.performPreAnalysis(
        bodyImageBuffer,
        tattooImageBuffer,
        options.bodyPart
      );

      console.log(`Using body part: ${analysis.bodyPart} (analysis: ${analysis.analysisPerformed ? 'auto-detected' : 'user-specified'})`);

      // Preprocess images
      const processedBodyImage = await this.preprocessImage(bodyImageBuffer);
      const processedTattooImage = await this.preprocessImage(tattooImageBuffer);

      // Generate prompt with detected/specified body part
      const prompt = this.generateAddTattooPrompt(
        analysis.bodyPart,
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
        console.error('Gemini processing failed:', result.error);
        return {
          success: false,
          error: result.error || 'Erro no processamento da IA',
          processingTimeMs,
          isRateLimited: result.isRateLimited,
          retryAfter: result.retryAfter
        };
      }

      // Additional validation for successful response
      if (!result.imageBuffer) {
        console.error('Gemini returned success but no image buffer');
        return {
          success: false,
          error: 'Processamento incompleto: imagem não gerada pela IA',
          processingTimeMs
        };
      }

      console.log(`Image processing completed successfully in ${processingTimeMs}ms`);
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
        console.error('Gemini processing failed:', result.error);
        return {
          success: false,
          error: result.error || 'Erro no processamento da IA',
          processingTimeMs,
          isRateLimited: result.isRateLimited,
          retryAfter: result.retryAfter
        };
      }

      // Additional validation for successful response
      if (!result.imageBuffer) {
        console.error('Gemini returned success but no image buffer');
        return {
          success: false,
          error: 'Processamento incompleto: imagem não gerada pela IA',
          processingTimeMs
        };
      }

      console.log(`Image processing completed successfully in ${processingTimeMs}ms`);
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
        console.error('Gemini processing failed:', result.error);
        return {
          success: false,
          error: result.error || 'Erro no processamento da IA',
          processingTimeMs,
          isRateLimited: result.isRateLimited,
          retryAfter: result.retryAfter
        };
      }

      // Additional validation for successful response
      if (!result.imageBuffer) {
        console.error('Gemini returned success but no image buffer');
        return {
          success: false,
          error: 'Processamento incompleto: imagem não gerada pela IA',
          processingTimeMs
        };
      }

      console.log(`Image processing completed successfully in ${processingTimeMs}ms`);
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