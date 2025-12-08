import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload,
  FileText,
  Image,
  Mic,
  MicOff,
  Play,
  Trash2,
  ChevronDown,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  validateSequence,
  getSequenceStats,
  EXAMPLE_SEQUENCES,
  type SequenceValidation,
} from '@/lib/dna-utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SequenceInputProps {
  onAnalyze: (sequence: string) => void;
  isAnalyzing: boolean;
}

export function SequenceInput({ onAnalyze, isAnalyzing }: SequenceInputProps) {
  const [sequence, setSequence] = useState('');
  const [validation, setValidation] = useState<SequenceValidation | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSequenceChange = useCallback((value: string) => {
    setSequence(value);
    if (value.trim()) {
      const result = validateSequence(value);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleSequenceChange(content);
      };
      reader.readAsText(file);
    }
  };

  const handleExampleSelect = (exampleSequence: string) => {
    handleSequenceChange(exampleSequence);
    setIsExamplesOpen(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Simulated voice input - in production, use Web Speech API
      setTimeout(() => {
        setIsRecording(false);
      }, 3000);
    }
  };

  const handleAnalyze = () => {
    if (validation?.isValid) {
      onAnalyze(validation.cleanedSequence);
    }
  };

  const stats = validation?.isValid ? getSequenceStats(validation.cleanedSequence) : null;

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-header mb-0">
          <FileText className="w-4 h-4" />
          Sequence Input
        </h2>
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.fasta,.seq,.fa"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs"
          >
            <Upload className="w-3 h-3 mr-1" />
            File
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
            className="text-xs"
          >
            <Image className="w-3 h-3 mr-1" />
            Image
          </Button>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={sequence}
          onChange={(e) => handleSequenceChange(e.target.value)}
          placeholder="Paste your DNA sequence here (FASTA format supported)...
Example:
>sequence_name
ATGCGTACGTAGCTAGCTGATCGATCG..."
          className="input-scientific min-h-[140px] resize-none pr-10"
        />
        {sequence && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleSequenceChange('')}
            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {validation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {validation.isValid ? (
                <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                  <Check className="w-3 h-3 mr-1" />
                  Valid Sequence
                </Badge>
              ) : (
                <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Invalid Characters: {validation.invalidCharacters.join(', ')}
                </Badge>
              )}
            </div>

            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-muted/50 rounded-md p-2 text-center">
                  <div className="text-muted-foreground">Length</div>
                  <div className="font-mono font-semibold">{stats.length} bp</div>
                </div>
                <div className="bg-muted/50 rounded-md p-2 text-center">
                  <div className="text-muted-foreground">GC Content</div>
                  <div className="font-mono font-semibold">{stats.gcContent}%</div>
                </div>
                <div className="bg-muted/50 rounded-md p-2 text-center">
                  <div className="text-muted-foreground">A/T Bases</div>
                  <div className="font-mono">
                    <span className="dna-base-a">{stats.aCount}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="dna-base-t">{stats.tCount}</span>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-md p-2 text-center">
                  <div className="text-muted-foreground">G/C Bases</div>
                  <div className="font-mono">
                    <span className="dna-base-g">{stats.gCount}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="dna-base-c">{stats.cCount}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Collapsible open={isExamplesOpen} onOpenChange={setIsExamplesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-sm text-muted-foreground">
            <span>Load Example Sequences</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExamplesOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="grid gap-2">
            {EXAMPLE_SEQUENCES.map((example) => (
              <button
                key={example.name}
                onClick={() => handleExampleSelect(example.sequence)}
                className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{example.name}</span>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {example.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{example.description}</p>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex gap-2">
        <Button
          variant={isRecording ? 'destructive' : 'secondary'}
          size="sm"
          onClick={toggleRecording}
          className={isRecording ? 'pulse-recording' : ''}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4 mr-1" />
              Stop
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-1" />
              Voice
            </>
          )}
        </Button>

        <Button
          onClick={handleAnalyze}
          disabled={!validation?.isValid || isAnalyzing}
          className="flex-1 btn-primary-glow bg-primary hover:bg-primary/90"
        >
          {isAnalyzing ? (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing...
            </motion.div>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1" />
              Analyze Sequence
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
