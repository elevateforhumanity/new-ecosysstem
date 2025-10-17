/**
 * File Upload Component
 * Uploads files to Cloudflare R2 via agent worker
 */

import { useState } from 'react';

interface FileUploadProps {
  orgId?: string;
  ownerId: string;
  purpose?: 'intake' | 'w9' | 'id' | 'return' | 'certificate' | 'other';
  onSuccess?: (key: string, size: number) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUpload({
  orgId,
  ownerId,
  purpose = 'intake',
  onSuccess,
  onError,
  accept,
  maxSizeMB = 10,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    key: string;
    size: number;
  } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      const error = `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum (${maxSizeMB}MB)`;
      onError?.(error);
      alert(error);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('owner_id', ownerId);
      formData.append('purpose', purpose);
      if (orgId) {
        formData.append('org_id', orgId);
      }

      // Get JWT token
      const token = localStorage.getItem('supabase.auth.token');

      // Upload file
      const response = await fetch('/files/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadedFile(result);
      setProgress(100);
      onSuccess?.(result.key, result.size);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      console.error('Upload error:', error);
      onError?.(errorMessage);
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="flex-1">
          <input
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            accept={accept}
            className="block w-full text-sm text-neutral-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-emerald-600 file:text-white
              hover:file:bg-emerald-500
              file:cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {uploadedFile && !uploading && (
        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800 text-emerald-300 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-lg">✅</span>
            <div className="flex-1">
              <div className="font-medium">Upload successful</div>
              <div className="text-xs text-emerald-400/80 mt-1">
                Size: {formatFileSize(uploadedFile.size)}
              </div>
              <div className="text-xs text-emerald-400/60 mt-1 font-mono break-all">
                {uploadedFile.key}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-neutral-500">
        Maximum file size: {maxSizeMB}MB
        {accept && ` • Accepted types: ${accept}`}
      </div>
    </div>
  );
}
