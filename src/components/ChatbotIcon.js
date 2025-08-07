import React, { useState } from 'react';

const ChatbotIcon = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleChat = () => {
    setIsAnimating(true);
    setIsChatOpen(!isChatOpen);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="chatbot-container">
      <div className={`chatbot-iframe-wrapper ${isChatOpen ? 'open' : ''}`}>
        {isChatOpen && (
          <div className="chatbot-iframe-container">
            <div className="chatbot-header">
              <span className="chatbot-title">Chat with us</span>
              <button className="close-button" onClick={toggleChat}>×</button>
            </div>
            <iframe
              src="https://www.chatbase.co/chatbot-iframe/CEqEUQ_t8KZX65SsFnqBC"
              width="100%"
              height="100%"
              frameBorder="0"
              title="Chatbot"
            ></iframe>
          </div>
        )}
      </div>
      <button 
        className={`chatbot-toggle ${isChatOpen ? 'open' : ''} ${isAnimating ? 'animating' : ''}`} 
        onClick={toggleChat}
      >
        {isChatOpen ? (
          <span className="close-icon">×</span>
        ) : (
          <span className="chat-icon">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C8.28 2 2 7.8 2 15C2 18.6522 3.35 21.7257 5.6 24.0367L3.5 29.1667L11.25 26.8125C12.7632 27.3803 14.3924 27.6848 16 27.6848C23.72 27.6848 30 21.8848 30 14.6848C30 7.48477 23.72 2 16 2Z" fill="white"/>
              <circle cx="9" cy="15" r="2" fill="#007bff"/>
              <circle cx="16" cy="15" r="2" fill="#007bff"/>
              <circle cx="23" cy="15" r="2" fill="#007bff"/>
            </svg>
          </span>
        )}
      </button>
      <style>{`
        .chatbot-container {
          position: fixed;
          bottom: 5px;
          right: 5px;
          z-index: 1000;
        }

        .chatbot-toggle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0062E6 0%, #33A9FF 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1001;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 4px 20px rgba(0, 123, 255, 0.45);
            transform: scale(1.05);
          }
          100% {
            box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
            transform: scale(1);
          }
        }

        .chatbot-toggle:hover {
          transform: scale(1.1);
          background: linear-gradient(135deg, #0051C2 0%, #1E90FF 100%);
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
        }

        .chatbot-toggle.open {
          background: linear-gradient(135deg, #DC3545 0%, #FF6B6B 100%);
          transform: rotate(180deg);
          animation: none;
        }

        .chatbot-toggle.animating {
          pointer-events: none;
        }

        .chat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          transform: scale(1.2);
        }
        
        .chat-icon svg {
          width: 32px;
          height: 32px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .close-icon {
          font-size: 32px;
          color: white;
          transition: all 0.3s ease;
        }

        .chatbot-iframe-wrapper {
          position: fixed;
          bottom: 90px;
          right: 20px;
          transform: scale(0);
          transform-origin: bottom right;
          transition: transform 0.3s ease;
          z-index: 1000;
        }

        .chatbot-iframe-wrapper.open {
          transform: scale(1);
        }

        .chatbot-iframe-container {
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .chatbot-header {
          background: #007bff;
          color: white;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 500;
        }

        .chatbot-title {
          font-size: 16px;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0 5px;
          line-height: 1;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          opacity: 0.8;
          transform: scale(1.1);
        }

        iframe {
          flex: 1;
          border: none;
        }

        @media (max-width: 768px) {
          .chatbot-iframe-wrapper {
            bottom: 80px;
            right: 10px;
            left: 10px;
          }

          .chatbot-iframe-container {
            width: 100%;
            height: 70vh;
            max-height: 600px;
          }

          .chatbot-toggle {
            width: 50px;
            height: 50px;
          }

          .chat-icon {
            font-size: 20px;
          }

          .close-icon {
            font-size: 28px;
          }
        }

        @media (max-height: 600px) {
          .chatbot-iframe-container {
            height: 60vh;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatbotIcon;
