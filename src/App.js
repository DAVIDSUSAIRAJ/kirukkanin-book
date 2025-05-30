import React, { useState } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState('tamil');
  const [selectedSection, setSelectedSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const content = {
    tamil: {
      title: 'கிருக்கனின் பயந்த தத்துவங்கள்',
      sections: [
        {
          id: '1',
          title: 'அடிப்படை',
          subsections: [
            { id: '1.1', title: 'இலக்கணை', content: 'இலக்கணை பற்றிய விளக்கம்...' },
            { id: '1.2', title: 'தாத்துவை', content: 'தாத்துவை பற்றிய விளக்கம்...' },
            { id: '1.3', title: 'இது', content: 'இது பற்றிய விளக்கம்...' }
          ]
        },
        {
          id: '2',
          title: 'வழிவகை',
          subsections: [
            { id: '2.1', title: 'நன்கு சொல்வோம்', content: 'நன்கு சொல்வோம் பற்றிய விளக்கம்...' },
            { id: '2.2', title: 'எதார்த்தம்', content: 'எதார்த்தம் பற்றிய விளக்கம்...' }
          ]
        }
      ]
    },
    english: {
      title: 'Kirukkanin Fearful Philosophies',
      sections: [
        {
          id: '1',
          title: 'Basics',
          subsections: [
            { id: '1.1', title: 'Definition', content: 'Explanation about definition...' },
            { id: '1.2', title: 'Philosophy', content: 'Explanation about philosophy...' },
            { id: '1.3', title: 'This', content: 'Explanation about this...' }
          ]
        },
        {
          id: '2',
          title: 'Methods',
          subsections: [
            { id: '2.1', title: 'Well Said', content: 'Explanation about well said...' },
            { id: '2.2', title: 'Reality', content: 'Explanation about reality...' }
          ]
        }
      ]
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const currentContent = content[language];

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
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
        <aside className="sidebar">
          <nav className="section-nav">
            {currentContent.sections.map(section => (
              <div key={section.id} className="nav-section">
                <div 
                  className="nav-section-header" 
                  onClick={() => toggleSection(section.id)}
                >
                  <span>{section.title}</span>
                  <span className={`arrow ${expandedSections[section.id] ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {expandedSections[section.id] && (
                  <div className="nav-subsections">
                    {section.subsections.map(subsection => (
                      <div 
                        key={subsection.id} 
                        className={`nav-subsection ${selectedSection === subsection.id ? 'active' : ''}`}
                        onClick={() => setSelectedSection(subsection.id)}
                      >
                        {subsection.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="content">
          {selectedSection && currentContent.sections.map(section =>
            section.subsections.find(sub => sub.id === selectedSection) && (
              <div key={selectedSection} className="selected-content">
                <h2>{section.subsections.find(sub => sub.id === selectedSection).title}</h2>
                <p>{section.subsections.find(sub => sub.id === selectedSection).content}</p>
              </div>
            )
          )}
          {!selectedSection && (
            <div className="welcome-message">
              <h2>{language === 'tamil' ? 'வரவேற்பு' : 'Welcome'}</h2>
              <p>{language === 'tamil' ? 'தயவுசெய்து ஒரு பிரிவைத் தேர்ந்தெடுக்கவும்' : 'Please select a section'}</p>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 {currentContent.title}</p>
      </footer>
    </div>
  );
}

export default App;
