import { DNAHelix } from './DNAHelix';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Moon, Sun, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <DNAHelix size={36} />
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="dna-gradient-text">AlphaGenome</span>
              <span className="text-foreground"> Research Assistant</span>
            </h1>
            <p className="text-xs text-muted-foreground">Non-coding DNA Analysis Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:flex gap-1 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            AI Ready
          </Badge>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
