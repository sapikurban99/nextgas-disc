'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 flex items-center justify-center rounded-lg theme-btn-secondary transition-all hover:scale-105"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
      ) : (
        <Moon className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
      )}
    </button>
  );
}
