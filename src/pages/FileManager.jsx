import React, { useState, useEffect } from 'react';
import FileUpload from '../components/files/FileUpload';

/**
 * FileManager Page - Google Drive alternative
 */
export function FileManager() {
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([
    { id: null, name: 'My Drive' },
  ]);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [storageQuota, setStorageQuota] = useState(null);

  useEffect(() => {
    loadFiles();
    loadStorageQuota();
  }, [currentFolder]);

  const loadFiles = async () => {
    try {
      const response = await fetch(
        `/api/files?folderId=${currentFolder || ''}`
      );
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const loadStorageQuota = async () => {
    try {
      const response = await fetch('/api/files/quota');
      const data = await response.json();
      setStorageQuota(data);
    } catch (error) {
      console.error('Failed to load storage quota:', error);
    }
  };

  const handleFileClick = (file) => {
    if (file.isFolder) {
      setCurrentFolder(file.id);
      setBreadcrumbs([...breadcrumbs, { id: file.id, name: file.name }]);
    } else {
      // Download or preview file
      window.open(`/api/files/${file.id}/download`, '_blank');
    }
  };

  const handleBreadcrumbClick = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const handleCreateFolder = async () => {
    const name = prompt('Folder name:');
    if (!name) return;

    try {
      const response = await fetch('/api/files/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentFolderId: currentFolder }),
      });

      if (response.ok) {
        loadFiles();
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleUploadComplete = (uploadedFile) => {
    setFiles([...files, uploadedFile]);
    setShowUpload(false);
    loadStorageQuota();
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles(files.filter((f) => f.id !== fileId));
        loadStorageQuota();
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleShare = async (fileId) => {
    const email = prompt('Enter email address to share with:');
    if (!email) return;

    try {
      const response = await fetch(`/api/files/${fileId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, permission: 'read' }),
      });

      if (response.ok) {
        alert('File shared successfully');
      }
    } catch (error) {
      console.error('Failed to share file:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileIcon = (file) => {
    if (file.isFolder) return '📁';
    if (file.mimeType?.startsWith('image/')) return '🖼️';
    if (file.mimeType?.startsWith('video/')) return '🎥';
    if (file.mimeType?.startsWith('audio/')) return '🎵';
    if (file.mimeType?.includes('pdf')) return '📄';
    if (file.mimeType?.includes('word')) return '📝';
    if (file.mimeType?.includes('sheet')) return '📊';
    if (file.mimeType?.includes('presentation')) return '📽️';
    return '📄';
  };

  return (
    <div
      style={{ minHeight: '100vh', backgroundColor: 'var(--brand-surface)' }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid var(--brand-border)',
          padding: '1rem 2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
            Elevate Drive
          </h1>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {storageQuota && (
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--brand-text-muted)',
                }}
              >
                {formatBytes(storageQuota.used)} of{' '}
                {storageQuota.total === -1
                  ? 'Unlimited'
                  : formatBytes(storageQuota.total)}{' '}
                used
              </div>
            )}

            <button
              onClick={() => setShowUpload(!showUpload)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--brand-info)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              + Upload
            </button>

            <button
              onClick={handleCreateFolder}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#fff',
                color: 'var(--brand-text)',
                border: '1px solid var(--brand-border-dark)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              + New Folder
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Breadcrumbs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id || 'root'}>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color:
                    index === breadcrumbs.length - 1
                      ? 'var(--brand-text)'
                      : 'var(--brand-info)',
                  cursor: 'pointer',
                  fontWeight: index === breadcrumbs.length - 1 ? '600' : '400',
                }}
              >
                {crumb.name}
              </button>
              {index < breadcrumbs.length - 1 && (
                <span style={{ color: 'var(--brand-text-light)' }}>/</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Upload area */}
        {showUpload && (
          <div style={{ marginBottom: '2rem' }}>
            <FileUpload
              onUpload={handleUploadComplete}
              folderId={currentFolder}
            />
          </div>
        )}

        {/* Storage quota bar */}
        {storageQuota && storageQuota.total !== -1 && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#fff',
              borderRadius: '0.5rem',
              border: '1px solid var(--brand-border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              <span>Storage used</span>
              <span>{storageQuota.percentage.toFixed(1)}%</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--brand-border)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(storageQuota.percentage, 100)}%`,
                  height: '100%',
                  backgroundColor:
                    storageQuota.percentage > 90
                      ? 'var(--brand-danger)'
                      : 'var(--brand-info)',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        )}

        {/* Files grid */}
        {files.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--brand-text-muted)',
            }}
          >
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              This folder is empty
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Upload files or create a new folder to get started
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {files.map((file) => (
              <div
                key={file.id}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--brand-border)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div onClick={() => handleFileClick(file)}>
                  <div
                    style={{
                      fontSize: '3rem',
                      textAlign: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {getFileIcon(file)}
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.25rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--brand-text-muted)',
                    }}
                  >
                    {!file.isFolder && formatBytes(file.size)}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--brand-border)',
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(file.id);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.25rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--brand-border-dark)',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    Share
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.id);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.25rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'transparent',
                      color: 'var(--brand-danger)',
                      border: '1px solid var(--brand-danger)',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileManager;
