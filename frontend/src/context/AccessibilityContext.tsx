import React, { createContext, useContext, useState, useEffect } from 'react';

type TextSize = 'normal' | 'large' | 'xl';

interface AccessibilityContextType {
  highContrast: boolean;
  textSize: TextSize;
  toggleHighContrast: () => void;
  setTextSize: (size: TextSize) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('arohan_high_contrast') === 'true';
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    return (localStorage.getItem('arohan_text_size') as TextSize) || 'normal';
  });

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('arohan_high_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    document.body.classList.remove('text-size-large', 'text-size-xl');
    if (textSize === 'large') {
      document.body.classList.add('text-size-large');
    } else if (textSize === 'xl') {
      document.body.classList.add('text-size-xl');
    }
    localStorage.setItem('arohan_text_size', textSize);
  }, [textSize]);

  const toggleHighContrast = () => setHighContrast(!highContrast);
  const setTextSize = (size: TextSize) => setTextSizeState(size);

  return (
    <AccessibilityContext.Provider value={{ highContrast, textSize, toggleHighContrast, setTextSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
