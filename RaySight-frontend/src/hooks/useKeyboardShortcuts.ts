import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  onTogglePalette?: () => void;
  onToggleLibrary?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if (isTyping || !(event.ctrlKey || event.metaKey) || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'z' && !event.shiftKey && handlers.onUndo) {
        event.preventDefault();
        handlers.onUndo();
        return;
      }

      if ((key === 'y' || (key === 'z' && event.shiftKey)) && handlers.onRedo) {
        event.preventDefault();
        handlers.onRedo();
        return;
      }

      if (event.shiftKey) return;

      if (key === 'b' && handlers.onTogglePalette) {
        event.preventDefault();
        handlers.onTogglePalette();
      }

      if (key === 'j' && handlers.onToggleLibrary) {
        event.preventDefault();
        handlers.onToggleLibrary();
      }

      if (key === 's' && handlers.onSave) {
        event.preventDefault();
        handlers.onSave();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, handlers]);
}
