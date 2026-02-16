/**
 * File Storage Utility Tests
 * 
 * Tests for file upload and storage functionality
 * Story: EPIC-5-004/005 - User Profile (View & Update)
 */

import {
  saveFileLocally,
  deleteFileLocally,
  initializeStorage
} from '../src/utils/storage.js';
import fs from 'fs';
import path from 'path';

describe('Storage Utility', () => {
  const testStoragePath = './test_uploads';
  const originalEnv = process.env.STORAGE_PATH;

  beforeAll(() => {
    // Override storage path for testing
    process.env.STORAGE_PATH = testStoragePath;
    initializeStorage();
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testStoragePath)) {
      fs.rmSync(testStoragePath, { recursive: true });
    }
    // Restore original env
    process.env.STORAGE_PATH = originalEnv;
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testStoragePath)) {
      fs.rmSync(testStoragePath, { recursive: true });
    }
  });

  describe('saveFileLocally', () => {
    it('should save a valid image file', async () => {
      // Create a minimal valid JPEG buffer
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01
      ]);

      const fileUrl = await saveFileLocally(jpegBuffer, 'image/jpeg', 'test');

      expect(fileUrl).toBeDefined();
      expect(fileUrl).toMatch(/^\/uploads\/test\//);
      expect(fileUrl).toMatch(/\.jpg$/);

      // Verify file was created
      const filePath = path.join(testStoragePath, fileUrl.replace('/uploads/', ''));
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should save PNG files', async () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
      ]);

      const fileUrl = await saveFileLocally(pngBuffer, 'image/png', 'logos');

      expect(fileUrl).toMatch(/\.png$/);
    });

    it('should save GIF files', async () => {
      const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38]);

      const fileUrl = await saveFileLocally(gifBuffer, 'image/gif', 'logos');

      expect(fileUrl).toMatch(/\.gif$/);
    });

    it('should save WebP files', async () => {
      const webpBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46]);

      const fileUrl = await saveFileLocally(webpBuffer, 'image/webp', 'logos');

      expect(fileUrl).toMatch(/\.webp$/);
    });

    it('should reject non-image files', async () => {
      const textBuffer = Buffer.from('This is a text file');

      await expect(
        saveFileLocally(textBuffer, 'text/plain', 'test')
      ).rejects.toThrow('File type not allowed');
    });

    it('should reject files exceeding size limit (5MB)', async () => {
      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      await expect(
        saveFileLocally(largeBuffer, 'image/jpeg', 'test')
      ).rejects.toThrow('File size exceeds maximum allowed size');
    });

    it('should create subdirectory if it does not exist', async () => {
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10
      ]);

      const fileUrl = await saveFileLocally(jpegBuffer, 'image/jpeg', 'new_folder');

      const dirPath = path.join(testStoragePath, 'new_folder');
      expect(fs.existsSync(dirPath)).toBe(true);
    });

    it('should generate unique filenames', async () => {
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10
      ]);

      const fileUrl1 = await saveFileLocally(jpegBuffer, 'image/jpeg', 'test');
      const fileUrl2 = await saveFileLocally(jpegBuffer, 'image/jpeg', 'test');

      expect(fileUrl1).not.toBe(fileUrl2);
    });
  });

  describe('deleteFileLocally', () => {
    it('should delete an existing file', async () => {
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10
      ]);

      const fileUrl = await saveFileLocally(jpegBuffer, 'image/jpeg', 'test');
      const filePath = path.join(testStoragePath, fileUrl.replace('/uploads/', ''));

      // Verify file exists
      expect(fs.existsSync(filePath)).toBe(true);

      // Delete file
      await deleteFileLocally(fileUrl);

      // Verify file is deleted
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should not throw error when file does not exist', async () => {
      await expect(
        deleteFileLocally('/uploads/nonexistent/file.jpg')
      ).resolves.not.toThrow();
    });

    it('should handle null or undefined file URLs gracefully', async () => {
      await expect(deleteFileLocally(null)).resolves.not.toThrow();
      await expect(deleteFileLocally(undefined)).resolves.not.toThrow();
      await expect(deleteFileLocally('')).resolves.not.toThrow();
    });
  });

  describe('initializeStorage', () => {
    it('should create storage directory if it does not exist', () => {
      const testPath = './test_init_storage';
      process.env.STORAGE_PATH = testPath;

      // Remove directory if it exists
      if (fs.existsSync(testPath)) {
        fs.rmSync(testPath, { recursive: true });
      }

      initializeStorage();

      expect(fs.existsSync(testPath)).toBe(true);

      // Clean up
      fs.rmSync(testPath, { recursive: true });
      process.env.STORAGE_PATH = testStoragePath;
    });
  });
});
