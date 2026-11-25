import { createContext, useContext, useState } from 'react';
import es from './es';
import en from './en';

const TRANSLATIONS = { es, en };

const LanguageContext = createContext({
  lang: 'es',
  t: (k) => k,
  toggleLang: () => {},
  applyLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('dl_lang') || 'es');

  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.es?.[key] ?? key;

  const toggleLang = () => {
    const next = lang === 'es' ? 'en' : 'es';
    setLang(next);
    localStorage.setItem('dl_lang', next);
  };

  // Called on login/session-restore to apply user's preferred language
  const applyLang = (preferred) => {
    const l = preferred === 'en' ? 'en' : 'es';
    setLang(l);
    localStorage.setItem('dl_lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, applyLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useT = () => useContext(LanguageContext);
