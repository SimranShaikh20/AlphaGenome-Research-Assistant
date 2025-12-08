import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Lightbulb, Beaker, Clock, Package, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Hypothesis } from '@/lib/dna-utils';

interface HypothesisGeneratorProps {
  hypotheses: Hypothesis[];
  isLoading: boolean;
}

export function HypothesisGenerator({ hypotheses, isLoading }: HypothesisGeneratorProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (hypothesis: Hypothesis) => {
    const text = `Hypothesis: ${hypothesis.statement}

Experiment Type: ${hypothesis.experimentType}
Approach: ${hypothesis.approach}
Expected Outcome: ${hypothesis.expectedOutcome}
Resources: ${hypothesis.resources}
Timeline: ${hypothesis.timeline}`;

    navigator.clipboard.writeText(text);
    setCopiedId(hypothesis.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-4">
        <div className="section-header">
          <Lightbulb className="w-4 h-4" />
          Hypothesis Generator
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Beaker className="w-8 h-8 text-primary" />
          </motion.div>
          <p className="text-sm text-muted-foreground mt-3">Generating testable hypotheses...</p>
        </div>
      </div>
    );
  }

  if (hypotheses.length === 0) {
    return (
      <div className="glass-panel p-4">
        <div className="section-header">
          <Lightbulb className="w-4 h-4" />
          Hypothesis Generator
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Lightbulb className="w-10 h-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Testable hypotheses will appear here after analysis
          </p>
        </div>
      </div>
    );
  }

  const experimentTypeColors: Record<string, string> = {
    'Reporter Assay': 'bg-info/10 text-info border-info/20',
    'ChIP-seq Analysis': 'bg-primary/10 text-primary border-primary/20',
    'CRISPR Knockout': 'bg-destructive/10 text-destructive border-destructive/20',
    'ATAC-seq Profiling': 'bg-accent/10 text-accent border-accent/20',
  };

  return (
    <div className="glass-panel p-4">
      <div className="section-header">
        <Lightbulb className="w-4 h-4" />
        Hypothesis Generator
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {hypotheses.map((hypothesis, index) => (
          <motion.div
            key={hypothesis.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AccordionItem
              value={hypothesis.id}
              className="border border-border rounded-lg overflow-hidden bg-card"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex items-start gap-3 text-left">
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-xs ${experimentTypeColors[hypothesis.experimentType] || 'bg-muted'}`}
                  >
                    <Beaker className="w-3 h-3 mr-1" />
                    {hypothesis.experimentType}
                  </Badge>
                  <span className="text-sm font-medium line-clamp-2">
                    {hypothesis.statement}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3 pt-2">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Experimental Approach
                    </h4>
                    <p className="text-sm text-foreground/90">{hypothesis.approach}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Expected Outcome
                    </h4>
                    <p className="text-sm text-foreground/90">{hypothesis.expectedOutcome}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-md p-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Package className="w-3 h-3" />
                        Resources
                      </div>
                      <p className="text-xs">{hypothesis.resources}</p>
                    </div>
                    <div className="bg-muted/50 rounded-md p-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        Timeline
                      </div>
                      <p className="text-xs">{hypothesis.timeline}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(hypothesis)}
                    className="w-full mt-2"
                  >
                    {copiedId === hypothesis.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  );
}
