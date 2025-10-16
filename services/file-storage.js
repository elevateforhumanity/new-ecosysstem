/**
 * File Storage Service (Cloudflare R2 Integration)
 * Provides Google Drive alternative with unlimited storage
 */

const crypto = require('crypto');

class FileStorageService {
  constructor() {
    this.files = new Map();
    this.folders = new Map();
    this.shares = new Map();
    
    // Cloudflare R2 configuration
    this.r2AccountId = process.env.R2_ACCOUNT_ID;
    this.r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    this.r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
    this.r2BucketName = process.env.R2_BUCKET_NAME || 'elevate-drive';
    this.r2Endpoint = `https://${this.r2AccountId}.r2.cloudflarestorage.com`;
    
    // Storage quotas (in bytes)
    this.quotas = {
      free: 10 * 1024 * 1024 * 1024, // 10GB
      plus: 100 * 1024 * 1024 * 1024, // 100GB
      enterprise: -1 // Unlimited
    };
  }

  /**
   * Initialize S3-compatible client for R2
   */
  getR2Client() {
    // In production, use @aws-sdk/client-s3
    if (this._r2Client) return this._r2Client;
    
    try {
      const { S3Client } = require('@aws-sdk/client-s3');
      
      this._r2Client = new S3Client({
        region: 'auto',
        endpoint: this.r2Endpoint,
        credentials: {
          accessKeyId: this.r2AccessKey,
          secretAccessKey: this.r2SecretKey
        }
      });
      
      return this._r2Client;
    } catch (error) {
      console.warn('AWS SDK not installed, using mock storage');
      return null;
    }
  }

  /**
   * Upload file to R2
   */
  async uploadFile({ file, userId, folderId = null, fileName = null }) {
    const user = await this.getUser(userId);
    const usedStorage = await this.getUserStorageUsed(userId);
    const quota = this.quotas[user.plan] || this.quotas.free;
    
    // Check storage quota
    if (quota !== -1 && usedStorage + file.size > quota) {
      throw new Error('Storage quota exceeded');
    }
    
    const fileId = `file_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const key = `${userId}/${fileId}/${fileName || file.name}`;
    
    const fileRecord = {
      id: fileId,
      name: fileName || file.name,
      originalName: file.name,
      path: key,
      size: file.size,
      mimeType: file.mimetype || file.type,
      ownerId: userId,
      folderId,
      isFolder: false,
      sharedWith: [],
      permissions: {
        owner: 'write',
        shared: 'read'
      },
      version: 1,
      versions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessedAt: new Date()
    };
    
    // Upload to R2
    const r2Client = this.getR2Client();
    if (r2Client) {
      const { PutObjectCommand } = require('@aws-sdk/client-s3');
      
      await r2Client.send(new PutObjectCommand({
        Bucket: this.r2BucketName,
        Key: key,
        Body: file.buffer || file.data,
        ContentType: file.mimetype || file.type,
        Metadata: {
          userId,
          fileId,
          originalName: file.name
        }
      }));
      
      fileRecord.url = `https://pub-${this.r2AccountId}.r2.dev/${key}`;
    } else {
      // Mock storage for development
      fileRecord.url = `/api/files/${fileId}/download`;
      fileRecord.mockData = file.buffer || file.data;
    }
    
    this.files.set(fileId, fileRecord);
    
