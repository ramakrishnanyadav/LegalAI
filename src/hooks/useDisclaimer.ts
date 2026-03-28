import { useState, useEffect } from 'react';

const DISCLAIMER_KEY = 'lumina_disclaimer_v1';

export const useDisclaimer = () => {
  const [hasAccepted, setHasAccepted] = useState<boolean>(true); // Default true, verify in effect
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISCLAIMER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.accepted) {
          setHasAccepted(true);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to parse disclaimer consent:', err);
    }
    
    // If not accepted, set to false and show modal
    setHasAccepted(false);
    setShowModal(true);
  }, []);

  const acceptDisclaimer = () => {
    const payload = {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(DISCLAIMER_KEY, JSON.stringify(payload));
    setHasAccepted(true);
    setShowModal(false);
  };

  const resetDisclaimer = () => {
    localStorage.removeItem(DISCLAIMER_KEY);
    setHasAccepted(false);
    setShowModal(true);
  };

  return {
    hasAccepted,
    showModal,
    acceptDisclaimer,
    resetDisclaimer
  };
};
