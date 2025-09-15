/**
 * Secure file validation utilities
 * Provides content-based file type validation and security checks
 */

export interface FileValidationResult {
  isValid: boolean;
  fileType?: string;
  error?: string;
  securityWarnings?: string[];
}

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  strictValidation?: boolean;
  scanContent?: boolean;
}

/**
 * File type signatures (magic numbers) for content-based validation
 */
const FILE_SIGNATURES = {
  // Images
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0], // JPEG JFIF
    [0xFF, 0xD8, 0xFF, 0xE1], // JPEG EXIF
    [0xFF, 0xD8, 0xFF, 0xE2], // JPEG
    [0xFF, 0xD8, 0xFF, 0xE3], // JPEG
    [0xFF, 0xD8, 0xFF, 0xE8], // JPEG
    [0xFF, 0xD8, 0xFF, 0xDB], // JPEG raw
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46, undefined, undefined, undefined, undefined, 0x57, 0x45, 0x42, 0x50], // WEBP
  ],
} as const;

/**
 * Dangerous file patterns that should be blocked
 */
const DANGEROUS_PATTERNS = [
  // Executable headers
  [0x4D, 0x5A], // PE executable (MZ)
  [0x7F, 0x45, 0x4C, 0x46], // ELF executable
  [0xCA, 0xFE, 0xBA, 0xBE], // Java class file
  [0xFE, 0xED, 0xFA, 0xCE], // Mach-O binary (32-bit)
  [0xFE, 0xED, 0xFA, 0xCF], // Mach-O binary (64-bit)

  // Script headers
  [0x23, 0x21], // Shebang (#!)

  // Archive headers (could contain malicious files)
  [0x50, 0x4B, 0x03, 0x04], // ZIP
  [0x50, 0x4B, 0x05, 0x06], // ZIP (empty)
  [0x50, 0x4B, 0x07, 0x08], // ZIP (spanned)
  [0x52, 0x61, 0x72, 0x21], // RAR
  [0x37, 0x7A, 0xBC, 0xAF], // 7z
];

/**
 * Validates file based on content (magic numbers) rather than just extension/MIME type
 */
