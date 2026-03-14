import React, { useState, useEffect, useRef } from 'react';
import './ContentViewer.css';

const ContentViewer = ({ content, onClose }) => {
  const [loading, setLoading] = useState(true);
  const blobUrlRef = useRef(null);

  // Revoke blob URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const base64ToBlob = (base64, mimeType) => {
    const byteChars = atob(base64);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArray[i] = byteChars.charCodeAt(i);
    }
    return new Blob([byteArray], { type: mimeType });
  };

  const getBlobUrl = (base64, mimeType) => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    const blob = base64ToBlob(base64, mimeType);
    blobUrlRef.current = URL.createObjectURL(blob);
    return blobUrlRef.current;
  };

  const renderContent = () => {
    if (!content) return null;

    const { fileType, contentDataBase64, fileName, filePathUrl } = content;

    // If there's a URL, use it directly
    if (filePathUrl) {
      return renderByFileType(fileType, filePathUrl, null);
    }

    // Otherwise use base64 data
    if (!contentDataBase64) {
      return <p className="no-content">No content available</p>;
    }

    return renderByFileType(fileType, null, contentDataBase64);
  };

  const renderByFileType = (fileType, url, base64) => {
    const type = fileType?.toUpperCase();
    const mimeType = getMimeType(type);

    // Resolve the src: prefer direct URL; for base64, use blob URL for PDF, data URI for others
    const getSrc = () => {
      if (url) return url;
      if (type === 'PDF') {
        return getBlobUrl(base64, mimeType);
      }
      return `data:${mimeType};base64,${base64}`;
    };

    switch (type) {
      case 'PDF': {
        const src = getSrc();
        return (
          <iframe
            src={src}
            title="PDF Viewer"
            className="content-iframe"
            onLoad={() => setLoading(false)}
          />
        );
      }

      case 'JPG':
      case 'JPEG':
      case 'PNG':
      case 'GIF':
      case 'WEBP':
        return (
          <img
            src={getSrc()}
            alt={content.fileName}
            className="content-image"
            onLoad={() => setLoading(false)}
          />
        );

      case 'MP4':
      case 'WEBM':
      case 'OGG':
        return (
          <video
            controls
            className="content-video"
            onLoadedData={() => setLoading(false)}
          >
            <source src={getSrc()} type={mimeType} />
            Your browser does not support the video tag.
          </video>
        );

      case 'MP3':
      case 'WAV':
        return (
          <audio
            controls
            className="content-audio"
            onLoadedData={() => setLoading(false)}
          >
            <source src={getSrc()} type={mimeType} />
            Your browser does not support the audio tag.
          </audio>
        );

      default:
        return (
          <div className="unsupported-content">
            <p>Content type: {fileType}</p>
            <p>Viewer not available for this file type</p>
            <a href={getSrc()} download={content.fileName} className="download-link">
              Download File
            </a>
          </div>
        );
    }
  };

  const getMimeType = (fileType) => {
    const mimeTypes = {
      PDF: 'application/pdf',
      JPG: 'image/jpeg',
      JPEG: 'image/jpeg',
      PNG: 'image/png',
      GIF: 'image/gif',
      WEBP: 'image/webp',
      MP4: 'video/mp4',
      WEBM: 'video/webm',
      OGG: 'video/ogg',
      MP3: 'audio/mpeg',
      WAV: 'audio/wav',
    };
    return mimeTypes[fileType?.toUpperCase()] || 'application/octet-stream';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="content-viewer-overlay" onClick={onClose}>
      <div className="content-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="content-viewer-header">
          <div className="content-info">
            <h3>{content?.fileName}</h3>
            <p className="content-meta">
              {content?.fileType} • {formatFileSize(content?.contentSize)}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="content-viewer-body">
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading content...</p>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ContentViewer;
