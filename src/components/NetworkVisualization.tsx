import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Network, ZoomIn, ZoomOut, Download, RotateCcw } from 'lucide-react';
import type { TargetGene } from '@/lib/dna-utils';

interface NetworkVisualizationProps {
  targetGenes: TargetGene[];
  sequenceType?: string;
}

export function NetworkVisualization({ targetGenes, sequenceType = 'DNA Sequence' }: NetworkVisualizationProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes = useMemo(() => {
    const centerX = 300;
    const centerY = 200;
    const radius = 130;
    
    const geneNodes = targetGenes.map((gene, index) => {
      const angle = (index * 2 * Math.PI) / targetGenes.length - Math.PI / 2;
      return {
        ...gene,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    return {
      center: { x: centerX, y: centerY },
      genes: geneNodes,
    };
  }, [targetGenes]);

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setSelectedNode(null);
  };

  if (targetGenes.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="section-header">
          <Network className="w-4 h-4" />
          Gene Regulatory Network
        </div>
        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Network className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No Network Data</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Analyze a sequence to visualize the gene regulatory network
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="section-header mb-0">
          <Network className="w-4 h-4" />
          Gene Regulatory Network
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl overflow-hidden border border-border/50" style={{ height: 400 }}>
        <svg
          viewBox="0 0 600 400"
          className="w-full h-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          <defs>
            <marker
              id="arrowhead-activation"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="hsl(155 70% 50%)" />
            </marker>
            <marker
              id="arrowhead-repression"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="hsl(0 70% 55%)" />
            </marker>
            <filter id="glow-network">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="center-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(221 83% 53%)" />
              <stop offset="100%" stopColor="hsl(270 76% 55%)" />
            </linearGradient>
          </defs>

          {/* Edges */}
          {nodes.genes.map((gene) => {
            const isActivation = gene.relationship === 'activation';
            const strokeColor = isActivation 
              ? 'hsl(155 70% 50%)' 
              : 'hsl(0 70% 55%)';
            
            return (
              <motion.line
                key={`edge-${gene.id}`}
                x1={nodes.center.x}
                y1={nodes.center.y}
                x2={gene.x}
                y2={gene.y}
                stroke={strokeColor}
                strokeWidth={gene.strength * 4 + 1}
                strokeOpacity={selectedNode === null || selectedNode === gene.id ? 0.7 : 0.2}
                markerEnd={`url(#arrowhead-${gene.relationship})`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            );
          })}

          {/* Center node - larger and more prominent */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <circle
                  cx={nodes.center.x}
                  cy={nodes.center.y}
                  r={35}
                  fill="url(#center-gradient)"
                  filter="url(#glow-network)"
                  className="cursor-pointer"
                />
                <text
                  x={nodes.center.x}
                  y={nodes.center.y - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="700"
                >
                  DNA
                </text>
                <text
                  x={nodes.center.x}
                  y={nodes.center.y + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="8"
                  opacity="0.9"
                >
                  SEQUENCE
                </text>
              </motion.g>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Analyzed {sequenceType}</p>
              <p className="text-xs text-muted-foreground">Central regulatory element</p>
            </TooltipContent>
          </Tooltip>

          {/* Gene nodes - larger green circles */}
          {nodes.genes.map((gene, index) => {
            const isActivation = gene.relationship === 'activation';
            const nodeColor = isActivation 
              ? 'hsl(155 70% 50%)' 
              : 'hsl(0 70% 55%)';
            
            return (
              <Tooltip key={gene.id}>
                <TooltipTrigger asChild>
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: selectedNode === gene.id ? 1.15 : 1, 
                      opacity: selectedNode === null || selectedNode === gene.id ? 1 : 0.5 
                    }}
                    transition={{ delay: index * 0.08 + 0.3 }}
                    onClick={() => setSelectedNode(selectedNode === gene.id ? null : gene.id)}
                    className="cursor-pointer network-node"
                  >
                    <circle
                      cx={gene.x}
                      cy={gene.y}
                      r={25}
                      fill={nodeColor}
                      opacity={0.95}
                    />
                    <text
                      x={gene.x}
                      y={gene.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {gene.name}
                    </text>
                  </motion.g>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{gene.name}</p>
                  <p className="text-xs text-muted-foreground">{gene.description}</p>
                  <p className="text-xs mt-1">
                    <span className={isActivation ? 'text-emerald-500' : 'text-red-500'}>
                      {isActivation ? '↑ Activation' : '↓ Repression'}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      Strength: {Math.round(gene.strength * 100)}%
                    </span>
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex gap-4 text-xs bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Activation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Repression</span>
          </div>
        </div>

        {/* Zoom indicator */}
        <div className="absolute top-3 right-3 text-xs bg-card/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-border/50 text-muted-foreground">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
}
