import { useState, useCallback } from 'react';
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
  const [predictions, setPredictions] = useState<FunctionPrediction[]>([]);
  const [targetGenes, setTargetGenes] = useState<TargetGene[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [currentSequence, setCurrentSequence] = useState('');

  const handleAnalyze = useCallback(async (sequence: string) => {
    setIsAnalyzing(true);
    setCurrentSequence(sequence);
    
    toast.info('Analysis Started', {
      description: 'Analyzing sequence with Gemini AI...',
    });

    try {
      const sequenceStats = getSequenceStats(sequence);
      
      const { data, error } = await supabase.functions.invoke('analyze-dna', {
        body: { sequence, sequenceStats },
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Process predictions
      const newPredictions: FunctionPrediction[] = (data.predictions || []).map((p: any, i: number) => ({
        id: p.id || `pred-${i}`,
        name: p.name,
        category: p.category,
        confidence: p.confidence,
        mechanism: p.mechanism,
        evidence: Array.isArray(p.evidence) ? p.evidence : [p.evidence],
        diseaseAssociations: p.diseaseAssociations || [],
      }));

      // Process target genes
      const newTargetGenes: TargetGene[] = (data.targetGenes || []).map((g: any, i: number) => ({
        id: g.id || `gene-${i}`,
        name: g.name,
        fullName: g.fullName,
        relationship: g.relationship === 'repression' ? 'repression' : 'activation',
        strength: g.strength || 0.5,
        description: g.description,
      }));

      // Process hypotheses
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

      // Add to analysis history
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

      toast.success('Analysis Complete', {
        description: `Found ${newPredictions.length} potential functions with ${newTargetGenes.length} target genes.`,
      });
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Analysis Failed', {
        description: err instanceof Error ? err.message : 'An error occurred during analysis',
      });
      
      // Fallback to mock data
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
          updated[0] = {
            ...updated[0],
            voiceNotes: [...updated[0].voiceNotes, text],
          };
        }
        return updated;
      });
    }
  }, [analyses.length]);

  const handleClearHistory = useCallback(() => {
    setAnalyses([]);
    toast.info('History Cleared', {
      description: 'All analysis records have been removed.',
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-3 space-y-4">
            <SequenceInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            <VoiceInteraction onVoiceInput={handleVoiceInput} />
          </div>

          {/* Center Column - Results */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PredictionsPanel predictions={predictions} isLoading={isAnalyzing} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <NetworkVisualization
                targetGenes={targetGenes}
                sequenceType={predictions[0]?.name}
              />
            </motion.div>
          </div>

          {/* Right Column - Hypothesis & Notebook */}
          <div className="lg:col-span-3 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <HypothesisGenerator hypotheses={hypotheses} isLoading={isAnalyzing} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="h-[350px]"
            >
              <ResearchNotebook analyses={analyses} onClearHistory={handleClearHistory} />
            </motion.div>
          </div>
        </div>

        {/* Footer Info */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-xs text-muted-foreground border-t border-border pt-6"
        >
          <p>
            AlphaGenome Research Assistant • Non-coding DNA Analysis Platform
          </p>
          <p className="mt-1">
            Powered by advanced AI for multimodal genomic analysis
          </p>
        </motion.footer>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
