export const languages = {
  tamil: {
    code: 'ta',
    name: 'தமிழ்',
    direction: 'ltr',
    fontFamily: "'Mukta Malar', sans-serif"
  },
  english: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    fontFamily: "'Roboto', sans-serif"
  },
  hindi: {
    code: 'hi',
    name: 'हिंदी',
    direction: 'ltr',
    fontFamily: "'Hind', sans-serif"
  },
  telugu: {
    code: 'te',
    name: 'తెలుగు',
    direction: 'ltr',
    fontFamily: "'Noto Sans Telugu', sans-serif"
  },
  malayalam: {
    code: 'ml',
    name: 'മലയാളം',
    direction: 'ltr',
    fontFamily: "'Noto Sans Malayalam', sans-serif"
  }
};

export const defaultLanguage = 'tamil';

export const getLanguageFont = (languageCode) => {
  const language = Object.values(languages).find(lang => lang.code === languageCode);
  return language ? language.fontFamily : languages[defaultLanguage].fontFamily;
};

export const getLanguageName = (languageCode) => {
  const language = Object.values(languages).find(lang => lang.code === languageCode);
  return language ? language.name : languages[defaultLanguage].name;
}; 