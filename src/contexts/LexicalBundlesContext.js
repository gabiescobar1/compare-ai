'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const LexicalBundlesContext = createContext({
  bundles: {},
  setBundles: () => {},
  uploadedAt: null,
});

export const useLexicalBundles = () => useContext(LexicalBundlesContext);

export const LexicalBundlesProvider = ({ children }) => {
  const [bundles, setBundles] = useState({});
  const [uploadedAt, setUploadedAt] = useState(null); // ISO da última importação

  // Load from local storage on mount
  useEffect(() => {
    // Hidratação a partir do localStorage no mount (seguro para SSR).
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const stored = localStorage.getItem('lexicalBundles');
      const ts = localStorage.getItem('lexicalBundlesUploadedAt');
      if (stored) setBundles(JSON.parse(stored));
      if (ts) setUploadedAt(ts);
    } catch (e) {
      console.error('Error loading lexical bundles from local storage:', e);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Salva bundles e registra a data do upload (limpa a data quando esvazia).
  const handleSetBundles = (newBundles) => {
    setBundles(newBundles);
    const hasBundles = newBundles && Object.keys(newBundles).length > 0;
    const ts = hasBundles ? new Date().toISOString() : null;
    setUploadedAt(ts);
    try {
      localStorage.setItem('lexicalBundles', JSON.stringify(newBundles));
      if (ts) localStorage.setItem('lexicalBundlesUploadedAt', ts);
      else localStorage.removeItem('lexicalBundlesUploadedAt');
    } catch (e) {
      console.error('Error saving lexical bundles to local storage:', e);
    }
  };

  return (
    <LexicalBundlesContext.Provider value={{ bundles, setBundles: handleSetBundles, uploadedAt }}>
      {children}
    </LexicalBundlesContext.Provider>
  );
};
