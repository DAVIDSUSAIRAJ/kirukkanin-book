import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { tamilContent } from './content/tamil';
import { englishContent } from './content/english';
import { hindiContent } from './content/hindi';
import { teluguContent } from './content/telugu';
import { malayalamContent } from './content/malayalam';
import { languages, defaultLanguage, getLanguageFont } from './config/languages';
import LanguageSelector from './components/LanguageSelector';
import { images } from './content/images';
import help1 from './images/help1.jpg';
import help2 from './images/help2.png';

// Replace placeholder images with local images
const helpImage1 = help1;
const helpImage2 = help2;

const contentMap = {
  ta: tamilContent,
  en: englishContent,
  hi: hindiContent,
  te: teluguContent,
  ml: malayalamContent
};

// Translation functions
const getAuthorText = (languageCode) => {
  const translations = {
    ta: 'ஆசிரியர்: டேவிட் சூசைராஜ்',
    en: 'Author: David Susairaj',
    hi: 'लेखक: डेविड सुसैराज',
    te: 'రచయిత: డేవిడ్ సుసైరాజ్',
    ml: 'രചയിതാവ്: ഡേവിഡ് സുസൈരാജ്'
  };
  return translations[languageCode] || translations.en;
};

const getGlobalSearchPlaceholder = (languageCode) => {
  const translations = {
    ta: 'முழு புத்தகத்திலும் தேடுங்கள் (ex: காதல், மகிழ்ச்சி)...',
    en: 'Search entire book (ex: love, happiness)...',
    hi: 'पूरी किताब में खोजें (ex: प्रेम, खुशी)...',
    te: 'మొత్తం పుస్తకంలో వెతకండి (ex: ప్రేమ, ఆనందం)...',
    ml: 'മുഴുവൻ പുസ്തകത്തിലും തിരയുക (ex: സ്നേഹം, സന്തോഷം)...'
  };
  return translations[languageCode] || translations.en;
};

const getSectionSearchPlaceholder = (languageCode) => {
  const translations = {
    ta: 'இந்த பிரிவில் தேடுங்கள் (ex: வார்த்தைகள், கருத்துகள்)...',
    en: 'Search in this section (ex: words, thoughts)...',
    hi: 'इस भाग में खोजें (ex: शब्द, विचार)...',
    te: 'ఈ విభాగంలో వెతకండి (ex: పదాలు, ఆలోచనలు)...',
    ml: 'ഈ വിഭാഗത്തിൽ തിരയുക (ex: വാക്കുകൾ, ചിന്തകൾ)...'
  };
  return translations[languageCode] || translations.en;
};

const getResultsText = (languageCode, count) => {
  const translations = {
    ta: `${count} முடிவுகள் கண்டறியப்பட்டன`,
    en: `${count} results found`,
    hi: `${count} परिणाम मिले`,
    te: `${count} ఫలితాలు దొరికాయి`,
    ml: `${count} ഫലങ്ങൾ കണ്ടെത്തി`
  };
  return translations[languageCode] || translations.en;
};

const getSearchResultsTitle = (languageCode, count) => {
  const translations = {
    ta: `தேடல் முடிவுகள் (${count})`,
    en: `Search Results (${count})`,
    hi: `खोज परिणाम (${count})`,
    te: `వెతుకుడు ఫలితాలు (${count})`,
    ml: `തിരയൽ ഫലങ്ങൾ (${count})`
  };
  return translations[languageCode] || translations.en;
};

const getNoResultsText = (languageCode) => {
  const translations = {
    ta: 'தேடல் முடிவுகள் எதுவும் கிடைக்கவில்லை',
    en: 'No search results found',
    hi: 'कोई खोज परिणाम नहीं मिला',
    te: 'వెతుకుడు ఫలితాలు దొరకలేదు',
    ml: 'തിരയൽ ഫലങ്ങൾ കണ്ടെത്തിയില്ല'
  };
  return translations[languageCode] || translations.en;
};

