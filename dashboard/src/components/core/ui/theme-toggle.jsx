import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (!mounted) {
    return <div className="h-8 w-14 rounded-full bg-muted border border-border opacity-50" />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full p-0.5 border border-neutral-700/60 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isDark ? 'bg-primary' : 'bg-muted'
      }`}
      aria-label="Toggle dark/light theme"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-transform duration-300 ${
          isDark
            ? 'translate-x-6 bg-neutral-900 text-primary-foreground'
            : 'translate-x-0 bg-background text-foreground'
        }`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 stroke-[2]" />
        ) : (
          <Sun className="h-4 w-4 stroke-[2]" />
        )}
      </span>
    </button>
  );
};
