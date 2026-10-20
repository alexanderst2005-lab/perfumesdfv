import React from 'react';
import './Maintenance.css';

export default function Maintenance() {
  return (
    <div className="mnt-overlay" role="alert">
      <div className="mnt-blob mnt-blob-1" />
      <div className="mnt-blob mnt-blob-2" />
      <div className="mnt-blob mnt-blob-3" />

      <div className="mnt-card">
        <div className="mnt-icon">
          <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="24" y="4" width="16" height="9" rx="2" />
            <path d="M28 13v6M36 13v6" />
            <path d="M20 26a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v26a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8z" />
            <path d="M20 38c5 3 9-3 12 0s7 3 12 0" />
          </svg>
          <span className="mnt-ring" />
        </div>

        <h1 className="mnt-title">Página no disponible temporalmente</h1>
        <p className="mnt-text">Volveremos muy pronto</p>

        <div className="mnt-dots" aria-hidden="true">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
