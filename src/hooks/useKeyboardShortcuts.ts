import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => 
        s.key === event.key &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.shiftKey === event.shiftKey &&
        !!s.altKey === event.altKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Common shortcuts for the app
export const APP_SHORTCUTS = {
  NEW_JOB: { key: 'n', ctrlKey: true, description: 'Create new job' },
  SEARCH: { key: 'k', ctrlKey: true, description: 'Focus search' },
  CANDIDATES: { key: 'c', ctrlKey: true, description: 'Go to candidates' },
  JOBS: { key: 'j', ctrlKey: true, description: 'Go to jobs' },
  ESCAPE: { key: 'Escape', description: 'Close modals' },
};
