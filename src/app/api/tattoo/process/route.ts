import { NextRequest, NextResponse } from 'next/server';
import { TattooProcessor } from '@/lib/services/tattoo-processor';
import { CreditsService } from '@/lib/services/credits-service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const maxDuration = 60; // 60 seconds for Vercel Pro
export const dynamic = 'force-dynamic';

type TattooMode = 'add' | 'remove' | 'enhance';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user has available credits
    const userCredits = await CreditsService.getUserCredits(userId);
    if (!userCredits || userCredits.availableCredits <= 0) {
      return NextResponse.json(
        { error: 'Créditos insuficientes' }, 
        { status: 402 } // Payment Required
      );
    }

    // Parse form data
    const formData = await request.formData();
    const mode = formData.get('mode') as TattooMode;
    const bodyImageFile = formData.get('bodyImage') as File;
    const tattooImageFile = formData.get('tattooImage') as File | null;

    // Validate required fields
    if (!mode || !bodyImageFile) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: mode, bodyImage' },
        { status: 400 }
      );
    }

    if (!['add', 'remove', 'enhance'].includes(mode)) {
      return NextResponse.json(
        { error: 'Modo inválido. Use: add, remove, enhance' },
        { status: 400 }
      );
    }

    // For 'add' mode, tattoo image is required
    if (mode === 'add' && !tattooImageFile) {
      return NextResponse.json(
        { error: 'Imagem da tatuagem é obrigatória para modo "add"' },
        { status: 400 }
      );
    }

    // Validate file sizes (max 10MB each)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (bodyImageFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Imagem do corpo muito grande (máximo 10MB)' },
        { status: 400 }
      );
    }

    if (tattooImageFile && tattooImageFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Imagem da tatuagem muito grande (máximo 10MB)' },
        { status: 400 }
      );
    }

    // Convert files to buffers
    const bodyImageBuffer = Buffer.from(await bodyImageFile.arrayBuffer());
    const tattooImageBuffer = tattooImageFile 
      ? Buffer.from(await tattooImageFile.arrayBuffer())
      : null;

    // Process the tattoo
    const processingResult = await TattooProcessor.processTattoo(
      mode,
      bodyImageBuffer,
      tattooImageBuffer,
      {
        // Optional parameters can be added here
        bodyPart: 'arm',
        size: 100,
        position: 'center'
      }
    );

    if (!processingResult.success) {
      // Handle rate limiting specifically
      if (processingResult.isRateLimited) {
        return NextResponse.json(
          { 
            error: processingResult.error,
            retryAfter: processingResult.retryAfter,
            isRateLimited: true 
          },
          { 
            status: 429,
            headers: {
              'Retry-After': processingResult.retryAfter?.toString() || '60'
            }
          }
        );
      }

      return NextResponse.json(
        { error: processingResult.error || 'Erro no processamento da imagem' },
        { status: 500 }
      );
    }

    // Deduct credit from user
    try {
      await CreditsService.consumeCredit(userId);
    } catch (creditError) {
      console.error('Error deducting credits:', creditError);
      // Continue anyway since image was processed successfully
    }

    // Return the processed image
    const imageBuffer = processingResult.imageBuffer!;
    
    return new Response(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': processingResult.mimeType || 'image/png',
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Processing-Time': processingResult.processingTimeMs?.toString() || '0'
      }
    });

  } catch (error) {
    console.error('Tattoo processing error:', error);
    
    // Return more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Processamento demorou muito. Tente com uma imagem menor.' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}