    return fileRecord;
  }

  /**
   * Download file from R2
   */
  async downloadFile(fileId, userId) {
    const file = this.files.get(fileId);
    if (!file) throw new Error('File not found');
    
    // Check permissions
    if (!this.canAccessFile(file, userId)) {
      throw new Error('Access denied');
    }
    
    // Update last accessed
    file.lastAccessedAt = new Date();
    
    const r2Client = this.getR2Client();
    if (r2Client) {
      const { GetObjectCommand } = require('@aws-sdk/client-s3');
      
      const response = await r2Client.send(new GetObjectCommand({
        Bucket: this.r2BucketName,
        Key: file.path
      }));
      
      return {
        file,
        stream: response.Body,
        contentType: file.mimeType
      };
    } else {
      // Mock storage
      return {
        file,
        data: file.mockData,
        contentType: file.mimeType
      };
    }
  }

  /**
   * Create folder
   */
  async createFolder({ name, userId, parentFolderId = null }) {
    const folderId = `folder_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    
    const folder = {
      id: folderId,
      name,
      ownerId: userId,
      parentFolderId,
      isFolder: true,
      sharedWith: [],
      permissions: {
        owner: 'write',
        shared: 'read'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.folders.set(folderId, folder);
    this.files.set(folderId, folder); // Also store in files map for unified access
    
    return folder;
  }

  /**
   * List files in folder
   */
  async listFiles(userId, folderId = null) {
    const files = [];
    
    this.files.forEach(file => {
      if (file.folderId === folderId && this.canAccessFile(file, userId)) {
        files.push(this.sanitizeFileRecord(file));
      }
    });
    
    return files.sort((a, b) => {
      // Folders first, then by name
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Search files
   */
  async searchFiles(userId, query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    this.files.forEach(file => {
      if (this.canAccessFile(file, userId) &&
          file.name.toLowerCase().includes(lowerQuery)) {
        results.push(this.sanitizeFileRecord(file));
      }
    });
    
    return results;
  }

  /**
   * Share file with users
   */
  async shareFile(fileId, userId, shareWithUserIds, permission = 'read') {
    const file = this.files.get(fileId);
    if (!file) throw new Error('File not found');
    if (file.ownerId !== userId) throw new Error('Only owner can share');
    
    const share = {
      id: `share_${Date.now()}`,
      fileId,
      ownerId: userId,
      sharedWith: shareWithUserIds,
      permission, // 'read' or 'write'
      createdAt: new Date()
    };
    
    this.shares.set(share.id, share);
    
    // Update file record
    file.sharedWith = [...new Set([...file.sharedWith, ...shareWithUserIds])];
    file.permissions.shared = permission;
    
    // In production, send email notifications
    shareWithUserIds.forEach(sharedUserId => {
      console.log(`Notifying user ${sharedUserId} about shared file: ${file.name}`);
    });
    
    return share;
  }

  /**
   * Unshare file
   */
  async unshareFile(fileId, userId, unshareUserId) {
    const file = this.files.get(fileId);
    if (!file) throw new Error('File not found');
    if (file.ownerId !== userId) throw new Error('Only owner can unshare');
    
    file.sharedWith = file.sharedWith.filter(id => id !== unshareUserId);
    
    return file;
  }

  /**
   * Move file to folder
   */
  async moveFile(fileId, userId, targetFolderId) {
    const file = this.files.get(fileId);
    if (!file) throw new Error('File not found');
    if (file.ownerId !== userId) throw new Error('Only owner can move files');
    
    file.folderId = targetFolderId;
    file.updatedAt = new Date();
    
    return file;
  }

  /**
   * Rename file
   */
  async renameFile(fileId, userId, newName) {
    const file = this.files.get(fileId);
    if (!file) throw new Error('File not found');
    if (file.ownerId !== userId) throw new Error('Only owner can rename');
    
    file.name = newName;
    file.updatedAt = new Date();
    
    return file;
  }

  /**
   * Delete file
   */
  async deleteFile(fileId, userId) {
    const file = this.files.get(fileId);
    if (!file) throw new Error('File not found');
    if (file.ownerId !== userId) throw new Error('Only owner can delete');
    
    // Delete from R2
    const r2Client = this.getR2Client();
    if (r2Client) {
      const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
      
      await r2Client.send(new DeleteObjectCommand({
        Bucket: this.r2BucketName,
        Key: file.path
      }));
    }
    
    this.files.delete(fileId);
    
    return { success: true, fileId };
  }

  /**
   * Get file versions
   */
  async getFileVersions(fileId, userId) {
    const file = this.files.get(fileId);
    if (!file) throw new Error('File not found');
    if (!this.canAccessFile(file, userId)) throw new Error('Access denied');
    
    return file.versions || [];
  }

  /**
   * Create new version of file
   */
  async createFileVersion(fileId, userId, newFileData) {
    const file = this.files.get(fileId);
    if (!file) throw new Error('File not found');
    if (file.ownerId !== userId) throw new Error('Only owner can update');
    
    // Save current version
    const version = {
      version: file.version,
      path: file.path,
      size: file.size,
      createdAt: file.updatedAt
    };
    
    file.versions = file.versions || [];
    file.versions.push(version);
    
    // Upload new version
    const newVersion = file.version + 1;
    const newKey = `${userId}/${fileId}/v${newVersion}/${file.name}`;
    
    const r2Client = this.getR2Client();
    if (r2Client) {
      const { PutObjectCommand } = require('@aws-sdk/client-s3');
      
      await r2Client.send(new PutObjectCommand({
        Bucket: this.r2BucketName,
        Key: newKey,
        Body: newFileData.buffer || newFileData.data,
        ContentType: file.mimeType
      }));
    }
    
    file.version = newVersion;
    file.path = newKey;
    file.size = newFileData.size;
    file.updatedAt = new Date();
    
    return file;
  }

  /**
   * Get storage usage for user
   */
  async getUserStorageUsed(userId) {
    let totalSize = 0;
    
    this.files.forEach(file => {
      if (file.ownerId === userId && !file.isFolder) {
        totalSize += file.size || 0;
      }
    });
    
    return totalSize;
  }

  /**
   * Get storage quota for user
   */
  async getUserStorageQuota(userId) {
    const user = await this.getUser(userId);
    const quota = this.quotas[user.plan] || this.quotas.free;
    const used = await this.getUserStorageUsed(userId);
    
    return {
      used,
      total: quota,
      available: quota === -1 ? -1 : quota - used,
      percentage: quota === -1 ? 0 : (used / quota) * 100,
      plan: user.plan
    };
  }

  /**
   * Check if user can access file
   */
  canAccessFile(file, userId) {
    return file.ownerId === userId || file.sharedWith.includes(userId);
  }

  /**
   * Sanitize file record (remove sensitive data)
   */
  sanitizeFileRecord(file) {
    const { mockData, ...sanitized } = file;
    return sanitized;
  }

  /**
   * Get user (mock - in production, fetch from database)
   */
  async getUser(userId) {
    // Mock user data
    return {
      id: userId,
      plan: 'plus' // free, plus, enterprise
    };
  }

  /**
   * Get recent files for user
   */
  async getRecentFiles(userId, limit = 10) {
    const files = [];
    
    this.files.forEach(file => {
      if (this.canAccessFile(file, userId) && !file.isFolder) {
        files.push(this.sanitizeFileRecord(file));
      }
    });
    
    return files
      .sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)
      .slice(0, limit);
  }

  /**
   * Get shared files
   */
  async getSharedFiles(userId) {
    const files = [];
    
    this.files.forEach(file => {
      if (file.sharedWith.includes(userId)) {
        files.push(this.sanitizeFileRecord(file));
      }
    });
    
    return files;
  }
}

module.exports = new FileStorageService();
