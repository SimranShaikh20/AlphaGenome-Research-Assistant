import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { SequenceInput } from '@/components/SequenceInput';
import { PredictionsPanel } from '@/components/PredictionsPanel';
import { NetworkVisualization } from '@/components/NetworkVisualization';
import { HypothesisGenerator } from '@/components/HypothesisGenerator';
import { VoiceInteraction } from '@/components/VoiceInteraction';
import { ResearchNotebook } from '@/components/ResearchNotebook';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { getStoredApiKey } from '@/components/ApiKeyModal';
import { analyzeSequenceWithGemini } from '@/lib/gemini-api';
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
    // Check for API key first
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      toast.error('API Key Required', {
        description: 'Please set your Gemini API key in settings (gear icon in header).',
      });
      return;
    }

    if (!sequence.trim()) {
      toast.error('No Sequence', {
        description: 'Please enter a DNA sequence first.',
      });
      return;
    }

    setIsAnalyzing(true);
    setCurrentSequence(sequence);
    setProgress(10);

    try {
      setProgress(30);
      
      // Call Gemini API directly
      const data = await analyzeSequenceWithGemini(sequence, apiKey);

      setProgress(100);

      // Map API response to our types
      const newPredictions: FunctionPrediction[] = (data.predictions || []).map((p, i) => ({
        id: `pred-${i}`,
        name: p.name,
        category: p.category,
        confidence: p.confidence,
        mechanism: p.mechanism,
        evidence: p.evidence || [],
        diseaseAssociations: p.diseases || [],
      }));

      const newTargetGenes: TargetGene[] = (data.regulatory_network?.relationships || []).map((r, i) => ({
        id: `gene-${i}`,
        name: r.to,
        fullName: r.to,
        relationship: r.type === 'repression' ? 'repression' : 'activation',
        strength: r.strength || 0.5,
        description: `${r.type === 'activation' ? 'Activated' : 'Repressed'} by the analyzed sequence`,
      }));

      const newHypotheses: Hypothesis[] = (data.hypotheses || []).map((h, i) => ({
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
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      toast.error('Analysis Failed', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => handleAnalyze(sequence),
        },
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
