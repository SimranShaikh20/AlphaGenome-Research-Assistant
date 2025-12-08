import { motion } from 'framer-motion';

interface DNAHelixProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function DNAHelix({ size = 40, className = '', animate = true }: DNAHelixProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      animate={animate ? { rotateY: 360 } : undefined}
      transition={animate ? { duration: 4, repeat: Infinity, ease: 'linear' } : undefined}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <defs>
        <linearGradient id="helix-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(200 85% 45%)" />
          <stop offset="100%" stopColor="hsl(175 70% 45%)" />
        </linearGradient>
        <linearGradient id="helix-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(350 80% 60%)" />
          <stop offset="100%" stopColor="hsl(45 85% 55%)" />
        </linearGradient>
      </defs>
      
      {/* DNA backbone strands */}
      <path
        d="M30 10 Q50 25, 30 40 Q10 55, 30 70 Q50 85, 30 100"
        fill="none"
        stroke="url(#helix-gradient-1)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M70 10 Q50 25, 70 40 Q90 55, 70 70 Q50 85, 70 100"
        fill="none"
        stroke="url(#helix-gradient-2)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Base pairs */}
      <line x1="35" y1="18" x2="65" y2="18" stroke="hsl(var(--dna-a))" strokeWidth="3" strokeLinecap="round" />
      <line x1="25" y1="32" x2="75" y2="32" stroke="hsl(var(--dna-t))" strokeWidth="3" strokeLinecap="round" />
      <line x1="32" y1="48" x2="68" y2="48" stroke="hsl(var(--dna-g))" strokeWidth="3" strokeLinecap="round" />
      <line x1="25" y1="62" x2="75" y2="62" stroke="hsl(var(--dna-c))" strokeWidth="3" strokeLinecap="round" />
      <line x1="35" y1="78" x2="65" y2="78" stroke="hsl(var(--dna-a))" strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="92" x2="72" y2="92" stroke="hsl(var(--dna-t))" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  );
}

export function DNAHelixLarge() {
  return (
    <div className="relative w-24 h-24">
      <motion.div
        className="absolute inset-0"
        animate={{ rotateY: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="helix-lg-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(200 85% 50%)" />
              <stop offset="100%" stopColor="hsl(175 70% 50%)" />
            </linearGradient>
          </defs>
          
          <path
            d="M25 5 Q50 20, 25 35 Q0 50, 25 65 Q50 80, 25 95"
            fill="none"
            stroke="url(#helix-lg-1)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M75 5 Q50 20, 75 35 Q100 50, 75 65 Q50 80, 75 95"
            fill="none"
            stroke="url(#helix-lg-1)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.7"
          />
          
          {[15, 28, 42, 55, 68, 82].map((y, i) => (
            <motion.line
              key={i}
              x1={i % 2 === 0 ? 30 : 22}
              y1={y}
              x2={i % 2 === 0 ? 70 : 78}
              y2={y}
              stroke={`hsl(${[350, 200, 120, 45][i % 4]} 80% 55%)`}
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
