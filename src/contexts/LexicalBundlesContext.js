'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const LexicalBundlesContext = createContext({
  bundles: {},
  setBundles: () => {},
});

export const useLexicalBundles = () => useContext(LexicalBundlesContext);

export const LexicalBundlesProvider = ({ children }) => {
  const [bundles, setBundles] = useState({});

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lexicalBundles');
      if (stored) {
        setBundles(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading lexical bundles from local storage:', e);
    }
  }, []);

  // Save to local storage on change
  const handleSetBundles = (newBundles) => {
    setBundles(newBundles);
    try {
      localStorage.setItem('lexicalBundles', JSON.stringify(newBundles));
    } catch (e) {
      console.error('Error saving lexical bundles to local storage:', e);
    }
  };

  return (
    <LexicalBundlesContext.Provider value={{ bundles, setBundles: handleSetBundles }}>
      {children}
    </LexicalBundlesContext.Provider>
  );
};
