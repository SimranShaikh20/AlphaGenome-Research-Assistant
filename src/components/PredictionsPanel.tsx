import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  Beaker,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { FunctionPrediction } from '@/lib/dna-utils';

interface PredictionCardProps {
  prediction: FunctionPrediction;
  index: number;
}

function PredictionCard({ prediction, index }: PredictionCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'high';
    if (confidence >= 40) return 'medium';
    return 'low';
  };

  const confidenceLevel = getConfidenceColor(prediction.confidence);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="result-card overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-semibold">{prediction.name}</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{prediction.mechanism}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Badge variant="secondary" className="text-xs">
              {prediction.category}
            </Badge>
          </div>
          
          <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl ${
            confidenceLevel === 'high' 
              ? 'bg-confidence-high/10 text-confidence-high' 
              : confidenceLevel === 'medium'
              ? 'bg-confidence-medium/10 text-confidence-medium'
              : 'bg-confidence-low/10 text-confidence-low'
          }`}>
            <span className="text-2xl font-bold">{prediction.confidence}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">%</span>
          </div>
        </div>

        <div className="mb-3">
          <Progress 
            value={prediction.confidence} 
            className={`h-1.5 ${
              confidenceLevel === 'high'
                ? '[&>div]:bg-confidence-high'
                : confidenceLevel === 'medium'
                ? '[&>div]:bg-confidence-medium'
                : '[&>div]:bg-confidence-low'
            }`}
          />
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Evidence
            </h4>
            <ul className="space-y-1">
              {prediction.evidence.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground/80">
                  <ChevronRight className="w-3 h-3 mt-1 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {prediction.diseaseAssociations.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Disease Associations
              </h4>
              <div className="flex flex-wrap gap-1">
                {prediction.diseaseAssociations.map((disease, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-normal">
                    {disease}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
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
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            className="w-16 h-2 rounded-full loading-dna mb-4"
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
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Dna className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Submit a DNA sequence to see function predictions
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
        <Button variant="ghost" size="sm" className="text-xs">
          <ExternalLink className="w-3 h-3 mr-1" />
          Export
        </Button>
      </div>

      <div className="space-y-3">
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
