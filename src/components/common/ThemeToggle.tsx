import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { themeMode, setThemeMode, isDark } = useTheme();

  return (
    <div className={`inline-flex items-center p-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 ${className}`}>
      <button
        type="button"
        onClick={() => setThemeMode('light')}
        title="Modo Claro"
        className={`p-1.5 rounded-md transition-all ${
          themeMode === 'light'
            ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setThemeMode('dark')}
        title="Modo Escuro"
        className={`p-1.5 rounded-md transition-all ${
          themeMode === 'dark'
            ? 'bg-white dark:bg-slate-700 text-blue-400 shadow-xs font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setThemeMode('system')}
        title="Automático (Segue o Sistema Operacional)"
        className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-xs ${
          themeMode === 'system'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Laptop className="w-4 h-4" />
        <span className="hidden sm:inline text-[11px]">Auto</span>
      </button>
    </div>
  );
};