export function validateFileContent(buffer: ArrayBuffer, options: FileValidationOptions = {}): FileValidationResult {
  const {
    maxSize = 15 * 1024 * 1024, // 15MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    strictValidation = true,
    scanContent = true
  } = options;

  const warnings: string[] = [];

  // Size validation
  if (buffer.byteLength > maxSize) {
    return {
      isValid: false,
      error: `File size (${Math.round(buffer.byteLength / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`
    };
  }

  // Minimum size check (prevent empty or corrupted files)
  if (buffer.byteLength < 100) {
    return {
      isValid: false,
      error: 'File is too small to be a valid image'
    };
  }

  const bytes = new Uint8Array(buffer);

  // Check for dangerous file patterns first
  if (scanContent) {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (matchesPattern(bytes, pattern)) {
        return {
          isValid: false,
          error: 'File contains potentially dangerous content'
        };
      }
    }
  }

  // Detect actual file type based on content
  let detectedType: string | null = null;
  for (const [mimeType, patterns] of Object.entries(FILE_SIGNATURES)) {
    for (const pattern of patterns) {
      if (matchesPattern(bytes, pattern)) {
        detectedType = mimeType;
        break;
      }
    }
    if (detectedType) break;
  }

  if (!detectedType) {
    return {
      isValid: false,
      error: 'Unable to determine file type or unsupported format'
    };
  }

  // Check if detected type is allowed
  if (!allowedTypes.includes(detectedType)) {
    return {
      isValid: false,
      error: `File type '${detectedType}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  // Additional security checks for images
  if (detectedType.startsWith('image/') && scanContent) {
    const imageWarnings = scanImageContent(bytes);
    warnings.push(...imageWarnings);
  }

  // Check for embedded scripts or suspicious content
  if (strictValidation && scanContent) {
    const contentWarnings = scanForSuspiciousContent(bytes);
    warnings.push(...contentWarnings);
  }

  return {
    isValid: true,
    fileType: detectedType,
    securityWarnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Matches byte pattern with support for wildcards (undefined values)
 */
function matchesPattern(bytes: Uint8Array, pattern: (number | undefined)[]): boolean {
  if (bytes.length < pattern.length) {
    return false;
  }

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] !== undefined && bytes[i] !== pattern[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Scans image content for potential security issues
 */
function scanImageContent(bytes: Uint8Array): string[] {
  const warnings: string[] = [];

  // Check for excessive EXIF data (could hide malicious content)
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) { // JPEG
    // Look for EXIF marker (0xFFE1)
    for (let i = 0; i < Math.min(bytes.length - 1, 1000); i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xE1) {
        // Check EXIF size
        const exifSize = (bytes[i + 2] << 8) | bytes[i + 3];
        if (exifSize > 10000) { // Unusually large EXIF data
          warnings.push('Image contains unusually large metadata (EXIF) section');
        }
        break;
      }
    }
  }

  // Check for PNG text chunks that might contain scripts
  if (bytes[0] === 0x89 && bytes[1] === 0x50) { // PNG
    // Look for text chunks (tEXt, zTXt, iTXt)
    const textChunks = ['tEXt', 'zTXt', 'iTXt'];
    for (let i = 8; i < bytes.length - 4; i++) {
      const chunkType = String.fromCharCode(bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]);
      if (textChunks.includes(chunkType)) {
        warnings.push('Image contains text metadata that should be reviewed');
        break;
      }
    }
  }

  return warnings;
}

/**
 * Scans for suspicious content patterns
 */
function scanForSuspiciousContent(bytes: Uint8Array): string[] {
  const warnings: string[] = [];

  // Convert to string for pattern matching (sample only to avoid performance issues)
  const sampleSize = Math.min(bytes.length, 10000);
  const textContent = String.fromCharCode(...bytes.slice(0, sampleSize)).toLowerCase();

  // Suspicious patterns
  const suspiciousPatterns = [
    'javascript:',
    '<script',
    'eval(',
    'document.cookie',
    'document.write',
    'window.location',
    'base64,',
    'data:text/html',
    'vbscript:',
    'onload=',
    'onerror=',
    'onclick=',
  ];

  for (const pattern of suspiciousPatterns) {
    if (textContent.includes(pattern)) {
      warnings.push(`Suspicious content pattern detected: ${pattern}`);
    }
  }

  // Check for null bytes (could indicate binary content in text)
  for (let i = 0; i < sampleSize; i++) {
    if (bytes[i] === 0) {
      warnings.push('File contains null bytes which may indicate binary content');
      break;
    }
  }

  return warnings;
}

/**
 * Validates file name for security
 */
export function validateFileName(fileName: string): { isValid: boolean; error?: string } {
  // Check for directory traversal
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return {
      isValid: false,
      error: 'File name contains invalid characters'
    };
  }

  // Check for dangerous extensions (double extensions, etc.)
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.php', '.asp', '.jsp', '.pl', '.py', '.rb', '.sh', '.ps1'
  ];

  const lowerFileName = fileName.toLowerCase();
  for (const ext of dangerousExtensions) {
    if (lowerFileName.includes(ext)) {
      return {
        isValid: false,
        error: 'File name contains potentially dangerous extension'
      };
    }
  }

  // Check length
  if (fileName.length > 255) {
    return {
      isValid: false,
      error: 'File name is too long'
    };
  }

  // Check for control characters
  if (/[\x00-\x1f\x7f-\x9f]/.test(fileName)) {
    return {
      isValid: false,
      error: 'File name contains invalid control characters'
    };
  }

  return { isValid: true };
}

/**
 * Sanitizes uploaded file by removing metadata and normalizing format
 */
export async function sanitizeImage(buffer: ArrayBuffer): Promise<ArrayBuffer> {
  // This is a placeholder for image sanitization
  // In a real implementation, you might use a library like sharp or ImageMagick
  // to strip metadata and re-encode the image

  // For now, we'll just return the original buffer
  // TODO: Implement actual image sanitization
  return buffer;
}