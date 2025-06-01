import React from 'react';
import { languages, getLanguageName } from '../config/languages';

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div className="language-selector">
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="language-select"
      >
        {Object.entries(languages).map(([key, lang]) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <style jsx>{`
        .language-selector {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }
        
        .language-select {
          padding: 8px 32px 8px 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          background-color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 16px;
        }
        
        .language-select:hover {
          border-color: #666;
        }
        
        .language-select:focus {
          outline: none;
          border-color: #333;
          box-shadow: 0 0 5px rgba(0,0,0,0.2);
        }
        
        .language-select::-ms-expand {
          display: none;
        }
        
        @media (max-width: 768px) {
          .language-selector {
            top: 10px;
            right: 10px;
          }
          
          .language-select {
            padding: 6px 28px 6px 10px;
            font-size: 14px;
            background-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector; 