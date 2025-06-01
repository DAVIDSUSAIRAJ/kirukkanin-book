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
          padding: 8px 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          background-color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .language-select:hover {
          border-color: #666;
        }
        
        .language-select:focus {
          outline: none;
          border-color: #333;
          box-shadow: 0 0 5px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 768px) {
          .language-selector {
            top: 10px;
            right: 10px;
          }
          
          .language-select {
            padding: 6px 10px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector; 