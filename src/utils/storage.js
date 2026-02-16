/**
 * File Storage Utility
 * 
 * Handles file uploads to local storage or S3
 * Story: EPIC-5-004/005 - User Profile (View & Update)
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_PATH = process.env.STORAGE_PATH || './uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Initialize storage directory
 */
export function initializeStorage() {
  if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
  }
}

/**
 * Save file to local storage
 * 
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - File MIME type
 * @param {string} directory - Subdirectory (e.g., 'logos', 'avatars')
 * @returns {Promise<string>} File path URL
 */
export async function saveFileLocally(fileBuffer, mimeType, directory = 'logos') {
  // Validate file size
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds maximum allowed size (5MB)');
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('File type not allowed. Only images are supported.');
  }

  try {
    initializeStorage();

    // Create directory if it doesn't exist
    const dirPath = path.join(STORAGE_PATH, directory);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Generate unique filename
    const extension = getFileExtension(mimeType);
    const filename = `${uuidv4()}.${extension}`;
    const filepath = path.join(dirPath, filename);

    // Save file
    await fs.promises.writeFile(filepath, fileBuffer);

    // Return relative URL path
    return `/uploads/${directory}/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save file: ${error.message}`);
  }
}

/**
 * Delete file from local storage
 * 
 * @param {string} fileUrl - File URL path
 * @returns {Promise<void>}
 */
export async function deleteFileLocally(fileUrl) {
  if (!fileUrl) return;

  try {
    // Extract filepath from URL
    const filePath = path.join(STORAGE_PATH, fileUrl.replace('/uploads/', ''));
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete file: ${error.message}`);
    // Don't throw, just log
  }
}

/**
 * Get file extension from MIME type
 * 
 * @param {string} mimeType - MIME type
 * @returns {string} File extension
 */
function getFileExtension(mimeType) {
  const mimeMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };
  return mimeMap[mimeType] || 'jpg';
}

/**
 * Save file to S3 (stub for future implementation)
 * 
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - File MIME type
 * @param {string} directory - Directory (e.g., 'logos', 'avatars')
 * @returns {Promise<string>} S3 URL
 * 
 * TODO: Implement S3 integration using AWS SDK
 * - Configure AWS credentials from env variables
 * - Use S3.putObject to upload file
 * - Return CloudFront URL or S3 URL
 */
export async function saveFileToS3(fileBuffer, mimeType, directory = 'logos') {
  // Stub implementation - throw for now
  throw new Error('S3 storage not yet implemented. Using local storage instead.');
}

/**
 * Resolve storage method based on configuration
 * 
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - File MIME type
 * @param {string} directory - Directory
 * @returns {Promise<string>} File URL
 */
export async function saveFile(fileBuffer, mimeType, directory = 'logos') {
  const storageType = process.env.STORAGE_TYPE || 'local';

  if (storageType === 's3') {
    return saveFileToS3(fileBuffer, mimeType, directory);
  }

  return saveFileLocally(fileBuffer, mimeType, directory);
}

/**
 * Delete file using configured storage method
 * 
 * @param {string} fileUrl - File URL
 * @returns {Promise<void>}
 */
export async function deleteFile(fileUrl) {
  const storageType = process.env.STORAGE_TYPE || 'local';

  if (storageType === 's3') {
    // TODO: Implement S3 deletion
    return;
  }

  return deleteFileLocally(fileUrl);
}
