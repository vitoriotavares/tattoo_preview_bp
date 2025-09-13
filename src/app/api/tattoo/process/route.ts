import { NextRequest, NextResponse } from 'next/server';
import { TattooProcessor } from '@/lib/services/tattoo-processor';
import { CreditsService } from '@/lib/services/credits-service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const maxDuration = 60; // 60 seconds for Vercel Pro
export const dynamic = 'force-dynamic';

type TattooMode = 'add' | 'remove' | 'enhance';

export async function POST(request: NextRequest) {
  let reservationId: string | null = null;
  
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Reserve credit first (secure transaction)
    const creditReservation = await CreditsService.reserveCredit(userId);
    if (!creditReservation.success) {
      return NextResponse.json(
        { error: creditReservation.error || 'Créditos insuficientes' }, 
        { status: 402 } // Payment Required
      );
    }

    reservationId = creditReservation.reservationId!;

    // Parse form data
    const formData = await request.formData();
    const mode = formData.get('mode') as TattooMode;
    const bodyImageFile = formData.get('bodyImage') as File;
    const tattooImageFile = formData.get('tattooImage') as File | null;
    
    // Parse processing options
    const bodyPart = (formData.get('bodyPart') as string) || 'arm';
    const size = parseInt((formData.get('size') as string) || '100');
    const position = (formData.get('position') as string) || 'center';
    const rotation = parseInt((formData.get('rotation') as string) || '0');
    const style = (formData.get('style') as string) || 'realistic';

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

    // Validate file sizes (max 15MB each - increased for compressed images)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (bodyImageFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Imagem do corpo muito grande (máximo 15MB). Tente comprimir a imagem ou usar uma foto menor.' },
        { status: 413 } // Request Entity Too Large
      );
    }

    if (tattooImageFile && tattooImageFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Imagem da tatuagem muito grande (máximo 15MB). Tente comprimir a imagem ou usar uma foto menor.' },
        { status: 413 } // Request Entity Too Large
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
        bodyPart,
        size,
        position,
        rotation,
        style
      }
    );

    if (!processingResult.success) {
      // Rollback credit reservation on processing failure
      if (reservationId) {
        try {
          await CreditsService.rollbackCreditReservation(userId, reservationId);
        } catch (rollbackError) {
          console.error('Error rolling back credit reservation:', rollbackError);
        }
      }

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

    // Confirm credit consumption after successful processing
    try {
      await CreditsService.confirmCreditConsumption(userId, reservationId);
    } catch (creditError) {
      console.error('Error confirming credit consumption:', creditError);
      // Continue anyway since image was processed successfully - user gets the image
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
    
    // Rollback credit reservation on any error
    if (reservationId) {
      try {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        if (session?.user?.id) {
          await CreditsService.rollbackCreditReservation(session.user.id, reservationId);
        }
      } catch (rollbackError) {
        console.error('Error rolling back credit reservation in catch:', rollbackError);
      }
    }
    
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