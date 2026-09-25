import React, { createContext, useState, useContext } from 'react';

const translations = {
  en: {
    // Navbar
    'nav.smart': 'Smart',
    'nav.deliver': 'Deliver',
    'nav.search': 'Search restaurants & groceries...',
    'nav.cart': 'Cart',
    'nav.login': 'Sign In',
    'nav.dashboard': 'Dashboard',
    
    // Hero
    'hero.title': 'Fast Delivery to Your Doorstep',
    'hero.subtitle': 'Order from the best restaurants and stores in Addis Ababa',
    
    // Misc
    'btn.order': 'Order Now',
    'btn.track': 'Track Order',
  },
  am: {
    // Navbar
    'nav.smart': 'ስማርት',
    'nav.deliver': 'አድርስ',
    'nav.search': 'ምግብ ቤቶችን እና ሸቀጦችን ይፈልጉ...',
    'nav.cart': 'ቅርጫት',
    'nav.login': 'ግባ',
    'nav.dashboard': 'ዳሽቦርድ',
    
    // Hero
    'hero.title': 'ፈጣን ማድረስ ወደ በርዎ',
    'hero.subtitle': 'በአዲስ አበባ ካሉ ምርጥ ምግብ ቤቶች እና ሱቆች ይዘዙ',
    
    // Misc
    'btn.order': 'አሁን ይዘዙ',
    'btn.track': 'ትዕዛዝ ይከታተሉ',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'am' : 'en');
  };

  const t = (key) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
