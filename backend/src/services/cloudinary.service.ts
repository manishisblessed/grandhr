/**
 * Cloudinary Service for File Uploads
 * GrandHR - Cloud-based file storage
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Upload a file to Cloudinary
 * @param file - Base64 string or file path
 * @param folder - Folder name in Cloudinary (e.g., 'employees', 'documents')
 * @param options - Additional upload options
 */
export const uploadFile = async (
  file: string,
  folder: string = 'grandhr',
  options: Record<string, any> = {}
): Promise<UploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `grandhr/${folder}`,
      resource_type: 'auto',
      ...options,
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
};

/**
 * Upload an image with transformations
 * @param file - Base64 string or file path
 * @param folder - Folder name
 * @param width - Max width
 * @param height - Max height
 */
export const uploadImage = async (
  file: string,
  folder: string = 'images',
  width: number = 800,
  height: number = 800
): Promise<UploadResult> => {
  return uploadFile(file, folder, {
    transformation: [
      { width, height, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });
};

/**
 * Upload employee profile photo
 * @param file - Base64 string
 * @param employeeId - Employee ID for organization
 */
export const uploadProfilePhoto = async (
  file: string,
  employeeId: string
): Promise<UploadResult> => {
  return uploadFile(file, `employees/${employeeId}`, {
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
    public_id: 'profile',
    overwrite: true,
  });
};

/**
 * Upload a document (PDF, DOC, etc.)
 * @param file - Base64 string or file path
 * @param folder - Folder name
 * @param filename - Original filename
 */
export const uploadDocument = async (
  file: string,
  folder: string = 'documents',
  filename?: string
): Promise<UploadResult> => {
  return uploadFile(file, folder, {
    resource_type: 'raw',
    public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
  });
};

/**
 * Upload company logo
 * @param file - Base64 string
 * @param companyId - Company ID for organization
 */
export const uploadCompanyLogo = async (
  file: string,
  companyId: string
): Promise<UploadResult> => {
  return uploadFile(file, `companies/${companyId}`, {
    transformation: [
      { width: 500, height: 500, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
    public_id: 'logo',
    overwrite: true,
  });
};

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file
 */
export const deleteFile = async (publicId: string): Promise<boolean> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

/**
 * Generate a signed URL for private files
 * @param publicId - The public ID of the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export const getSignedUrl = (publicId: string, expiresIn: number = 3600): string => {
  return cloudinary.url(publicId, {
    sign_url: true,
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  });
};

export default cloudinary;
