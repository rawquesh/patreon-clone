'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from 'react';

type DialogType = 'member' | 'subscription' | 'payout' | 'creator' | 'post';

interface DialogState {
  type: DialogType;
  id: string | null;
}

interface DialogContextValue {
  openDialog: (type: DialogType, id: string) => void;
  closeDialog: () => void;
  activeDialog: DialogState | null;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<DialogState | null>(null);

  // Close on Escape key or route change
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeDialog) {
        setActiveDialog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDialog]);

  const openDialog = useCallback((type: DialogType, id: string) => {
    setActiveDialog({ type, id });
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog, activeDialog }}>
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return ctx;
}
