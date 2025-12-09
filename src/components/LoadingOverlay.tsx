import { motion, AnimatePresence } from 'framer-motion';
import { Dna } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  progress?: number;
}

function RotatingDNAHelix() {
  return (
    <motion.div
      className="relative"
      animate={{ rotateY: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
    >
      <svg width="120" height="120" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="helix-loading-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(221 83% 53%)" />
            <stop offset="100%" stopColor="hsl(270 76% 55%)" />
          </linearGradient>
          <linearGradient id="helix-loading-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(270 76% 55%)" />
            <stop offset="100%" stopColor="hsl(221 83% 53%)" />
          </linearGradient>
          <filter id="glow-loading">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <path
          d="M25 5 Q50 20, 25 35 Q0 50, 25 65 Q50 80, 25 95"
          fill="none"
          stroke="url(#helix-loading-1)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#glow-loading)"
        />
        <path
          d="M75 5 Q50 20, 75 35 Q100 50, 75 65 Q50 80, 75 95"
          fill="none"
          stroke="url(#helix-loading-2)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#glow-loading)"
        />
        
        {[12, 28, 42, 58, 72, 88].map((y, i) => (
          <motion.line
            key={i}
            x1={i % 2 === 0 ? 28 : 20}
            y1={y}
            x2={i % 2 === 0 ? 72 : 80}
            y2={y}
            stroke={`hsl(${[350, 200, 120, 45, 350, 200][i]} 80% 60%)`}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

function FloatingParticle({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-primary/30"
      style={{ left: `${x}%` }}
      initial={{ y: 200, opacity: 0 }}
      animate={{
        y: -200,
        opacity: [0, 1, 1, 0],
        x: [0, 20, -20, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}

export function LoadingOverlay({ isVisible, progress = 0 }: LoadingOverlayProps) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.3,
    x: 30 + Math.random() * 40,
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-background/80" />

          {/* Content */}
          <div className="relative flex flex-col items-center">
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              {particles.map((p) => (
                <FloatingParticle key={p.id} delay={p.delay} x={p.x} />
              ))}
            </div>

            {/* Rotating DNA helix */}
            <RotatingDNAHelix />

            {/* Text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg font-medium text-foreground mt-6 mb-4"
            >
              Analyzing sequence patterns...
            </motion.p>

            {/* Progress bar */}
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(221 83% 53%), hsl(270 76% 55%))',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Percentage */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground mt-2"
            >
              {Math.round(progress)}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
