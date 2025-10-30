import React, { useState } from 'react';
import { useKeyboardShortcuts, APP_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Keyboard, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsProps {
  onNewJob?: () => void;
  onSearch?: () => void;
  onNavigate?: (path: string) => void;
}

export function KeyboardShortcuts({ onNewJob, onSearch, onNavigate }: KeyboardShortcutsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const shortcuts = [
    {
      ...APP_SHORTCUTS.NEW_JOB,
      action: () => onNewJob?.(),
    },
    {
      ...APP_SHORTCUTS.SEARCH,
      action: () => onSearch?.(),
    },
    {
      ...APP_SHORTCUTS.CANDIDATES,
      action: () => onNavigate?.('/candidates'),
    },
    {
      ...APP_SHORTCUTS.JOBS,
      action: () => onNavigate?.('/jobs'),
    },
    {
      ...APP_SHORTCUTS.ESCAPE,
      action: () => setShowShortcuts(false),
    },
  ];

  useKeyboardShortcuts(shortcuts);

  const formatKey = (shortcut: any) => {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    parts.push(shortcut.key);
    return parts.join(' + ');
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-4 right-4 z-50"
        title="Keyboard Shortcuts (Ctrl + ?)"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Keyboard className="h-5 w-5 mr-2" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-mono">
                    {formatKey(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Pro tip:</strong> Press <kbd className="px-1 py-0.5 bg-blue-200 rounded text-xs">Ctrl + ?</kbd> anytime to see this help!
              </p>
            </div>
          </CardContent>
        </DialogContent>
      </Dialog>
    </>
  );
}
