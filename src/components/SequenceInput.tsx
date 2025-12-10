import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  Image,
  Trash2,
  Check,
  AlertCircle,
  Dna,
  Heart,
  Zap,
  VolumeX,
  Layers,
  Info,
} from 'lucide-react';
import {
  validateSequence,
  EXAMPLE_SEQUENCES,
  type SequenceValidation,
} from '@/lib/dna-utils';

interface SequenceInputProps {
  onAnalyze: (sequence: string) => void;
  isAnalyzing: boolean;
}

const exampleIcons = {
  enhancer: Heart,
  promoter: Zap,
  silencer: VolumeX,
  insulator: Layers,
};

const exampleColors = {
  enhancer: 'example-card-green',
  promoter: 'example-card-blue',
  silencer: 'example-card-orange',
  insulator: 'example-card-purple',
};

export function SequenceInput({ onAnalyze, isAnalyzing }: SequenceInputProps) {
  const [sequence, setSequence] = useState('');
  const [validation, setValidation] = useState<SequenceValidation | null>(null);
  const [lastNotification, setLastNotification] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSequenceChange = useCallback((value: string, showNotifications = true) => {
    setSequence(value);
    if (value.trim()) {
      const result = validateSequence(value);
      setValidation(result);
      
      // Show helpful notifications (only once per type)
      if (showNotifications) {
        if (result.wasConverted && lastNotification !== 'rna') {
          toast.info('RNA sequence detected', {
            description: 'Converted to DNA (U→T)',
          });
          setLastNotification('rna');
        } else if (result.wasFasta && !result.wasConverted && lastNotification !== 'fasta') {
          toast.info('FASTA format detected', {
            description: 'Extracting sequence data...',
          });
          setLastNotification('fasta');
        }
      }
    } else {
      setValidation(null);
      setLastNotification('');
    }
  }, [lastNotification]);

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
    handleSequenceChange(exampleSequence, false);
  };

  const handleAnalyze = () => {
    if (validation?.isValid) {
      onAnalyze(validation.cleanedSequence);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
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

      {/* Textarea with gradient border on focus */}
      <div className="input-gradient-focus rounded-xl">
        <div className="relative">
          <textarea
            value={sequence}
            onChange={(e) => handleSequenceChange(e.target.value)}
            placeholder="Paste your DNA sequence here (FASTA format supported)...&#10;&#10;Example:&#10;>sequence_name&#10;ATGCGTACGTAGCTAGCTGATCGATCG..."
            className="w-full h-[250px] bg-background border-2 border-border rounded-xl px-4 py-3 font-mono text-sm resize-none focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            style={{ fontFamily: "'Monaco', 'Consolas', 'IBM Plex Mono', monospace" }}
          />
          {sequence && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSequenceChange('')}
              className="absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Format info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="w-3 h-3" />
        <span>Accepts DNA (ATGC) and RNA (AUGC) formats. Min 50 bp, max 10,000 bp.</span>
      </div>

      {/* Live validation feedback */}
      <AnimatePresence>
        {validation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
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
                  {validation.error || `Invalid Characters: ${validation.invalidCharacters.join(', ')}`}
                </Badge>
              )}
              
              {validation.wasConverted && (
                <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950/30">
                  RNA → DNA
                </Badge>
              )}
              
              {validation.wasFasta && (
                <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/30">
                  FASTA
                </Badge>
              )}
            </div>

            {/* Always show stats when we have a cleaned sequence */}
            {validation.length > 0 && (
              <div className="flex items-center justify-center gap-4 py-2 bg-muted/50 rounded-lg text-sm">
                <span className="font-mono">
                  <span className="text-muted-foreground">Length:</span>{' '}
                  <span className={`font-semibold ${validation.isValid ? 'text-foreground' : 'text-amber-600'}`}>
                    {validation.length} bp
                  </span>
                </span>
                <span className="text-border">|</span>
                <span className="font-mono">
                  <span className="text-muted-foreground">GC Content:</span>{' '}
                  <span className="font-semibold text-foreground">{validation.gcContent}%</span>
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Example Sequences as Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Load Example Sequences</h3>
        <div className="grid grid-cols-2 gap-3">
          {EXAMPLE_SEQUENCES.map((example) => {
            const IconComponent = exampleIcons[example.type as keyof typeof exampleIcons] || Dna;
            const colorClass = exampleColors[example.type as keyof typeof exampleColors] || 'example-card-blue';
            
            return (
              <motion.button
                key={example.name}
                onClick={() => handleExampleSelect(example.sequence)}
                className={`example-card ${colorClass} text-left`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">{example.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{example.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Analyze Button */}
      <motion.div
        whileHover={!isAnalyzing && validation?.isValid ? { scale: 1.02 } : {}}
        whileTap={!isAnalyzing && validation?.isValid ? { scale: 0.98 } : {}}
      >
        <Button
          onClick={handleAnalyze}
          disabled={!validation?.isValid || isAnalyzing}
          className={`w-full h-14 text-lg font-bold btn-gradient ${
            validation?.isValid && !isAnalyzing ? 'btn-pulse' : ''
          }`}
        >
          {isAnalyzing ? (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Dna className="w-5 h-5" />
              </motion.div>
              <span>Analyzing Sequence...</span>
            </motion.div>
          ) : (
            <>
              <Dna className="w-5 h-5 mr-2" />
              Analyze Sequence
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
