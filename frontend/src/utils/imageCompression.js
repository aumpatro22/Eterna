import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file to a target size of 300KB - 500KB (default 400KB / 0.4MB).
 * Returns the original file if the file is not a supported image format or if compression fails.
 */
export async function compressImage(file, maxSizeMB = 0.4, maxWidthOrHeight = 1920) {
  if (!file) return null;

  // Check file type / extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return file; // Skip and return original file
  }

  const options = {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: maxWidthOrHeight,
    useWebWorker: true,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Return compressed file maintaining the original filename
    return new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn('Image compression failed, returning original file:', error);
    return file;
  }
}
