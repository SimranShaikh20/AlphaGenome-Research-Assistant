import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dna,
  Activity,
  Info,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Download,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import type { FunctionPrediction } from '@/lib/dna-utils';

interface PredictionCardProps {
  prediction: FunctionPrediction;
  index: number;
}

function PredictionCard({ prediction, index }: PredictionCardProps) {
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    if (confidence >= 40) return 'low';
    return 'very-low';
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-emerald-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getCardBorderClass = (level: string) => {
    switch (level) {
      case 'high': return 'prediction-card-high';
      case 'medium': return 'prediction-card-medium';
      case 'low': return 'prediction-card-low';
      default: return 'prediction-card-very-low';
    }
  };

  const confidenceLevel = getConfidenceLevel(prediction.confidence);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`prediction-card ${getCardBorderClass(confidenceLevel)}`}
    >
      {/* Header with confidence badge */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-2">{prediction.name}</h3>
          <Badge 
            variant="secondary" 
            className="text-xs font-medium"
          >
            {prediction.category}
          </Badge>
        </div>
        
        {/* Circular confidence badge */}
        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full ${getConfidenceColor(confidenceLevel)} text-white shadow-lg`}>
          <span className="text-xl font-bold">{prediction.confidence}</span>
          <span className="text-[9px] uppercase tracking-wider opacity-90">%</span>
        </div>
      </div>

      {/* Mechanism description */}
      <p className="text-sm text-foreground/80 leading-relaxed mb-4">
        {prediction.mechanism}
      </p>

      {/* Evidence section */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Supporting Evidence
        </h4>
        <ul className="space-y-1.5">
          {(Array.isArray(prediction.evidence) ? prediction.evidence : [prediction.evidence]).map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disease associations */}
      {prediction.diseaseAssociations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Disease Associations
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {prediction.diseaseAssociations.map((disease, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal">
                {disease}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface PredictionsPanelProps {
  predictions: FunctionPrediction[];
  isLoading: boolean;
}

export function PredictionsPanel({ predictions, isLoading }: PredictionsPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="section-header">
          <Activity className="w-4 h-4" />
          Function Predictions
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div
            className="w-20 h-2 rounded-full loading-dna mb-4"
            animate={{ scaleX: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <p className="text-sm text-muted-foreground">Analyzing sequence patterns...</p>
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="section-header">
          <Activity className="w-4 h-4" />
          Function Predictions
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Dna className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No Analysis Yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Submit a DNA sequence to see function predictions with confidence scores
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="section-header mb-0">
          <Activity className="w-4 h-4" />
          Function Predictions
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="text-xs">
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Grid layout - 2 cards per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((prediction, index) => (
          <PredictionCard
            key={prediction.id}
            prediction={prediction}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
