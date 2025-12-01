import React, { useState, useRef, useEffect } from 'react';

const ChatbotIcon = ({ currentLanguage = 'tamil' }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatHistoryRef = useRef([]); // Maintain chat history for context

  // Get language name for API (backend expects full language name)
  const getLanguageForAPI = () => {
    return currentLanguage || 'tamil';
  };

  // Parse markdown links [text](url) to clickable links
  const parseMarkdownLinks = (text) => {
    if (!text) return '';
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    return text.replace(markdownLinkRegex, (match, linkText, url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  const toggleChat = () => {
    setIsAnimating(true);
    setIsChatOpen(!isChatOpen);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Send chat history along with the new message
      const response = await fetch('https://book-rag-ai-backend.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage,
          language: getLanguageForAPI(),
          history: chatHistoryRef.current // Send previous conversation history
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const botAnswer = data.answer || data.response || data.message || 'Sorry, I could not process your request.';
      
      const botMessage = {
        id: Date.now() + 1,
        text: botAnswer,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // Update chat history for next request
      chatHistoryRef.current.push({ role: "user", content: userMessage });
      chatHistoryRef.current.push({ role: "assistant", content: botAnswer });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, there was an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className={`chatbot-iframe-wrapper ${isChatOpen ? 'open' : ''}`}>
        {isChatOpen && (
          <div className="chatbot-iframe-container">
            <div className="chatbot-header">
              <div className="chatbot-header-content">
                <div className="chatbot-avatar">
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 2C8.28 2 2 7.8 2 15C2 18.6522 3.35 21.7257 5.6 24.0367L3.5 29.1667L11.25 26.8125C12.7632 27.3803 14.3924 27.6848 16 27.6848C23.72 27.6848 30 21.8848 30 14.6848C30 7.48477 23.72 2 16 2Z" fill="white"/>
                    <circle cx="9" cy="15" r="2" fill="#007bff"/>
                    <circle cx="16" cy="15" r="2" fill="#007bff"/>
                    <circle cx="23" cy="15" r="2" fill="#007bff"/>
                  </svg>
                </div>
                <div className="chatbot-header-text">
                  <span className="chatbot-title">David Chatbot</span>
                  <span className="chatbot-subtitle">Ask me anything about the book</span>
                </div>
              </div>
              <button className="close-button" onClick={toggleChat}>×</button>
            </div>
            
            <div className="chatbot-messages">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <div className="welcome-icon">👋</div>
                  <div className="welcome-text">Hello! I'm here to help you with questions about the book. How can I assist you today?</div>
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-bubble">
                    {message.sender === 'bot' ? (
                      <div 
                        className="message-text"
                        dangerouslySetInnerHTML={{ 
                          __html: parseMarkdownLinks(message.text) 
                        }} 
                      />
                    ) : (
                      <div className="message-text">{message.text}</div>
                    )}
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message bot">
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-container">
              <div className="chatbot-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  className="chatbot-input"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <button
                  className="send-button"
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
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
          font-weight: 300;
        }

        .chatbot-iframe-wrapper {
          position: fixed;
          bottom: 90px;
          right: 20px;
          transform: scale(0);
          transform-origin: bottom right;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        }

        .chatbot-iframe-wrapper.open {
          transform: scale(1);
        }

        .chatbot-iframe-container {
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(10px);
        }

        .chatbot-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .chatbot-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .chatbot-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chatbot-avatar svg {
          width: 24px;
          height: 24px;
        }

        .chatbot-header-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .chatbot-title {
          font-size: 16px;
          font-weight: 600;
        }

        .chatbot-subtitle {
          font-size: 12px;
          opacity: 0.9;
          font-weight: 400;
        }

        .close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 4px 10px;
          line-height: 1;
          transition: all 0.2s ease;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: #999;
        }

        .welcome-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .welcome-icon {
          font-size: 48px;
          margin-bottom: 16px;
          animation: wave 2s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }

        .welcome-text {
          font-size: 14px;
          line-height: 1.6;
          max-width: 280px;
        }

        .message {
          display: flex;
          margin-bottom: 4px;
          animation: messageSlide 0.3s ease-out;
        }

        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.user {
          justify-content: flex-end;
        }

        .message.bot {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
          position: relative;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .message.user .message-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.bot .message-bubble {
          background: white;
          color: #333;
          border-bottom-left-radius: 4px;
          border: 1px solid #e0e0e0;
        }

        .message-text {
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .message-link {
          color: #667eea;
          text-decoration: underline;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .message-link:hover {
          color: #764ba2;
          text-decoration: none;
        }

        .message.bot .message-link {
          color: #667eea;
        }

        .message.bot .message-link:hover {
          color: #764ba2;
        }

        .message-time {
          font-size: 10px;
          opacity: 0.7;
          margin-top: 4px;
          text-align: right;
        }

        .message.bot .message-time {
          text-align: left;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .chatbot-input-container {
          padding: 16px;
          background: white;
          border-top: 1px solid #e0e0e0;
        }

        .chatbot-input-wrapper {
          display: flex;
          gap: 8px;
          align-items: center;
          background: #f5f5f5;
          border-radius: 24px;
          padding: 4px;
          transition: all 0.3s ease;
        }

        .chatbot-input-wrapper:focus-within {
          background: #e8e8e8;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        .chatbot-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 10px 16px;
          font-size: 14px;
          background: transparent;
          color: #333;
        }

        .chatbot-input::placeholder {
          color: #999;
        }

        .chatbot-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .send-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .send-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-button svg {
          width: 18px;
          height: 18px;
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
            border-radius: 20px 20px 0 0;
          }

          .chatbot-toggle {
            width: 56px;
            height: 56px;
          }

          .chat-icon svg {
            width: 28px;
            height: 28px;
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
