import React from 'react';
import { useParams } from 'react-router-dom';
import './UrlGerada.css';

const UrlGerada: React.FC = () => {
  const { id } = useParams();
  const baseUrl = window.location.origin;
  const url = `${baseUrl}/assinar/${id}`;

  const handleCopyClick = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="url-container">
      <img src="/images/logo.png" alt="Logo" className="logo" />
      
      <div className="url-card">
        <h2 className="url-title">Copiar URL</h2>
        <div className="url-content">
          <span className="url-text">{url}</span>
          <button onClick={handleCopyClick} className="copy-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <p className="copyright">© Desenvolvido por Villela Tech</p>
    </div>
  );
};

export default UrlGerada; 