import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { tamilContent } from './content/tamil';
import { englishContent } from './content/english';
import { images } from './content/images';
import help1 from './images/help1.jpg';
import help2 from './images/help2.png';

// Replace placeholder images with local images
const helpImage1 = help1;
const helpImage2 = help2;

function App() {
  const [language, setLanguage] = useState('tamil');
  const [selectedSection, setSelectedSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  
  // Touch handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwipingRef = useRef(false);
  const cardRef = useRef(null);
  const hasShownHintRef = useRef(false);

  useEffect(() => {
    // Show swipe hint when a section is selected for the first time
    if (selectedSection && !hasShownHintRef.current) {
      const timer = setTimeout(() => {
        setShowSwipeHint(true);
        hasShownHintRef.current = true;
        
        // Hide hint after animation
        setTimeout(() => {
          setShowSwipeHint(false);
        }, 3000);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedSection]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    isSwipingRef.current = true;
    if (cardRef.current) {
      cardRef.current.classList.add('swiping');
    }
  };

  const handleTouchMove = (e) => {
    if (!isSwipingRef.current) return;
    touchEndX.current = e.touches[0].clientX;
    
    const diff = touchStartX.current - touchEndX.current;
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${-diff}px)`;
    }
  };

  const handleTouchEnd = (paragraphs) => {
    if (!isSwipingRef.current) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const threshold = window.innerWidth * 0.2; // 20% of screen width

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentCardIndex < paragraphs.length - 1) {
        // Swipe left
        setCurrentCardIndex(prev => prev + 1);
      } else if (diff < 0 && currentCardIndex > 0) {
        // Swipe right
        setCurrentCardIndex(prev => prev - 1);
      }
    }

    // Reset
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      cardRef.current.classList.remove('swiping');
    }
    isSwipingRef.current = false;
  };

  const content = {
    tamil: tamilContent,
    english: englishContent
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setIsSidebarVisible(false);
    setCurrentCardIndex(0); // Reset card index when selecting new section
  };

  const handleBackClick = () => {
    if (!isSidebarVisible) {
      setIsSidebarVisible(true);
    }
  };

  const currentContent = content[language];

  const renderContent = () => {
    let title = '';
    let paragraphs = [];

    if (selectedSection === 'foreword') {
      title = currentContent.foreword.title;
      paragraphs = currentContent.foreword.paragraphs.map(p => ({
        ...p,
        image: images[p.image]
      }));
    } else if (selectedSection === 'conclusion') {
      title = currentContent.conclusion.title;
      paragraphs = currentContent.conclusion.paragraphs.map(p => ({
        ...p,
        image: images[p.image]
      }));
    } else if (selectedSection) {
      const section = currentContent.sections.find(section =>
        section.subsections.some(sub => sub.id === selectedSection)
      );
      const subsection = section?.subsections.find(sub => sub.id === selectedSection);
      if (subsection) {
        title = subsection.title;
        paragraphs = subsection.paragraphs.map(p => ({
          ...p,
          image: images[p.image]
        }));
      }
    }

    if (!selectedSection) {
      return (
        <div className="welcome-message">
          <h2>{language === 'tamil' ? 'வரவேற்பு' : 'Welcome'}</h2>
          <p>{language === 'tamil' ? 'தயவுசெய்து ஒரு பிரிவைத் தேர்ந்தெடுக்கவும்' : 'Please select a section'}</p>
        </div>
      );
    }

    const isMobile = window.innerWidth <= 768;
    const displayParagraphs = isMobile ? [paragraphs[currentCardIndex]] : paragraphs;

    return (
      <>
        <div className="selected-title">
          <h2>{title}</h2>
        </div>
        <div className="content-cards">
          {showSwipeHint && isMobile && paragraphs.length > 1 && (
            <div className="swipe-hint-container">
              <span className="swipe-icon">←</span>
              {language === 'tamil' ? 'ஸ்வைப் செய்யவும்' : 'Swipe to navigate'}
              <span className="swipe-icon">→</span>
            </div>
          )}
          {displayParagraphs.map((paragraph, index) => (
            <div 
              key={index} 
              className="content-card"
              style={{ backgroundImage: `url(${paragraph.image})` }}
              ref={cardRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(paragraphs)}
            >
              <div 
                className="card-content"
                ref={(el) => {
                  if (el) {
                    const isScrollable = el.scrollHeight > el.clientHeight;
                    el.classList.toggle('no-scroll', !isScrollable);
                  }
                }}
              >
                <p>{paragraph.content}</p>
              </div>
            </div>
          ))}
        </div>
        {isMobile && paragraphs.length > 1 && (
          <div className="card-navigation">
            <div className="card-dots">
              {paragraphs.map((_, index) => (
                <div 
                  key={index}
                  className={`card-dot ${index === currentCardIndex ? 'active' : ''}`}
                  onClick={() => setCurrentCardIndex(index)}
                />
              ))}
            </div>
            <div className="card-counter">
              {currentCardIndex + 1} / {paragraphs.length}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        {selectedSection && !isSidebarVisible && (
          <span className="back-button" onClick={handleBackClick}>
            ←
          </span>
        )}
        <h1>{currentContent.title}</h1>
        <div className="language-switcher">
          <button 
            className={language === 'tamil' ? 'active' : ''} 
            onClick={() => setLanguage('tamil')}
          >
            தமிழ்
          </button>
          <button 
            className={language === 'english' ? 'active' : ''} 
            onClick={() => setLanguage('english')}
          >
            English
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Sidebar */}
        <aside className={`sidebar ${!isSidebarVisible ? 'hidden' : ''}`}>
          <nav className="section-nav">
            {/* Foreword */}
            <div 
              className={`nav-special-section ${selectedSection === 'foreword' ? 'active' : ''}`}
              onClick={() => handleSectionSelect('foreword')}
            >
              {currentContent.foreword.title}
            </div>

            {/* Regular Sections */}
            {currentContent.sections.map(section => (
              <div key={section.id} className="nav-section">
                <div 
                  className={`nav-section-header ${expandedSections[section.id] ? 'expanded' : ''}`}
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="section-title">{section.title}</span>
                  <span className={`arrow ${expandedSections[section.id] ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
                
                <div className={`nav-subsections ${expandedSections[section.id] ? 'expanded' : ''}`}>
                  {section.subsections.map(subsection => (
                    <div 
                      key={subsection.id} 
                      className={`nav-subsection ${selectedSection === subsection.id ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSectionSelect(subsection.id);
                      }}
                    >
                      {subsection.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Conclusion */}
            <div 
              className={`nav-special-section ${selectedSection === 'conclusion' ? 'active' : ''}`}
              onClick={() => handleSectionSelect('conclusion')}
            >
              {currentContent.conclusion.title}
            </div>
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="content" style={{height: '100%',width: '100%',overflow: 'auto'}}>
          {renderContent()}
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 {currentContent.title}</p>
          <p>{language === 'tamil' ? 'ஆசிரியர்: டேவிட் சூசைராஜ்' : 'Author: David Susairaj'}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
