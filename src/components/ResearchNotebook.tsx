import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  BookOpen,
  Clock,
  Download,
  Trash2,
  FileText,
  Activity,
  Lightbulb,
  Mic,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/dna-utils';

interface ResearchNotebookProps {
  analyses: AnalysisResult[];
  onClearHistory: () => void;
}

// Helper to safely format timestamp
function formatTimestamp(timestamp: Date | string): string {
  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown date';
  }
}

export function ResearchNotebook({ analyses, onClearHistory }: ResearchNotebookProps) {
  const exportToJSON = () => {
    if (analyses.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    try {
      // Create serializable data (Date objects need to be converted to strings)
      const exportData = analyses.map(analysis => ({
        ...analysis,
        timestamp: analysis.timestamp instanceof Date 
          ? analysis.timestamp.toISOString() 
          : String(analysis.timestamp),
      }));
      
      const data = JSON.stringify(exportData, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `alphagenomic-research-${new Date().toISOString().split('T')[0]}.json`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Research data exported!', {
        description: `${analyses.length} analysis record(s) saved to file.`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed', {
        description: 'Unable to download the research data.',
      });
    }
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
            title="Download research data"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onClearHistory}
            disabled={analyses.length === 0}
            title="Clear history"
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
          <div className="space-y-3">
            {analyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-lg p-3 bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-xs capitalize bg-primary/10 text-primary border-primary/30">
                    {analysis.sequenceType || 'Analysis'}
                  </Badge>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(analysis.timestamp)}
                  </div>
                </div>

                <div className="text-xs font-mono bg-muted/50 rounded px-2 py-1 mb-2 truncate text-muted-foreground">
                  {analysis.sequence?.substring(0, 40) || 'N/A'}...
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-primary/10 rounded p-1.5">
                    <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
                      <Activity className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-foreground">{analysis.predictions?.length || 0}</span>
                    <span className="text-[10px] text-muted-foreground block">Predictions</span>
                  </div>
                  <div className="bg-success/10 rounded p-1.5">
                    <div className="flex items-center justify-center gap-1 text-success mb-0.5">
                      <FileText className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-foreground">{analysis.targetGenes?.length || 0}</span>
                    <span className="text-[10px] text-muted-foreground block">Genes</span>
                  </div>
                  <div className="bg-warning/10 rounded p-1.5">
                    <div className="flex items-center justify-center gap-1 text-warning mb-0.5">
                      <Lightbulb className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-foreground">{analysis.hypotheses?.length || 0}</span>
                    <span className="text-[10px] text-muted-foreground block">Hypotheses</span>
                  </div>
                </div>

                {analysis.voiceNotes && analysis.voiceNotes.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Mic className="w-3 h-3" />
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