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
  networkSvgRef?: React.RefObject<SVGSVGElement>;
}

const svgToDataUrl = (svgElement: SVGSVGElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.style.transform = 'none';
      
      // Add white background
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('width', '600');
      bg.setAttribute('height', '400');
      bg.setAttribute('fill', 'white');
      svgClone.insertBefore(bg, svgClone.firstChild);

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 600, 400);
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

export function ExportButton({ predictions, targetGenes, hypotheses, disabled, networkSvgRef }: ExportButtonProps) {
  const handleExport = async () => {
    if (predictions.length === 0) {
      toast.error('No data to export', {
        description: 'Run an analysis first to generate a report.',
      });
      return;
    }

    try {
      let networkImageDataUrl: string | undefined;
      
      if (networkSvgRef?.current && targetGenes.length > 0) {
        try {
          networkImageDataUrl = await svgToDataUrl(networkSvgRef.current);
        } catch (error) {
          console.warn('Could not convert network chart:', error);
        }
      }

      exportToPDF({ predictions, targetGenes, hypotheses, networkImageDataUrl });
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
