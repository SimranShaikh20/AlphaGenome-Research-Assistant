import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { SequenceInput } from '@/components/SequenceInput';
import { PredictionsPanel } from '@/components/PredictionsPanel';
import { NetworkVisualization } from '@/components/NetworkVisualization';
import { HypothesisGenerator } from '@/components/HypothesisGenerator';
import { VoiceInteraction } from '@/components/VoiceInteraction';
import { ResearchNotebook } from '@/components/ResearchNotebook';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import {
  getSequenceStats,
  generateMockPredictions,
  generateMockTargetGenes,
  generateMockHypotheses,
  type FunctionPrediction,
  type TargetGene,
  type Hypothesis,
  type AnalysisResult,
} from '@/lib/dna-utils';

export default function Index() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [predictions, setPredictions] = useState<FunctionPrediction[]>([]);
  const [targetGenes, setTargetGenes] = useState<TargetGene[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [currentSequence, setCurrentSequence] = useState('');

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
    setIsAnalyzing(true);
    setCurrentSequence(sequence);
    setProgress(10);

    try {
      const sequenceStats = getSequenceStats(sequence);
      
      const { data, error } = await supabase.functions.invoke('analyze-dna', {
        body: { sequence, sequenceStats },
      });

      setProgress(100);

      if (error) throw new Error(error.message || 'Analysis failed');
      if (data.error) throw new Error(data.error);

      const newPredictions: FunctionPrediction[] = (data.predictions || []).map((p: any, i: number) => ({
        id: p.id || `pred-${i}`,
        name: p.name,
        category: p.category,
        confidence: p.confidence,
        mechanism: p.mechanism,
        evidence: Array.isArray(p.evidence) ? p.evidence : [p.evidence],
        diseaseAssociations: p.diseaseAssociations || [],
      }));

      const newTargetGenes: TargetGene[] = (data.targetGenes || []).map((g: any, i: number) => ({
        id: g.id || `gene-${i}`,
        name: g.name,
        fullName: g.fullName,
        relationship: g.relationship === 'repression' ? 'repression' : 'activation',
        strength: g.strength || 0.5,
        description: g.description,
      }));

      const newHypotheses: Hypothesis[] = (data.hypotheses || []).map((h: any, i: number) => ({
        id: h.id || `hyp-${i}`,
        statement: h.statement,
        experimentType: h.approach?.split(' ')[0] || 'Experiment',
        approach: h.approach,
        expectedOutcome: h.expectedOutcome,
        resources: h.resources,
        timeline: h.timeline,
      }));

      setPredictions(newPredictions);
      setTargetGenes(newTargetGenes);
      setHypotheses(newHypotheses);

      const newAnalysis: AnalysisResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        sequence,
        sequenceType: newPredictions[0]?.category || 'Unknown',
        predictions: newPredictions,
        targetGenes: newTargetGenes,
        hypotheses: newHypotheses,
        voiceNotes: [],
      };

      setAnalyses((prev) => [newAnalysis, ...prev]);

      toast.success('Analysis Complete!', {
        description: `Found ${newPredictions.length} functions with ${newTargetGenes.length} target genes.`,
      });
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Analysis Failed', {
        description: err instanceof Error ? err.message : 'An error occurred',
      });
      
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
    if (analyses.length > 0) {
      setAnalyses((prev) => {
        const updated = [...prev];
        if (updated[0]) {
          updated[0] = { ...updated[0], voiceNotes: [...updated[0].voiceNotes, text] };
        }
        return updated;
      });
    }
  }, [analyses.length]);

  const handleClearHistory = useCallback(() => {
    setAnalyses([]);
    toast.info('History cleared');
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
              <div className="mt-6">
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
              <NetworkVisualization targetGenes={targetGenes} sequenceType={predictions[0]?.name} />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="panel-right"
            >
              <HypothesisGenerator hypotheses={hypotheses} isLoading={isAnalyzing} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="panel-right h-[350px]"
            >
              <ResearchNotebook analyses={analyses} onClearHistory={handleClearHistory} />
            </motion.div>
          </div>
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
