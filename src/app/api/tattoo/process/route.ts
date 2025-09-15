import { NextRequest, NextResponse } from 'next/server';
import { validateFileContent, validateFileName } from '@/lib/file-security';
import { TattooProcessor } from '@/lib/services/tattoo-processor';
import { CreditsService } from '@/lib/services/credits-service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const maxDuration = 60; // 60 seconds for Vercel Pro
export const dynamic = 'force-dynamic';

type TattooMode = 'add' | 'remove' | 'enhance';

async function tattooProcessHandler(request: NextRequest, userId: string) {
  let reservationId: string | null = null;

  try {

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

    // Validate file names for security
    const bodyFileNameValidation = validateFileName(bodyImageFile.name);
    if (!bodyFileNameValidation.isValid) {
      return NextResponse.json(
        { error: `Nome de arquivo inválido: ${bodyFileNameValidation.error}` },
        { status: 400 }
      );
    }

    if (tattooImageFile) {
      const tattooFileNameValidation = validateFileName(tattooImageFile.name);
      if (!tattooFileNameValidation.isValid) {
        return NextResponse.json(
          { error: `Nome de arquivo da tatuagem inválido: ${tattooFileNameValidation.error}` },
          { status: 400 }
        );
      }
    }

    // Convert files to buffers for content validation
    const bodyImageBuffer = await bodyImageFile.arrayBuffer();
    const tattooImageBuffer = tattooImageFile ? await tattooImageFile.arrayBuffer() : null;

    // Validate body image content
    const bodyValidation = validateFileContent(bodyImageBuffer, {
      maxSize: 15 * 1024 * 1024, // 15MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      strictValidation: true,
      scanContent: true
    });

    if (!bodyValidation.isValid) {
      return NextResponse.json(
        { error: `Imagem do corpo inválida: ${bodyValidation.error}` },
        { status: 400 }
      );
    }

    // Log security warnings if any
    if (bodyValidation.securityWarnings?.length) {
      console.warn('Body image security warnings:', bodyValidation.securityWarnings);
    }

    // Validate tattoo image content if provided
    if (tattooImageBuffer) {
      const tattooValidation = validateFileContent(tattooImageBuffer, {
        maxSize: 15 * 1024 * 1024, // 15MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        strictValidation: true,
        scanContent: true
      });

      if (!tattooValidation.isValid) {
        return NextResponse.json(
          { error: `Imagem da tatuagem inválida: ${tattooValidation.error}` },
          { status: 400 }
        );
      }

      // Log security warnings if any
      if (tattooValidation.securityWarnings?.length) {
        console.warn('Tattoo image security warnings:', tattooValidation.securityWarnings);
      }
    }

    // Convert validated buffers to Buffer objects for processing
    const bodyImageBuf = Buffer.from(bodyImageBuffer);
    const tattooImageBuf = tattooImageBuffer ? Buffer.from(tattooImageBuffer) : null;

    // Process the tattoo
    const processingResult = await TattooProcessor.processTattoo(
      mode,
      bodyImageBuf,
      tattooImageBuf,
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

    // Validate image buffer exists
    if (!processingResult.imageBuffer) {
      // Rollback credit reservation if no image buffer
      if (reservationId) {
        try {
          await CreditsService.rollbackCreditReservation(userId, reservationId);
        } catch (rollbackError) {
          console.error('Error rolling back credit reservation:', rollbackError);
        }
      }

      return NextResponse.json(
        { error: 'Erro no processamento: imagem não gerada' },
        { status: 500 }
      );
    }

    // Return the processed image
    const imageBuffer = processingResult.imageBuffer;

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
        await CreditsService.rollbackCreditReservation(userId, reservationId);
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

export async function POST(request: NextRequest) {
  // Apply auth middleware manually
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  return tattooProcessHandler(request, session.user.id);
}