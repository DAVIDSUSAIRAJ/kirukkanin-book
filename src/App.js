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

const getGlobalSearchPlaceholder = (languageCode, isMobile = false) => {
  const translations = {
    ta: isMobile ? 'தேடுங்கள்...' : 'முழு புத்தகத்திலும் தேடுங்கள் (ex: காதல், மகிழ்ச்சி)...',
    en: isMobile ? 'Search...' : 'Search entire book (ex: love, happiness)...',
    hi: isMobile ? 'खोजें...' : 'पूरी किताब में खोजें (ex: प्रेम, खुशी)...',
    te: isMobile ? 'వెతకండి...' : 'మొత్తం పుస్తకంలో వెతకండి (ex: ప్రేమ, ఆనందం)...',
    ml: isMobile ? 'തിരയുക...' : 'മുഴുവൻ പുസ്തകത്തിലും തിരയുക (ex: സ്നേഹം, സന്തോഷം)...'
  };
  return translations[languageCode] || translations.en;
};

const getSectionSearchPlaceholder = (languageCode, isMobile = false) => {
  const translations = {
    ta: 'பிரிவில் தேடுங்கள்...',
    en: 'Search section...',
    hi: 'भाग में खोजें...',
    te: 'విభాగంలో వెతకండి...',
    ml: 'വിഭാഗത്തിൽ തിരയുക...'
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
  
  // Add new state for tracking search-selected paragraph
  const [searchSelectedParagraph, setSearchSelectedParagraph] = useState(null);
  const [isFromSearch, setIsFromSearch] = useState(false);
  
  // Add new states for image loading and card transitions
  const [isCardTransitioning, setIsCardTransitioning] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState(new Set());
  const [cardLoadingState, setCardLoadingState] = useState({});
  
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

  // Image preloading function
  const preloadImage = (imageUrl) => {
    return new Promise((resolve, reject) => {
      if (!imageUrl) {
        reject(new Error('No image URL provided'));
        return;
      }
      
      if (preloadedImages.has(imageUrl)) {
        resolve(imageUrl);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, imageUrl]));
        resolve(imageUrl);
      };
      img.onerror = (error) => {
        console.warn('Image loading failed:', imageUrl);
        reject(error);
      };
      img.src = imageUrl;
    });
  };

  // Preload adjacent card images
  const preloadAdjacentImages = (paragraphs, currentIndex) => {
    if (!paragraphs || paragraphs.length === 0 || currentIndex < 0 || currentIndex >= paragraphs.length) {
      return;
    }
    
    const imagesToPreload = [];
    
    try {
      // Preload next image
      if (currentIndex < paragraphs.length - 1 && paragraphs[currentIndex + 1]?.image) {
        const nextImage = paragraphs[currentIndex + 1].image;
        if (nextImage && typeof nextImage === 'string') {
          imagesToPreload.push(nextImage);
        }
      }
      
      // Preload previous image
      if (currentIndex > 0 && paragraphs[currentIndex - 1]?.image) {
        const prevImage = paragraphs[currentIndex - 1].image;
        if (prevImage && typeof prevImage === 'string') {
          imagesToPreload.push(prevImage);
        }
      }
      
      // Preload current image if not already loaded
      if (paragraphs[currentIndex]?.image) {
        const currentImage = paragraphs[currentIndex].image;
        if (currentImage && typeof currentImage === 'string') {
          imagesToPreload.push(currentImage);
        }
      }
      
      imagesToPreload.forEach(imageUrl => {
        if (imageUrl && typeof imageUrl === 'string' && !preloadedImages.has(imageUrl)) {
          preloadImage(imageUrl).catch(error => {
            console.warn('Failed to preload image:', imageUrl, error);
          });
        }
      });
    } catch (error) {
      console.warn('Error in preloadAdjacentImages:', error);
    }
  };

  useEffect(() => {
    const languageCode = languages[currentLanguage].code;
    setContent(contentMap[languageCode]);
    document.body.style.fontFamily = getLanguageFont(languageCode);
    document.documentElement.lang = languageCode;
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
      // content-cards
  
      
      return () => clearTimeout(timer);
    }
  }, [selectedSection]);

  // Auto-scroll to selected paragraph on desktop when from search
  useEffect(() => {
    if (!isMobile && isFromSearch && searchSelectedParagraph && selectedSection) {
      setTimeout(() => {
        // Scroll to highlighted paragraph in content area
        const targetParagraph = document.querySelector('.content-card.search-highlighted');
        if (targetParagraph) {
          targetParagraph.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 300);
      
      // Scroll to selected subsection in sidebar (with longer delay to allow expansion)  
      setTimeout(() => {
        const selectedSubsection = document.querySelector('.nav-subsection.active');
        const sidebarNav = document.querySelector('.section-nav');
        
        if (selectedSubsection && sidebarNav) {
          // Calculate the position of the selected subsection relative to the sidebar
          const subsectionRect = selectedSubsection.getBoundingClientRect();
          const sidebarRect = sidebarNav.getBoundingClientRect();
          const relativeTop = subsectionRect.top - sidebarRect.top;
          
          // Scroll the sidebar to center the selected subsection
          sidebarNav.scrollTo({
            top: sidebarNav.scrollTop + relativeTop - (sidebarRect.height / 2),
            behavior: 'smooth'
          });
        }
      }, 500);
    }
  }, [selectedSection, isFromSearch, searchSelectedParagraph, isMobile]);

  // Preload images when section changes or card index changes  
  useEffect(() => {
    if (selectedSection && isMobile && content) {
      let paragraphs = [];
      
      try {
        if (selectedSection === 'foreword' && content.foreword) {
          paragraphs = content.foreword.paragraphs || [];
        } else if (selectedSection === 'conclusion' && content.conclusion) {
          paragraphs = content.conclusion.paragraphs || [];
        } else if (content.sections) {
          const section = content.sections.find(section =>
            section.subsections && section.subsections.some(sub => sub.id === selectedSection)
          );
          const subsection = section?.subsections?.find(sub => sub.id === selectedSection);
          paragraphs = subsection?.paragraphs || [];
        }
        
        if (paragraphs.length > 0 && currentCardIndex >= 0 && currentCardIndex < paragraphs.length) {
          preloadAdjacentImages(paragraphs, currentCardIndex);
        }
      } catch (error) {
        console.warn('Error in preloading images:', error);
      }
    }
  }, [selectedSection, currentCardIndex, content?.sections, isMobile]);

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
    setSearchSelectedParagraph(result.content);
    setIsFromSearch(true);
    
    // Auto-expand the parent section in sidebar
    if (result.sectionId !== 'foreword' && result.sectionId !== 'conclusion') {
      const section = content.sections.find(section =>
        section.subsections.some(sub => sub.id === result.sectionId)
      );
      if (section) {
        setExpandedSections(prev => ({
          ...prev,
          [section.id]: true
        }));
      }
    }
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
      let newIndex = currentCardIndex;
      
      if (diff > 0 && currentCardIndex < paragraphs.length - 1) {
        // Swipe left - next card
        newIndex = currentCardIndex + 1;
      } else if (diff < 0 && currentCardIndex > 0) {
        // Swipe right - previous card
        newIndex = currentCardIndex - 1;
      }
      
                    if (newIndex !== currentCardIndex && paragraphs && paragraphs[newIndex]) {
        try {
          // Start card transition animation
          setIsCardTransitioning(true);
          
          // Set loading state for the new card only if image needs to be loaded
          const newImageUrl = paragraphs[newIndex]?.image;
          if (newImageUrl && typeof newImageUrl === 'string' && !preloadedImages.has(newImageUrl)) {
            setCardLoadingState(prev => ({ ...prev, [newIndex]: true }));
            
            // Preload the new image
            preloadImage(newImageUrl).then(() => {
              setCardLoadingState(prev => ({ ...prev, [newIndex]: false }));
            }).catch((error) => {
              console.warn('Failed to preload image:', newImageUrl, error);
              setCardLoadingState(prev => ({ ...prev, [newIndex]: false }));
            });
          } else {
            // Image already loaded or no image, ensure loading state is false
            setCardLoadingState(prev => ({ ...prev, [newIndex]: false }));
          }
          
          // Change card index with smooth transition
          setTimeout(() => {
            setCurrentCardIndex(newIndex);
            // Preload adjacent images for the new current card
            preloadAdjacentImages(paragraphs, newIndex);
            
            // End transition after animation completes
            setTimeout(() => {
              setIsCardTransitioning(false);
            }, 500);
          }, 50);
        } catch (error) {
          console.warn('Error in card transition:', error);
          setIsCardTransitioning(false);
          setCardLoadingState(prev => ({ ...prev, [newIndex]: false }));
        }
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
    setSearchSelectedParagraph(null); // Clear search selection
    setIsFromSearch(false); // Reset search flag
    setCardLoadingState({}); // Clear loading states
    
    // Start loading animation for first card on mobile
    if (isMobile) {
      setIsCardTransitioning(true);
      
      // Get first card image and show loading if needed
      setTimeout(() => {
        try {
          if (content) {
            let paragraphs = [];
            
            if (section === 'foreword' && content.foreword) {
              paragraphs = content.foreword.paragraphs || [];
            } else if (section === 'conclusion' && content.conclusion) {
              paragraphs = content.conclusion.paragraphs || [];
            } else if (content.sections) {
              const sectionData = content.sections.find(s =>
                s.subsections && s.subsections.some(sub => sub.id === section)
              );
              const subsection = sectionData?.subsections?.find(sub => sub.id === section);
              paragraphs = subsection?.paragraphs || [];
            }
            
            if (paragraphs.length > 0 && paragraphs[0]?.image && typeof paragraphs[0].image === 'string') {
              const firstImageUrl = paragraphs[0].image;
              if (!preloadedImages.has(firstImageUrl)) {
                // Show loading state for first card
                setCardLoadingState(prev => ({ ...prev, [0]: true }));
                
                // Preload the first image
                preloadImage(firstImageUrl).then(() => {
                  setCardLoadingState(prev => ({ ...prev, [0]: false }));
                }).catch(error => {
                  console.warn('Failed to preload first card image:', error);
                  setCardLoadingState(prev => ({ ...prev, [0]: false }));
                });
              } else {
                // Image already loaded
                setCardLoadingState(prev => ({ ...prev, [0]: false }));
              }
              
              // Preload adjacent images for smooth navigation
              preloadAdjacentImages(paragraphs, 0);
            } else {
              // No image, ensure loading state is false
              setCardLoadingState(prev => ({ ...prev, [0]: false }));
            }
            
            // End transition after animation completes
            setTimeout(() => {
              setIsCardTransitioning(false);
            }, 500);
          }
          
          const contentCards = document.querySelector('.content-cards');
          if (contentCards) {
            contentCards.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } catch (error) {
          console.warn('Error in handleSectionSelect:', error);
          setIsCardTransitioning(false);
          setCardLoadingState(prev => ({ ...prev, [0]: false }));
        }
      }, 50);
    } else {
      // Desktop - no loading animation needed
      setIsCardTransitioning(false);
      setTimeout(() => {
        const contentCards = document.querySelector('.content-cards');
        if (contentCards) {
          contentCards.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleBackClick = () => {
    if (!isSidebarVisible) {
      setIsSidebarVisible(true);
      // Keep selectedSection to show which section was selected
      setCurrentCardIndex(0);    // Reset card index
      setSearchSelectedParagraph(null); // Clear search selection
      setIsFromSearch(false); // Reset search flag
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
    // For mobile: show single paragraph at currentCardIndex
    // For desktop: show all paragraphs, but scroll to selected one if from search
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
                placeholder={getSectionSearchPlaceholder(languages[currentLanguage].code, window.innerWidth <= 768)}
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
          {sectionSearchQuery && paragraphs.length >= 1 && !isMobile && (
          <div className="search-results-info">
            {getResultsText(languages[currentLanguage].code, paragraphs.length)}
          </div>
        )}
          </div>
        </div>
        
        {/* Show search info only when there are results and search is active */}
        {sectionSearchQuery && paragraphs.length >= 1 && isMobile && (
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
              {displayParagraphs.map((paragraph, index) => {
                // Check if this paragraph is the one selected from search
                const isSearchHighlighted = isFromSearch && 
                  searchSelectedParagraph && 
                  paragraph.content === searchSelectedParagraph;
                
                // For desktop, use the actual index from all paragraphs
                // For mobile, use the display index
                const actualIndex = isMobile ? currentCardIndex : paragraphs.findIndex(p => p.content === paragraph.content);
                
                // Check if card is loading or transitioning
                const isCardLoading = cardLoadingState[actualIndex] || false;
                const imageUrl = paragraph?.image;
                const isImagePreloaded = imageUrl ? preloadedImages.has(imageUrl) : true; // Default to true if no image
                
                return (
                  <div 
                    key={actualIndex} 
                    className={`content-card ${isSearchHighlighted ? 'search-highlighted' : ''} ${isCardTransitioning && isMobile ? 'card-transitioning' : ''} ${isCardLoading ? 'card-loading' : ''}`}
                    style={{ backgroundImage: paragraph?.image ? `url(${paragraph.image})` : 'none' }}
                    ref={cardRef}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => handleTouchEnd(paragraphs)}
                  >
                    {/* Loading spinner for mobile cards */}
                    {isMobile && isCardLoading && (
                      <div className="card-loading-overlay">
                        <div className="card-loading-spinner"></div>
                      </div>
                    )}
                    
                    <div 
                      className="card-content"
                      ref={(el) => {
                        if (el) {
                          const isScrollable = el.scrollHeight > el.clientHeight;
                          el.classList.toggle('no-scroll', !isScrollable);
                        }
                      }}
                    >
                      <p 
                        className={isSearchHighlighted ? 'search-highlighted-text' : ''}
                        dangerouslySetInnerHTML={{ __html: paragraph.content }}
                      ></p>
                    </div>
                  </div>
                );
              })}
            </div>
            {isMobile && paragraphs.length > 1 && !isSidebarVisible && (
              <div className="card-navigation">
                <div className="card-dots">
                  {paragraphs.map((_, index) => (
                    <div 
                      key={index}
                      className={`card-dot ${index === currentCardIndex ? 'active' : ''}`}
                      onClick={() => {
                                                 if (index !== currentCardIndex && paragraphs && paragraphs[index]) {
                          try {
                           // Start card transition animation
                           setIsCardTransitioning(true);
                           
                           // Set loading state for the new card only if image needs to be loaded
                          const newImageUrl = paragraphs[index]?.image;
                          if (newImageUrl && typeof newImageUrl === 'string' && !preloadedImages.has(newImageUrl)) {
                            setCardLoadingState(prev => ({ ...prev, [index]: true }));
                            
                            // Preload the new image
                            preloadImage(newImageUrl).then(() => {
                              setCardLoadingState(prev => ({ ...prev, [index]: false }));
                            }).catch((error) => {
                              console.warn('Failed to preload image:', newImageUrl, error);
                              setCardLoadingState(prev => ({ ...prev, [index]: false }));
                            });
                          } else {
                            // Image already loaded or no image, ensure loading state is false
                            setCardLoadingState(prev => ({ ...prev, [index]: false }));
                          }
                          
                          // Change card index with smooth transition
                          setTimeout(() => {
                            setCurrentCardIndex(index);
                            // Preload adjacent images for the new current card
                            preloadAdjacentImages(paragraphs, index);
                            
                            // End transition after animation completes
                            setTimeout(() => {
                              setIsCardTransitioning(false);
                            }, 500);
                          }, 50);
                          } catch (error) {
                            console.warn('Error in dot navigation:', error);
                            setIsCardTransitioning(false);
                            setCardLoadingState(prev => ({ ...prev, [index]: false }));
                          }
                        }
                      }}
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
              placeholder={getGlobalSearchPlaceholder(languages[currentLanguage].code, window.innerWidth <= 768)}
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
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 30%;
          margin: 0;
        }

        .title-search-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          width: 100%;
          position: relative;
        }

        .selected-title h2 {
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
          width: 30%;
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

        .search-results-info {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          padding: 10px 15px;
          margin: 0;
          border-radius: 8px;
          color: #28a745;
          font-size: 14px;
          font-weight: 500;
          text-align: right;
          border-left: none;
          width: 30%;
        }

        /* Mobile Specific Styles */
        @media (max-width: 768px) {
          .title-search-container {
            display: flex;
            padding: 0 10px;
            gap: 15px;
            min-height: 50px;
            align-items: flex-start;
            position: relative;
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
            text-align: left;
          }

          .section-search-container {
            width: 50%;
            margin: 0;
            padding-top: 8px;
            position: relative;
            flex-shrink: 0;
            transform: none;
            left: auto;
          }

          .search-results-info {
            margin: 8px 0;
            padding: 0 10px;
            font-size: 13px;
            width: 100%;
            clear: both;
            position: static;
            transform: none;
            text-align: left;
            background: #f8f9fa;
            border-left: 4px solid #28a745;
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

        /* Search Highlighting Styles */
        .content-card.search-highlighted {
          border: 3px solid #28a745;
          box-shadow: 0 0 15px rgba(40, 167, 69, 0.5);
          animation: searchHighlight 2s ease-in-out;
        }

        .search-highlighted-text {
          background: linear-gradient(120deg, rgba(40, 167, 69, 0.3) 0%, rgba(40, 167, 69, 0.1) 100%);
          padding: 5px;
          border-radius: 5px;
          border-left: 4px solid #28a745;
        }

        @keyframes searchHighlight {
          0% { 
            border-color: #28a745;
            box-shadow: 0 0 20px rgba(40, 167, 69, 0.8);
          }
          50% { 
            border-color: #34ce57;
            box-shadow: 0 0 25px rgba(40, 167, 69, 0.6);
          }
          100% { 
            border-color: #28a745;
            box-shadow: 0 0 15px rgba(40, 167, 69, 0.5);
          }
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

          /* Language specific margins for Hindi and Telugu */
          html[lang="hi"] .header h1,
          html[lang="te"] .header h1 {
            margin-top: 16px;
          }

          html[lang="hi"] .header-second-row,
          html[lang="te"] .header-second-row {
            margin-top: 18px;
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
          padding: 0px 0px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 999;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        }

        /* Card Loading and Transition Styles */
        .card-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: inherit;
        }

        .card-loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #fff;
          border-radius: 50%;
          animation: cardSpinnerRotate 1s linear infinite;
        }

        @keyframes cardSpinnerRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Card Transition Animation */
        .content-card.card-transitioning {
          animation: cardZoomIn 0.5s ease-out forwards;
        }

        @keyframes cardZoomIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Smooth card appearance */
        .content-card {
          transition: all 0.3s ease;
        }

        .content-card.card-loading {
          background-color: #f0f0f0;
          background-image: none !important;
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
