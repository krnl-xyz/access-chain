import React, { createContext, useContext, useState, useEffect } from 'react';

// Initial default state
const defaultSettings = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  screenReader: false,
  disabilityType: null,
  disabilityVerified: false,
  assistiveTechnologies: [],
};

// Create the context
const AccessibilityContext = createContext(defaultSettings);

// Local storage key for persisting settings
const STORAGE_KEY = 'accesschain_accessibility_settings';

// Provider component that wraps the app
export const AccessibilityProvider = ({ children }) => {
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Toggle a boolean setting
  const toggleSetting = (setting) => {
    if (typeof settings[setting] === 'boolean') {
      setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
    }
  };

  // Update a specific setting
  const updateSetting = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  // Reset all settings to default
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Register a disability type
  const registerDisability = (type, verified = false) => {
    setSettings(prev => ({
      ...prev,
      disabilityType: type,
      disabilityVerified: verified
    }));
  };

  // Update assistive technologies list
  const updateAssistiveTechnologies = (technologies) => {
    setSettings(prev => ({
      ...prev,
      assistiveTechnologies: technologies
    }));
  };

  // Mark disability as verified
  const verifyDisability = () => {
    setSettings(prev => ({
      ...prev,
      disabilityVerified: true
    }));
  };

  // Context value to be provided
  const value = {
    ...settings,
    toggleSetting,
    updateSetting,
    resetSettings,
    registerDisability,
    updateAssistiveTechnologies,
    verifyDisability,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Custom hook for using accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext;