import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Sparkles, Settings } from 'lucide-react';
import { useState } from 'react';
import { ApiKeyModal } from './ApiKeyModal';

function AnimatedDNAHelix() {
  return (
    <motion.div
      className="relative"
      animate={{ rotateY: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <svg width="56" height="56" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="helix-header-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
          </linearGradient>
          <linearGradient id="helix-header-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>
        </defs>
        
        <path
          d="M30 10 Q50 25, 30 40 Q10 55, 30 70 Q50 85, 30 100"
          fill="none"
          stroke="url(#helix-header-1)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M70 10 Q50 25, 70 40 Q90 55, 70 70 Q50 85, 70 100"
          fill="none"
          stroke="url(#helix-header-2)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        
        <line x1="35" y1="18" x2="65" y2="18" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round" />
        <line x1="25" y1="32" x2="75" y2="32" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
        <line x1="32" y1="48" x2="68" y2="48" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round" />
        <line x1="25" y1="62" x2="75" y2="62" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
        <line x1="35" y1="78" x2="65" y2="78" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round" />
        <line x1="28" y1="92" x2="72" y2="92" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

function Particle({ delay, left }: { delay: number; left: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-white/30 rounded-full"
      style={{ left: `${left}%` }}
      initial={{ y: '100%', opacity: 0 }}
      animate={{
        y: '-100%',
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: 'linear',
      }}
    />
  );
}

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 8,
    left: Math.random() * 100,
  }));

  return (
    <>
      <ApiKeyModal open={showApiKeyModal} onOpenChange={setShowApiKeyModal} />
    <header className="relative w-full header-gradient overflow-hidden" style={{ height: '100px' }}>
      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <Particle key={particle.id} delay={particle.delay} left={particle.left} />
        ))}
      </div>

      <div className="container h-full flex items-center justify-between px-6 relative z-10">
        {/* Left spacer for balance */}
        <div className="w-48" />

        {/* Center content */}
        <div className="flex flex-col items-center">
          <AnimatedDNAHelix />
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-bold text-center mt-1"
            style={{ fontSize: '28px' }}
          >
            AlphaGenome Research Assistant
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.2 }}
            className="text-white/90 text-center"
            style={{ fontSize: '14px' }}
          >
            Non-coding DNA Analysis Platform
          </motion.p>
        </div>

        {/* Right side with badge and controls */}
        <div className="flex items-center gap-3 w-48 justify-end">
          <Badge 
            className="bg-white/20 text-white border-white/30 backdrop-blur-sm flex items-center gap-1.5 px-3 py-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Powered by Gemini</span>
          </Badge>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowApiKeyModal(true)}
            className="text-white/80 hover:text-white hover:bg-white/10"
            title="API Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
    </>
  );
}
