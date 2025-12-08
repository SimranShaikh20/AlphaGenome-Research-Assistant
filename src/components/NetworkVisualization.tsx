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
    const centerX = 200;
    const centerY = 150;
    const radius = 100;
    
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
      <div className="glass-panel p-4">
        <div className="section-header">
          <Network className="w-4 h-4" />
          Gene Regulatory Network
        </div>
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <Network className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Analyze a sequence to visualize the gene regulatory network
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="section-header mb-0">
          <Network className="w-4 h-4" />
          Gene Regulatory Network
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
            <ZoomOut className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
            <ZoomIn className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="relative bg-muted/30 rounded-xl overflow-hidden" style={{ height: 300 }}>
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          <defs>
            <marker
              id="arrowhead-activation"
              markerWidth="6"
              markerHeight="4"
              refX="5"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 6 2, 0 4" fill="hsl(var(--network-activation))" />
            </marker>
            <marker
              id="arrowhead-repression"
              markerWidth="6"
              markerHeight="4"
              refX="5"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 6 2, 0 4" fill="hsl(var(--network-repression))" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {nodes.genes.map((gene) => {
            const isActivation = gene.relationship === 'activation';
            const strokeColor = isActivation 
              ? 'hsl(var(--network-activation))' 
              : 'hsl(var(--network-repression))';
            
            return (
              <motion.line
                key={`edge-${gene.id}`}
                x1={nodes.center.x}
                y1={nodes.center.y}
                x2={gene.x}
                y2={gene.y}
                stroke={strokeColor}
                strokeWidth={gene.strength * 3 + 1}
                strokeOpacity={selectedNode === null || selectedNode === gene.id ? 0.6 : 0.2}
                markerEnd={`url(#arrowhead-${gene.relationship})`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            );
          })}

          {/* Center node */}
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
                  r={28}
                  fill="hsl(var(--primary))"
                  filter="url(#glow)"
                  className="cursor-pointer"
                />
                <text
                  x={nodes.center.x}
                  y={nodes.center.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="hsl(var(--primary-foreground))"
                  fontSize="8"
                  fontWeight="600"
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

          {/* Gene nodes */}
          {nodes.genes.map((gene, index) => {
            const isActivation = gene.relationship === 'activation';
            const nodeColor = isActivation 
              ? 'hsl(var(--network-activation))' 
              : 'hsl(var(--network-repression))';
            
            return (
              <Tooltip key={gene.id}>
                <TooltipTrigger asChild>
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: selectedNode === gene.id ? 1.2 : 1, 
                      opacity: selectedNode === null || selectedNode === gene.id ? 1 : 0.5 
                    }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    onClick={() => setSelectedNode(selectedNode === gene.id ? null : gene.id)}
                    className="cursor-pointer network-node"
                  >
                    <circle
                      cx={gene.x}
                      cy={gene.y}
                      r={20}
                      fill={nodeColor}
                      opacity={0.9}
                    />
                    <text
                      x={gene.x}
                      y={gene.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="9"
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
                    <span className={isActivation ? 'text-network-activation' : 'text-network-repression'}>
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
        <div className="absolute bottom-2 left-2 flex gap-4 text-xs bg-background/80 backdrop-blur-sm rounded-md px-2 py-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-network-activation" />
            <span className="text-muted-foreground">Activation</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-network-repression" />
            <span className="text-muted-foreground">Repression</span>
          </div>
        </div>
      </div>
    </div>
  );
}
