import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
}

export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<File> {
  const defaultOptions: CompressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    ...options
  };

  try {
    console.log('Tamaño original:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    const compressedFile = await imageCompression(file, defaultOptions);
    
    console.log('Tamaño comprimido:', 
      (compressedFile.size / 1024 / 1024).toFixed(2), 
      'MB (', 
      Math.round((1 - compressedFile.size / file.size) * 100), 
      '% reducción)'
    );

    return new File([compressedFile], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Error al comprimir la imagen:', error);
    // Si hay un error, devolver el archivo original
    return file;
  }
}
