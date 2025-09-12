"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, FileImage, Loader2 } from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

interface ImageUploaderProps {
  label: string;
  description?: string;
  accept?: string[];
  maxSize?: number; // in MB
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove?: () => void;
  currentImage?: string;
  className?: string;
  required?: boolean;
}

export function ImageUploader({
  label,
  description,
  accept = ["image/jpeg", "image/png", "image/webp"],
  maxSize = 10,
  onImageSelect,
  onImageRemove,
  currentImage,
  className = "",
  required = false
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  // Image compression function
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 5, // Compress to max 5MB
      maxWidthOrHeight: 2048, // Max dimension 2048px
      useWebWorker: true,
      initialQuality: 0.8,
      onProgress: (progress: number) => {
        setCompressionProgress(Math.round(progress));
      },
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
      return compressedFile;
    } catch (error) {
      console.error('Image compression failed:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError(null);
    setIsDragActive(false);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e) => e.code === 'file-too-large')) {
        // If file is too large, try to compress it anyway
        const originalFile = rejection.file;
        if (originalFile.size > maxSize * 1024 * 1024 && originalFile.size < 50 * 1024 * 1024) {
          // Only try compression if file is between maxSize and 50MB
          try {
            setIsCompressing(true);
            setCompressionProgress(0);
            
            const compressedFile = await compressImage(originalFile);
            
            if (compressedFile.size <= maxSize * 1024 * 1024) {
              // Compression successful, use compressed file
              const reader = new FileReader();
              reader.onload = () => {
                const previewUrl = reader.result as string;
                setPreview(previewUrl);
                onImageSelect(compressedFile, previewUrl);
                setIsCompressing(false);
                setCompressionProgress(0);
              };
              reader.readAsDataURL(compressedFile);
              return;
            } else {
              setError(`Arquivo muito grande mesmo após compressão. Máximo permitido: ${maxSize}MB`);
            }
          } catch (compressionError) {
            console.error('Compression failed:', compressionError);
            setError(`Arquivo muito grande. Máximo permitido: ${maxSize}MB`);
          } finally {
            setIsCompressing(false);
            setCompressionProgress(0);
          }
        } else {
          setError(`Arquivo muito grande. Máximo permitido: ${maxSize}MB`);
        }
      } else if (rejection.errors.some((e) => e.code === 'file-invalid-type')) {
        setError(`Formato não suportado. Use: ${accept.map(type => type.split('/')[1]).join(', ')}`);
      } else {
        setError('Erro no upload do arquivo');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Always compress camera photos (usually large files)
      if (file.size > 2 * 1024 * 1024) { // If file is larger than 2MB, compress it
        try {
          setIsCompressing(true);
          setCompressionProgress(0);
          
          const compressedFile = await compressImage(file);
          
          const reader = new FileReader();
          reader.onload = () => {
            const previewUrl = reader.result as string;
            setPreview(previewUrl);
            onImageSelect(compressedFile, previewUrl);
            setIsCompressing(false);
            setCompressionProgress(0);
          };
          reader.readAsDataURL(compressedFile);
        } catch (compressionError) {
          console.error('Compression failed:', compressionError);
          setError('Erro ao processar a imagem');
          setIsCompressing(false);
          setCompressionProgress(0);
        }
      } else {
        // File is small enough, use as-is
        const reader = new FileReader();
        reader.onload = () => {
          const previewUrl = reader.result as string;
          setPreview(previewUrl);
          onImageSelect(file, previewUrl);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [accept, maxSize, onImageSelect]);

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneIsDragActive
  } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: 50 * 1024 * 1024, // Allow up to 50MB initially, we'll compress if needed
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    setIsCompressing(false);
    setCompressionProgress(0);
    onImageRemove?.();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </h3>
        <Badge variant="secondary" className="text-xs">
          Max {maxSize}MB
        </Badge>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {!preview ? (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            isCompressing 
              ? 'border-blue-500 bg-blue-50' 
              : isDragActive || dropzoneIsDragActive 
                ? 'border-primary bg-primary/5 cursor-pointer hover:border-primary/50' 
                : error 
                  ? 'border-destructive' 
                  : 'border-muted-foreground/25 cursor-pointer hover:border-primary/50'
          }`}
        >
          <CardContent className="p-8">
            {isCompressing ? (
              // Compression Progress UI
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 p-3 rounded-full bg-blue-100">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-900">
                    Comprimindo imagem...
                  </p>
                  <p className="text-xs text-blue-700">
                    Otimizando para melhor qualidade e velocidade
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full max-w-xs bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${compressionProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-600 font-medium">
                    {compressionProgress}%
                  </p>
                </div>
              </div>
            ) : (
              // Upload UI
              <div 
                {...getRootProps()}
                className="flex flex-col items-center justify-center text-center"
              >
                <input {...getInputProps()} />
                
                <div className={`mb-4 p-3 rounded-full ${
                  isDragActive || dropzoneIsDragActive 
                    ? 'bg-primary/10' 
                    : 'bg-muted'
                }`}>
                  <Upload className={`h-8 w-8 ${
                    isDragActive || dropzoneIsDragActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`} />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {isDragActive || dropzoneIsDragActive 
                      ? "Solte a imagem aqui" 
                      : "Arraste uma imagem ou clique para selecionar"
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos: {accept.map(type => type.split('/')[1].toUpperCase()).join(', ')} • Máximo {maxSize}MB
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    📱 Fotos de câmera são comprimidas automaticamente
                  </p>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Image Preview */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Image Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium truncate">
                      Imagem selecionada
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pronto para processamento
                    </p>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Imagem válida
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
          {error}
        </div>
      )}
    </div>
  );
}