import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Lightbulb, Beaker, Clock, Package, Copy, Check, Plus, FlaskConical } from 'lucide-react';
import { useState } from 'react';
import type { Hypothesis } from '@/lib/dna-utils';

interface HypothesisGeneratorProps {
  hypotheses: Hypothesis[];
  isLoading: boolean;
}

const cardColors = [
  'hypothesis-card-1',
  'hypothesis-card-2',
  'hypothesis-card-3',
  'hypothesis-card-4',
];

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
      <div className="space-y-4">
        <div className="section-header gradient-underline pb-2">
          <Lightbulb className="w-4 h-4" />
          💡 Testable Hypotheses
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <FlaskConical className="w-10 h-10 text-primary" />
          </motion.div>
          <p className="text-sm text-muted-foreground mt-3">Generating hypotheses...</p>
        </div>
      </div>
    );
  }

  if (hypotheses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="section-header gradient-underline pb-2">
          <Lightbulb className="w-4 h-4" />
          💡 Testable Hypotheses
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Lightbulb className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            Hypotheses will appear after analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="section-header gradient-underline pb-2">
        <Lightbulb className="w-4 h-4" />
        💡 Testable Hypotheses
      </div>

      <div className="space-y-3">
        {hypotheses.map((hypothesis, index) => (
          <motion.div
            key={hypothesis.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`hypothesis-card ${cardColors[index % cardColors.length]} rounded-xl`}
          >
            <div className="flex items-start gap-3">
              {/* Numbered badge */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 text-white font-bold text-sm">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground leading-relaxed">
                  {hypothesis.statement}
                </p>

                <Accordion type="single" collapsible className="mt-3">
                  <AccordionItem value="details" className="border-none">
                    <AccordionTrigger className="py-2 text-xs text-muted-foreground hover:no-underline">
                      View Details
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 space-y-3">
                      {/* Experimental Approach */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Beaker className="w-3 h-3" />
                          Experimental Approach
                        </h4>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {hypothesis.experimentType.split(' ').map((word, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {word}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-foreground/80">{hypothesis.approach}</p>
                      </div>

                      {/* Expected Outcomes */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Expected Outcomes
                        </h4>
                        <p className="text-xs text-foreground/80">{hypothesis.expectedOutcome}</p>
                      </div>

                      {/* Resources & Timeline */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-background/50 rounded-lg p-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Package className="w-3 h-3" />
                            Resources
                          </div>
                          <p className="text-xs text-foreground/80">{hypothesis.resources}</p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            Timeline
                          </div>
                          <p className="text-xs text-foreground/80">{hypothesis.timeline}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(hypothesis)}
                          className="flex-1 text-xs"
                        >
                          {copiedId === hypothesis.id ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add to Experiments
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
