import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Clock,
  Download,
  Trash2,
  FileText,
  Activity,
  Lightbulb,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/dna-utils';

interface ResearchNotebookProps {
  analyses: AnalysisResult[];
  onClearHistory: () => void;
}

export function ResearchNotebook({ analyses, onClearHistory }: ResearchNotebookProps) {
  const exportToJSON = () => {
    if (analyses.length === 0) return;
    
    // Create serializable data (Date objects need to be converted to strings)
    const exportData = analyses.map(analysis => ({
      ...analysis,
      timestamp: analysis.timestamp.toISOString(),
    }));
    
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alphagenomic-research-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="section-header mb-0">
          <BookOpen className="w-4 h-4" />
          Research Notebook
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={exportToJSON}
            disabled={analyses.length === 0}
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onClearHistory}
            disabled={analyses.length === 0}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {analyses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <BookOpen className="w-10 h-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Your analysis history will appear here
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Each analysis is automatically saved
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-4">
            {analyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-lg p-3 bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {analysis.sequenceType}
                  </Badge>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {analysis.timestamp.toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="text-xs font-mono bg-muted/50 rounded px-2 py-1 mb-2 truncate">
                  {analysis.sequence.substring(0, 50)}...
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/30 rounded p-1.5">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <Activity className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold">{analysis.predictions.length}</span>
                    <span className="text-[10px] text-muted-foreground block">Predictions</span>
                  </div>
                  <div className="bg-muted/30 rounded p-1.5">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <FileText className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold">{analysis.targetGenes.length}</span>
                    <span className="text-[10px] text-muted-foreground block">Genes</span>
                  </div>
                  <div className="bg-muted/30 rounded p-1.5">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <Lightbulb className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold">{analysis.hypotheses.length}</span>
                    <span className="text-[10px] text-muted-foreground block">Hypotheses</span>
                  </div>
                </div>

                {analysis.voiceNotes.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="text-[10px] text-muted-foreground">
                      {analysis.voiceNotes.length} voice note(s)
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
