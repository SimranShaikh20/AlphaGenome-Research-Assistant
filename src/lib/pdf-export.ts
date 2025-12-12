import jsPDF from 'jspdf';
import type { FunctionPrediction, TargetGene, Hypothesis } from './dna-utils';

interface ExportData {
  predictions: FunctionPrediction[];
  targetGenes: TargetGene[];
  hypotheses: Hypothesis[];
  networkImageDataUrl?: string;
}

export const exportToPDF = (data: ExportData) => {
  const { predictions, targetGenes, hypotheses } = data;
  const pdf = new jsPDF();
  let yPos = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > 280) {
      pdf.addPage();
      yPos = 20;
    }
  };

  // Helper function to wrap text
  const addWrappedText = (text: string, x: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      checkNewPage(8);
      pdf.text(line, x, yPos);
      yPos += 6;
    });
  };

  // Title
  pdf.setFillColor(30, 64, 175);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DNA Sequence Analysis Report', margin, 28);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, 36);
  
  yPos = 55;
  pdf.setTextColor(0, 0, 0);

  // Summary Section
  pdf.setFillColor(240, 245, 255);
  pdf.rect(margin, yPos - 5, contentWidth, 25, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 64, 175);
  pdf.text('Analysis Summary', margin + 5, yPos + 5);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.text(`${predictions.length} Function Predictions  |  ${targetGenes.length} Target Genes  |  ${hypotheses.length} Hypotheses`, margin + 5, yPos + 15);
  yPos += 35;

  // Function Predictions Section
  checkNewPage(30);
  pdf.setFillColor(30, 64, 175);
  pdf.rect(margin, yPos - 3, contentWidth, 10, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Function Predictions', margin + 5, yPos + 4);
  yPos += 15;

  predictions.forEach((pred, index) => {
    checkNewPage(50);
    
    // Prediction header
    pdf.setFillColor(248, 250, 255);
    pdf.rect(margin, yPos - 3, contentWidth, 12, 'F');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175);
    pdf.text(`${index + 1}. ${pred.name}`, margin + 3, yPos + 5);
    
    // Confidence badge
    const confColor = pred.confidence >= 80 ? [34, 197, 94] : 
                      pred.confidence >= 60 ? [59, 130, 246] : 
                      pred.confidence >= 40 ? [234, 179, 8] : [156, 163, 175];
    pdf.setFillColor(confColor[0], confColor[1], confColor[2]);
    pdf.roundedRect(pageWidth - margin - 25, yPos - 2, 22, 10, 2, 2, 'F');
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`${pred.confidence}%`, pageWidth - margin - 20, yPos + 5);
    
    yPos += 15;
    
    // Category
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Category: ${pred.category}`, margin + 3, yPos);
    yPos += 8;
    
    // Mechanism
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'normal');
    addWrappedText(`Mechanism: ${pred.mechanism}`, margin + 3, contentWidth - 6);
    yPos += 3;
    
    // Evidence
    const evidenceArray = Array.isArray(pred.evidence) ? pred.evidence : [pred.evidence];
    if (evidenceArray.length > 0 && evidenceArray[0]) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Evidence:', margin + 3, yPos);
      yPos += 6;
      pdf.setFont('helvetica', 'normal');
      evidenceArray.forEach((ev: string) => {
        checkNewPage(8);
        pdf.text(`• ${ev}`, margin + 8, yPos);
        yPos += 6;
      });
    }
    
    // Diseases
    if (pred.diseaseAssociations.length > 0) {
      yPos += 2;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Disease Associations:', margin + 3, yPos);
      yPos += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.text(pred.diseaseAssociations.join(', '), margin + 8, yPos);
      yPos += 6;
    }
    
    yPos += 8;
  });

  // Regulatory Network Section
  checkNewPage(30);
  yPos += 5;
  pdf.setFillColor(124, 58, 237);
  pdf.rect(margin, yPos - 3, contentWidth, 10, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Regulatory Network - Target Genes', margin + 5, yPos + 4);
  yPos += 15;

  // Add network visualization image if available
  if (data.networkImageDataUrl) {
    checkNewPage(100);
    const imgWidth = contentWidth;
    const imgHeight = (imgWidth * 400) / 600; // Maintain 600x400 aspect ratio
    pdf.addImage(data.networkImageDataUrl, 'PNG', margin, yPos, imgWidth, imgHeight);
    yPos += imgHeight + 10;
  }

  // Table header
  pdf.setFillColor(240, 240, 250);
  pdf.rect(margin, yPos - 3, contentWidth, 10, 'F');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(60, 60, 60);
  pdf.text('Gene', margin + 5, yPos + 4);
  pdf.text('Relationship', margin + 60, yPos + 4);
  pdf.text('Strength', margin + 110, yPos + 4);
  pdf.text('Description', margin + 145, yPos + 4);
  yPos += 12;

  targetGenes.forEach((gene, index) => {
    checkNewPage(12);
    
    if (index % 2 === 0) {
      pdf.setFillColor(248, 248, 252);
      pdf.rect(margin, yPos - 3, contentWidth, 10, 'F');
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175);
    pdf.text(gene.name, margin + 5, yPos + 4);
    
    pdf.setFont('helvetica', 'normal');
    const relColor = gene.relationship === 'activation' ? [34, 197, 94] : [239, 68, 68];
    pdf.setTextColor(relColor[0], relColor[1], relColor[2]);
    pdf.text(gene.relationship, margin + 60, yPos + 4);
    
    pdf.setTextColor(60, 60, 60);
    pdf.text(`${Math.round(gene.strength * 100)}%`, margin + 110, yPos + 4);
    
    const descLines = pdf.splitTextToSize(gene.description, 40);
    pdf.text(descLines[0], margin + 145, yPos + 4);
    
    yPos += 10;
  });

  // Hypotheses Section
  checkNewPage(30);
  yPos += 10;
  pdf.setFillColor(34, 197, 94);
  pdf.rect(margin, yPos - 3, contentWidth, 10, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Research Hypotheses', margin + 5, yPos + 4);
  yPos += 15;

  hypotheses.forEach((hyp, index) => {
    checkNewPage(60);
    
    pdf.setFillColor(240, 253, 244);
    pdf.rect(margin, yPos - 3, contentWidth, 8, 'F');
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(21, 128, 61);
    pdf.text(`Hypothesis ${index + 1}: ${hyp.experimentType}`, margin + 3, yPos + 3);
    yPos += 12;
    
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'normal');
    addWrappedText(hyp.statement, margin + 3, contentWidth - 6);
    yPos += 3;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Experimental Approach:', margin + 3, yPos);
    yPos += 6;
    pdf.setFont('helvetica', 'normal');
    addWrappedText(hyp.approach, margin + 8, contentWidth - 11);
    yPos += 3;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Expected Outcome:', margin + 3, yPos);
    yPos += 6;
    pdf.setFont('helvetica', 'normal');
    addWrappedText(hyp.expectedOutcome, margin + 8, contentWidth - 11);
    yPos += 3;
    
    // Resources and Timeline in one line
    pdf.setFont('helvetica', 'bold');
    pdf.text('Resources:', margin + 3, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(hyp.resources, margin + 30, yPos);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Timeline:', margin + 100, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(hyp.timeline, margin + 125, yPos);
    
    yPos += 15;
  });

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    pdf.text('Generated by ncRNA Function Predictor', margin, 290);
  }

  // Download
  pdf.save(`dna-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
