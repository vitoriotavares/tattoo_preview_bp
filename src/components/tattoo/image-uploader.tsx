"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, FileImage } from "lucide-react";
import Image from "next/image";

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

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: { file: File; errors: { code: string; message: string }[] }[]) => {
    setError(null);
    setIsDragActive(false);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e) => e.code === 'file-too-large')) {
        setError(`Arquivo muito grande. Máximo permitido: ${maxSize}MB`);
      } else if (rejection.errors.some((e) => e.code === 'file-invalid-type')) {
        setError(`Formato não suportado. Use: ${accept.map(type => type.split('/')[1]).join(', ')}`);
      } else {
        setError('Erro no upload do arquivo');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        const previewUrl = reader.result as string;
        setPreview(previewUrl);
        onImageSelect(file, previewUrl);
      };
      
      reader.readAsDataURL(file);
    }
  }, [accept, maxSize, onImageSelect]);

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneIsDragActive
  } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSize * 1024 * 1024,
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  const handleRemove = () => {
    setPreview(null);
    setError(null);
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
          className={`border-2 border-dashed transition-colors cursor-pointer hover:border-primary/50 ${
            isDragActive || dropzoneIsDragActive 
              ? 'border-primary bg-primary/5' 
              : error 
                ? 'border-destructive' 
                : 'border-muted-foreground/25'
          }`}
        >
          <CardContent className="p-8">
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