// Helper function to strip HTML tags
const stripHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

function App() {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
  const [content, setContent] = useState(contentMap[languages[defaultLanguage].code]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Touch handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const isSwipingRef = useRef(false);
  const cardRef = useRef(null);
  const hasShownHintRef = useRef(false);

  // Search states
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [sectionSearchQuery, setSectionSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isGlobalSearching, setIsGlobalSearching] = useState(false);

  useEffect(() => {
    const languageCode = languages[currentLanguage].code;
    setContent(contentMap[languageCode]);
    document.body.style.fontFamily = getLanguageFont(languageCode);
  }, [currentLanguage]);

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

  // Global search functionality
  const performGlobalSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsGlobalSearching(false);
      return;
    }

    setIsGlobalSearching(true);
    const searchTerms = query.split(',').map(term => term.trim().toLowerCase()).filter(term => term);
    const results = [];

    // Search in foreword
    if (content.foreword.paragraphs) {
      content.foreword.paragraphs.forEach((paragraph, index) => {
        if (paragraph.content && searchTerms.some(term => 
          paragraph.content.toLowerCase().includes(term)
        )) {
          results.push({
            sectionId: 'foreword',
            sectionTitle: content.foreword.title,
            paragraphIndex: index,
            content: paragraph.content,
            image: paragraph.image
          });
        }
      });
    }

    // Search in sections
    content.sections.forEach(section => {
      section.subsections.forEach(subsection => {
        if (subsection.paragraphs) {
          subsection.paragraphs.forEach((paragraph, index) => {
            if (paragraph.content && searchTerms.some(term => 
              paragraph.content.toLowerCase().includes(term)
            )) {
              results.push({
                sectionId: subsection.id,
                sectionTitle: `${section.title} - ${subsection.title}`,
                paragraphIndex: index,
                content: paragraph.content,
                image: paragraph.image
              });
            }
          });
        }
      });
    });

    // Search in conclusion
    if (content.conclusion.paragraphs) {
      content.conclusion.paragraphs.forEach((paragraph, index) => {
        if (paragraph.content && searchTerms.some(term => 
          paragraph.content.toLowerCase().includes(term)
        )) {
          results.push({
            sectionId: 'conclusion',
            sectionTitle: content.conclusion.title,
            paragraphIndex: index,
            content: paragraph.content,
            image: paragraph.image
          });
        }
      });
    }

    setSearchResults(results);
  };

  // Section search functionality
  const performSectionSearch = (query) => {
    if (!selectedSection || !query.trim()) {
      return null;
    }

    const searchTerms = query.split(',').map(term => term.trim().toLowerCase()).filter(term => term);
    let paragraphs = [];

    if (selectedSection === 'foreword') {
      paragraphs = content.foreword.paragraphs || [];
    } else if (selectedSection === 'conclusion') {
      paragraphs = content.conclusion.paragraphs || [];
    } else {
      const section = content.sections.find(section =>
        section.subsections.some(sub => sub.id === selectedSection)
      );
      const subsection = section?.subsections.find(sub => sub.id === selectedSection);
      paragraphs = subsection?.paragraphs || [];
    }

    return paragraphs.filter(paragraph => 
      paragraph.content && searchTerms.some(term => 
        paragraph.content.toLowerCase().includes(term)
      )
    );
  };

  // Search handlers
  const handleGlobalSearchChange = (e) => {
    const query = e.target.value;
    setGlobalSearchQuery(query);
    performGlobalSearch(query);
  };

  const handleSectionSearchChange = (e) => {
    setSectionSearchQuery(e.target.value);
  };

  const handleSearchResultClick = (result) => {
    setSelectedSection(result.sectionId);
    setIsSidebarVisible(false);
    setCurrentCardIndex(result.paragraphIndex);
    setGlobalSearchQuery('');
    setSearchResults([]);
    setIsGlobalSearching(false);
  };

  // Function to render search results as cards
  const renderSearchResultsAsCards = () => {
    const isMobile = window.innerWidth <= 768;
    
    return (
      <div className="search-results-cards">
        <div className="search-results-header-title">
          <h2>
            {getSearchResultsTitle(languages[currentLanguage].code, searchResults.length)}
          </h2>
        </div>
        
        <div className="content-cards">
          {searchResults.map((result, index) => (
            <div 
              key={index} 
              className="content-card search-result-card"
              style={{ backgroundImage: `url(${images[result.image]})` }}
              onClick={() => handleSearchResultClick(result)}
            >
              <div className="card-content">
                <div className="search-card-section">
                  {result.sectionTitle}
                </div>
                <p dangerouslySetInnerHTML={{ __html: result.content }}></p>
              </div>
            </div>
          ))}
        </div>
        
        {searchResults.length === 0 && globalSearchQuery && (
          <div className="no-results">
            <p>
              {getNoResultsText(languages[currentLanguage].code)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const handleTouchStart = (e) => {
    // Check if the touch started on a scrollable element
    const target = e.target;
    const isScrollable = target.scrollHeight > target.clientHeight;
    
    // If the element is scrollable, don't start swiping
    if (isScrollable) {
      isSwipingRef.current = false;
      return;
    }
    
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipingRef.current = true;
    if (cardRef.current) {
      cardRef.current.classList.add('swiping');
    }
  };

  const handleTouchMove = (e) => {
    if (!isSwipingRef.current) return;
    
    // If we're scrolling vertically, don't handle the swipe
    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;
    const deltaY = Math.abs(touchY - touchStartY.current);
    const deltaX = Math.abs(touchX - touchStartX.current);
    
    if (deltaY > deltaX) {
      isSwipingRef.current = false;
      if (cardRef.current) {
        cardRef.current.classList.remove('swiping');
        cardRef.current.style.transform = '';
      }
      return;
    }
    
    touchEndX.current = touchX;
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

  const handleLanguageChange = (languageCode) => {
    const selectedLanguage = Object.keys(languages).find(
      key => languages[key].code === languageCode
    );
    setCurrentLanguage(selectedLanguage);
  };

  const getHeaderTitles = () => {
    if (!selectedSection) {
      return {
        mainTitle: content.title,
        subTitle: null
      };
    }

    let subTitle = '';
    if (selectedSection === 'foreword') {
      subTitle = content.foreword.title;
    } else if (selectedSection === 'conclusion') {
      subTitle = content.conclusion.title;
    } else {
      const section = content.sections.find(section =>
        section.subsections.some(sub => sub.id === selectedSection)
      );
      const subsection = section?.subsections.find(sub => sub.id === selectedSection);
      if (subsection) {
        subTitle = `${section.title} - ${subsection.title}`;
      }
    }

    return {
      mainTitle: content.title,
      subTitle
    };
  };

  const renderContent = () => {
    let title = '';
    let allParagraphs = [];

    if (selectedSection === 'foreword') {
      title = content.foreword.title;
      allParagraphs = content.foreword.paragraphs?.map(p => ({
        ...p,
        image: images[p.image]
      })) || [];
    } else if (selectedSection === 'conclusion') {
      title = content.conclusion.title;
      allParagraphs = content.conclusion.paragraphs?.map(p => ({
        ...p,
        image: images[p.image]
      })) || [];
    } else if (selectedSection) {
      const section = content.sections.find(section =>
        section.subsections.some(sub => sub.id === selectedSection)
      );
      const subsection = section?.subsections.find(sub => sub.id === selectedSection);
      if (subsection) {
        title = subsection.title;
        allParagraphs = subsection.paragraphs?.map(p => ({
          ...p,
          image: images[p.image]
        })) || [];
      }
    }

    if (!selectedSection) {
      return (
        <div className="welcome-message">
          <h2>{languages[currentLanguage].name === 'தமிழ்' ? 'வரவேற்பு' : 'Welcome'}</h2>
          <p>{languages[currentLanguage].name === 'தமிழ்' ? 'தயவுசெய்து ஒரு பிரிவைத் தேர்ந்தெடுக்கவும்' : 'Please select a section'}</p>
        </div>
      );
    }

    // Filter paragraphs based on section search
    let paragraphs = allParagraphs;
    if (sectionSearchQuery.trim()) {
      const filteredParagraphs = performSectionSearch(sectionSearchQuery);
      if (filteredParagraphs) {
        paragraphs = filteredParagraphs.map(p => ({
          ...p,
          image: images[p.image]
        }));
      }
    }

    const isMobile = window.innerWidth <= 768;
    const displayParagraphs = isMobile ? [paragraphs[currentCardIndex]] : paragraphs;

    return (
      <>
        <div className="selected-title">
          <div className="title-search-container">
            <h2>{title}</h2>
            {/* Section Search Bar */}
            <div className="section-search-container">
              <input
                type="text"
                className="section-search-input"
                placeholder={getSectionSearchPlaceholder(languages[currentLanguage].code)}
                value={sectionSearchQuery}
                onChange={handleSectionSearchChange}
              />
              {sectionSearchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSectionSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Show search info only when there are results and search is active */}
        {sectionSearchQuery && paragraphs.length >= 1 && (
          <div className="search-results-info">
            {getResultsText(languages[currentLanguage].code, paragraphs.length)}
          </div>
        )}
        
        {paragraphs.length === 0 && sectionSearchQuery ? (
          <div className="no-results">
            <p>{getNoResultsText(languages[currentLanguage].code)}</p>
          </div>
        ) : (
          <>
            <div className="content-cards">
              {showSwipeHint && isMobile && paragraphs.length > 1 && (
                <div className="swipe-hint-container">
                  <span className="swipe-icon">←</span>
                  {languages[currentLanguage].name === 'தமிழ்' ? 'ஸ்வைப் செய்யவும்' : 'Swipe to navigate'}
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
                    <p dangerouslySetInnerHTML={{ __html: paragraph.content }}></p>
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
        
        {/* Titles Section */}
        <div className="header-titles">
          <h1>{getHeaderTitles().mainTitle}</h1>
          {getHeaderTitles().subTitle && (
            <h2 className={`subtitle ${isMobile ? 'mobile-hide' : ''}`}>{getHeaderTitles().subTitle}</h2>
          )}
        </div>
        
        {/* Second Row Container for Mobile - contains search and language selector */}
        <div className="header-second-row">
          {/* Global Search Bar */}
          <div className="global-search-container">
            <input
              type="text"
              className="global-search-input"
              placeholder={getGlobalSearchPlaceholder(languages[currentLanguage].code)}
              value={globalSearchQuery}
              onChange={handleGlobalSearchChange}
            />
            {globalSearchQuery && (
              <button 
                className="clear-global-search-btn"
                onClick={() => {
                  setGlobalSearchQuery('');
                  setSearchResults([]);
                  setIsGlobalSearching(false);
                }}
              >
                ✕
              </button>
            )}
            
            {/* Global Search Results */}
            {isGlobalSearching && searchResults.length > 0 && (
              <div className={`global-search-results ${window.innerWidth <= 768 ? 'mobile-search-results' : ''}`}>
                <div className="search-results-header">
                  {getResultsText(languages[currentLanguage].code, searchResults.length)}
                </div>
                <div className="search-results-list">
                  {searchResults.slice(0, 10).map((result, index) => (
                    <div 
                      key={index} 
                      className="search-result-item"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="search-result-section">{result.sectionTitle}</div>
                      <div className="search-result-content">
                        {stripHtmlTags(result.content).substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 10 && (
                    <div className="search-results-more">
                      {languages[currentLanguage].name === 'தமிழ்' ? 
                        `மேலும் ${searchResults.length - 10} முடிவுகள்...` : 
                        `${searchResults.length - 10} more results...`}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {isGlobalSearching && searchResults.length === 0 && globalSearchQuery && (
              <div className={`global-no-results ${window.innerWidth <= 768 ? 'mobile-no-results' : ''}`}>
                {getNoResultsText(languages[currentLanguage].code)}
              </div>
            )}
          </div>
          
          {/* Language Selector Space - contains the language selector */}
          <div className="header-language-space">
            <LanguageSelector
              currentLanguage={languages[currentLanguage].code}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Limage.png*/}
        <aside className={`sidebar ${!isSidebarVisible ? 'hidden' : ''} ${isGlobalSearching && window.innerWidth <= 768 ? 'mobile-search-hidden' : ''}`}>
          <nav className="section-nav">
            {/* Foreword */}
            <div 
              className={`nav-special-section ${selectedSection === 'foreword' ? 'active' : ''}`}
              onClick={() => handleSectionSelect('foreword')}
            >
              {content.foreword.title}
            </div>

            {/* Regular Sections */}
            {content.sections.map(section => (
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
              {content.conclusion.title}
            </div>
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className={`content ${isGlobalSearching && window.innerWidth <= 768 ? 'mobile-search-active' : ''}`} style={{height: '100%',width: '100%',overflow: 'auto'}}>
          {/* Show search results as cards on mobile when searching */}
          {isGlobalSearching && window.innerWidth <= 768 && globalSearchQuery ? 
            renderSearchResultsAsCards() : 
            renderContent()
          }
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 {content.title}</p>
          <p>{getAuthorText(languages[currentLanguage].code)}</p>
        </div>
      </footer>

      <style jsx>{`
        .header {
          padding: 20px;
          position: relative;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: grid;
          grid-template-columns: 0.6fr 2.8fr 0.6fr;
          align-items: flex-start;
          gap: 10px;
        }

        /* Desktop header second row - should span grid columns 2 and 3 */
        .header-second-row {
          display: contents; /* This makes children participate in grid layout */
        }

        .header-titles {
          justify-self: start;
          min-width: 0; /* Allow text to wrap/truncate */
        }

        .header h1 {
          margin: 0;
          font-size: 1.6em;
          color: #333;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        .header .subtitle {
          margin: 8px 0 0;
          font-size: 1em;
          color: #666;
          font-weight: normal;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }

        .back-button {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 34px;
          cursor: pointer;
          color: #333;
          padding: 10px;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          color: #666;
        }

        /* Main Content Layout */
        .main-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #ddd;
          margin-top: auto;
        }

        .footer-content p {
          margin: 5px 0;
          color: #666;
        }

        /* Global Search Styles */
        .global-search-container {
          margin: 0;
          position: relative;
          max-width: 550px;
          justify-self: end;
          width: 100%;
          margin-right: 0px;
          margin-left: auto;
        }

        .global-search-input {
          width: 100%;
          padding: 10px 35px 10px 15px;
          border: 2px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
          min-width: 350px;
        }

        .global-search-input::placeholder {
          font-size: 12px;
          color: #999;
        }

        .global-search-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          transform: translateY(-1px);
        }

        .clear-global-search-btn {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #999;
          padding: 5px;
        }

        .clear-global-search-btn:hover {
          color: #666;
        }

        .global-search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          max-height: 400px;
          overflow-y: auto;
        }

        .search-results-header {
          padding: 10px 15px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
          font-weight: bold;
          color: #333;
        }

        .search-results-list {
          max-height: 350px;
          overflow-y: auto;
        }

        .search-result-item {
          padding: 12px 15px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .search-result-item:hover {
          background: #f8f9fa;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-section {
          font-weight: bold;
          color: #007bff;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .search-result-content {
          color: #666;
          font-size: 14px;
          line-height: 1.4;
        }

        .search-results-more {
          padding: 10px 15px;
          text-align: center;
          color: #666;
          font-style: italic;
          background: #f8f9fa;
        }

        .global-no-results {
          padding: 20px;
          text-align: center;
          color: #666;
          background: white;
          border: 1px solid #ddd;
          border-radius: 10px;
          margin-top: 10px;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 1001;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Section Search Styles */
        .section-search-container {
          position: relative;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .title-search-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          width: 100%;
        }

        .selected-title h2 {
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .section-search-input {
          width: 100%;
          padding: 10px 35px 10px 15px;
          border: 2px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .section-search-input::placeholder {
          font-size: 12px;
          color: #999;
        }

        .section-search-input:focus {
          border-color: #28a745;
          box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
          transform: translateY(-1px);
        }

        .clear-search-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #999;
          padding: 5px;
        }

        .clear-search-btn:hover {
          color: #666;
        }

        .search-info {
          text-align: center;
          margin: 10px 0;
          color: #28a745;
          font-size: 14px;
          font-weight: bold;
        }

        /* Mobile Specific Styles */
        @media (max-width: 768px) {
          .title-search-container {
            display: flex;
            padding: 0 10px;
            gap: 15px;
            min-height: 50px;
            align-items: flex-start;
          }

          .selected-title {
            margin-bottom: 10px;
          }

          .selected-title h2 {
            font-size: 1em;
            width: 50%;
            white-space: normal;
            word-wrap: break-word;
            line-height: 1.4;
            margin: 0;
            padding-top: 5px;
            flex: 1;
            min-width: 45%;
            max-width: 50%;
          }

          .section-search-container {
            width: 50%;
            margin: 0;
            padding-top: 8px;
            position: relative;
            flex-shrink: 0;
          }

          .section-search-input {
            min-width: auto;
            width: 100%;
            font-size: 13px;
            padding: 6px 30px 6px 12px;
            height: 32px;
          }

          .search-info {
            margin: 8px 0;
            padding: 0 10px;
            font-size: 13px;
            width: 100%;
            clear: both;
          }

          .clear-search-btn {
            top: calc(50% + 4px);
          }
        }

        /* Search Results Cards */
        .search-results-cards {
          padding: 20px;
        }

        .search-results-header-title {
          text-align: center;
          margin-bottom: 20px;
        }

        .search-results-header-title h2 {
          color: #333;
          margin: 0;
        }

        .search-result-card {
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .search-result-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .search-card-section {
          background: rgba(0,123,255,0.9);
          color: white;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 10px;
          display: inline-block;
        }

        /* Mobile Specific Styles */
        @media (max-width: 768px) {
          /* App Container for Mobile */
          .App {
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
          }

          /* Header Mobile Layout - Fixed at top */
          .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding: 15px 20px;
            align-items: stretch;
            min-height: auto;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .header-titles {
            order: 1;
            justify-self: stretch;
            text-align: center;
            width: 100%;
            margin-bottom: 5px;
          }

          .header h1 {
            font-size: 1.4em;
            text-align: center;
            white-space: normal;
            margin-bottom: 3px;
          }

          .header .subtitle {
            text-align: center;
            white-space: normal;
            margin-top: 5px;
            font-size: 0.9em;
          }

          /* Second row container for mobile */
          .header-second-row {
            order: 2;
            display: flex;
            gap: 10px;
            align-items: center;
            width: 100%;
          }

          .global-search-container {
            order: 1;
            max-width: none;
            justify-self: stretch;
            width: 100%;
            margin: 0;
            flex: 1;
          }

          .global-search-input {
            min-width: auto;
            width: 100%;
            font-size: 14px;
            padding: 8px 35px 8px 12px;
          }

          .header-language-space {
            order: 2;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            flex-shrink: 0;
            position: relative;
            width: auto;
            min-width: 60px;
          }

          /* Main Content Area - Scrollable */
          .main-content {
            margin-top: 140px; /* Space for fixed header */
            margin-bottom: 120px; /* Increased space for navigation + footer */
            height: calc(100vh - 260px); /* Adjusted height */
            overflow: hidden;
            display: flex;
          }

          /* Footer - Fixed at bottom */
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: #f8f9fa;
            padding: 10px 20px;
            text-align: center;
            border-top: 1px solid #ddd;
            box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
          }

          .footer-content p {
            margin: 2px 0;
            font-size: 14px;
            color: #666;
          }

          /* Sidebar - Scrollable */
          .sidebar {
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
          }

          /* Content Area - Scrollable */
          .content {
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
          }

          /* Adjust back button for mobile header */
          .back-button {
            position: absolute;
            left: 0px;
            top: 0px;
            transform: none;
            font-size: 40px;
            z-index: 10;
          }

          .mobile-search-hidden {
            display: none;
          }

          .mobile-search-active {
            width: 100%;
            margin-left: 0;
            padding: 10px;
          }

          .search-results-cards {
            padding: 10px;
            margin-top: 10px;
          }

          .search-result-card {
            margin-bottom: 15px;
            background-color: rgba(0, 0, 0, 0.7);
          }

          .card-content {
            padding: 15px;
            min-height: 100px;
            max-height: 400px;
            overflow-y: auto;
          }

          .card-content p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 10px;
          }

          .search-result-content {
            font-size: 14px;
            line-height: 1.5;
            color: #fff;
            margin-top: 5px;
          }

          .content-cards {
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding: 10px;
          }

          .content-card {
            width: 100%;
            margin-bottom: 15px;
            border-radius: 10px;
            overflow: hidden;
          }

          /* Improve search visibility */
          .global-search-container {
            width: 100%;
            position: relative;
            z-index: 1000;
          }

          .global-search-results.mobile-search-results {
            position: fixed;
            top: 140px; /* Below fixed header */
            left: 0;
            right: 0;
            bottom: 80px; /* Above fixed footer */
            background: rgba(255, 255, 255, 0.98);
            overflow-y: auto;
            padding: 15px;
            z-index: 999;
            border-radius: 0;
            box-shadow: none;
            max-height: none;
          }

          .mobile-search-results .search-results-header {
            background: transparent;
            color: #333;
            text-align: center;
            font-size: 1.1em;
            padding: 15px;
            border-bottom: 1px solid #eee;
          }

          .mobile-search-results .search-result-item {
            background: #fff;
            margin-bottom: 15px;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #eee;
          }

          .mobile-search-results .search-result-section {
            color: #007bff;
            font-size: 1em;
            margin-bottom: 10px;
            font-weight: bold;
          }

          .mobile-search-results .search-result-content {
            color: #666;
            font-size: 0.9em;
            line-height: 1.5;
          }

          .mobile-search-results .search-results-more {
            text-align: center;
            padding: 15px;
            color: #666;
            font-style: italic;
            background: transparent;
          }

          .global-no-results.mobile-no-results {
            position: fixed;
            top: 140px;
            left: 0;
            right: 0;
            bottom: 80px;
            background: rgba(255, 255, 255, 0.98);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1em;
            color: #666;
            z-index: 999;
          }

          .mobile-hide {
            display: none !important;
          }
        }

        /* Language Selector positioning */
        .App > div:first-child {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1001;
        }

        .header-language-space {
          /* Empty space for language selector */
        }

        /* Card Navigation Styles */
        .card-navigation {
          position: fixed;
          bottom: 80px; /* Position above footer */
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.9);
          padding: 10px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 999;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        }

        .card-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          padding: 5px 0;
        }

        .card-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ccc;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .card-dot.active {
          background: #007bff;
          transform: scale(1.2);
        }

        .card-counter {
          font-size: 14px;
          color: #666;
          text-align: center;
        }

        /* Content Cards Adjustment */
        .content-cards {
          padding-bottom: 60px; /* Add space for navigation */
        }

        .search-results-info {
          background: #f8f9fa;
          padding: 10px 15px;
          margin: 0 10px 15px 10px;
          border-radius: 8px;
          color: #28a745;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          border-left: 4px solid #28a745;
        }

        @media (max-width: 768px) {
          .search-results-info {
            margin: 0 10px 10px 10px;
            font-size: 13px;
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
