import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { SequenceInput } from '@/components/SequenceInput';
import { PredictionsPanel } from '@/components/PredictionsPanel';
import { NetworkVisualization, NetworkVisualizationRef } from '@/components/NetworkVisualization';
import { HypothesisGenerator } from '@/components/HypothesisGenerator';
import { VoiceInteraction } from '@/components/VoiceInteraction';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ExportButton } from '@/components/ExportButton';
import { supabase } from '@/integrations/supabase/client';
import {
  generateMockPredictions,
  generateMockTargetGenes,
  generateMockHypotheses,
  type FunctionPrediction,
  type TargetGene,
  type Hypothesis,
} from '@/lib/dna-utils';

export default function Index() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [predictions, setPredictions] = useState<FunctionPrediction[]>([]);
  const [targetGenes, setTargetGenes] = useState<TargetGene[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const networkRef = useRef<NetworkVisualizationRef>(null);
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 300);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isAnalyzing]);

  const handleAnalyze = useCallback(async (sequence: string) => {
    if (!sequence.trim()) {
      toast.error('No Sequence', {
        description: 'Please enter a DNA sequence first.',
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(10);

    try {
      setProgress(30);
      
      // Call edge function
      const { data, error } = await supabase.functions.invoke('analyze-dna', {
        body: { sequence }
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setProgress(100);

      // Map API response to our types
      const newPredictions: FunctionPrediction[] = (data.predictions || []).map((p: any, i: number) => ({
        id: `pred-${i}`,
        name: p.name,
        category: p.category,
        confidence: p.confidence,
        mechanism: p.mechanism,
        evidence: p.evidence || [],
        diseaseAssociations: p.diseases || [],
      }));

      const newTargetGenes: TargetGene[] = (data.regulatory_network?.relationships || []).map((r: any, i: number) => ({
        id: `gene-${i}`,
        name: r.to,
        fullName: r.to,
        relationship: r.type === 'repression' ? 'repression' : 'activation',
        strength: r.strength || 0.5,
        description: `${r.type === 'activation' ? 'Activated' : 'Repressed'} by the analyzed sequence`,
      }));

      const newHypotheses: Hypothesis[] = (data.hypotheses || []).map((h: any, i: number) => ({
        id: `hyp-${i}`,
        statement: h.statement,
        experimentType: h.method?.split(' ')[0] || 'Experiment',
        approach: h.method,
        expectedOutcome: h.expected_outcome,
        resources: h.resources,
        timeline: h.timeline,
      }));

      setPredictions(newPredictions);
      setTargetGenes(newTargetGenes);
      setHypotheses(newHypotheses);

      toast.success('Analysis Complete!', {
        description: `Found ${newPredictions.length} functions with ${newTargetGenes.length} target genes.`,
      });
    } catch (err) {
      console.error('Analysis error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      toast.error('Analysis Failed', {
        description: errorMessage,
      });
      
      // Fall back to mock data for demo purposes
      const newPredictions = generateMockPredictions(sequence);
      const newTargetGenes = generateMockTargetGenes();
      const newHypotheses = generateMockHypotheses(newPredictions);
      setPredictions(newPredictions);
      setTargetGenes(newTargetGenes);
      setHypotheses(newHypotheses);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleVoiceInput = useCallback((text: string) => {
    toast.info('Voice note recorded', {
      description: text.substring(0, 50) + '...',
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="dna-watermark" />
      <Header />
      
      <LoadingOverlay isVisible={isAnalyzing} progress={progress} />
      
      <main className="container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="panel-left"
            >
              <SequenceInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
              <div className="mt-4">
                <ExportButton 
                  predictions={predictions}
                  targetGenes={targetGenes}
                  hypotheses={hypotheses}
                  disabled={isAnalyzing}
                  networkSvgRef={{ current: networkRef.current?.getSvgRef() ?? null } as React.RefObject<SVGSVGElement>}
                />
              </div>
              <div className="mt-4">
                <VoiceInteraction onVoiceInput={handleVoiceInput} />
              </div>
            </motion.div>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="panel-center"
            >
              <PredictionsPanel predictions={predictions} isLoading={isAnalyzing} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <NetworkVisualization ref={networkRef} targetGenes={targetGenes} sequenceType={predictions[0]?.name} />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="panel-right"
            >
              <HypothesisGenerator hypotheses={hypotheses} isLoading={isAnalyzing} />
            </motion.div>
          </div>
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}