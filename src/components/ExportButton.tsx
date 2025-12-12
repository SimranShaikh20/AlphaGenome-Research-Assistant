import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportToPDF } from '@/lib/pdf-export';
import type { FunctionPrediction, TargetGene, Hypothesis } from '@/lib/dna-utils';

interface ExportButtonProps {
  predictions: FunctionPrediction[];
  targetGenes: TargetGene[];
  hypotheses: Hypothesis[];
  disabled?: boolean;
}

export function ExportButton({ predictions, targetGenes, hypotheses, disabled }: ExportButtonProps) {
  const handleExport = () => {
    if (predictions.length === 0) {
      toast.error('No data to export', {
        description: 'Run an analysis first to generate a report.',
      });
      return;
    }

    try {
      exportToPDF({ predictions, targetGenes, hypotheses });
      toast.success('PDF Report Generated', {
        description: 'Your analysis report has been downloaded.',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Export Failed', {
        description: 'Could not generate PDF report.',
      });
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || predictions.length === 0}
      variant="outline"
      className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary"
    >
      <FileDown className="h-4 w-4" />
      Export PDF
    </Button>
  );
}
