// DNA Sequence Utilities

export const DNA_BASES = ['A', 'T', 'G', 'C'] as const;
export type DNABase = typeof DNA_BASES[number];

export interface SequenceValidation {
  isValid: boolean;
  cleanedSequence: string;
  length: number;
  gcContent: number;
  invalidCharacters: string[];
}

export interface FunctionPrediction {
  id: string;
  name: string;
  category: string;
  confidence: number;
  mechanism: string;
  evidence: string[];
  diseaseAssociations: string[];
}

export interface TargetGene {
  id: string;
  name: string;
  relationship: 'activation' | 'repression';
  strength: number;
  description: string;
}

export interface Hypothesis {
  id: string;
  statement: string;
  experimentType: string;
  approach: string;
  expectedOutcome: string;
  resources: string;
  timeline: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: Date;
  sequence: string;
  sequenceType: string;
  predictions: FunctionPrediction[];
  targetGenes: TargetGene[];
  hypotheses: Hypothesis[];
  voiceNotes: string[];
}

export function validateSequence(input: string): SequenceValidation {
  const cleaned = input.toUpperCase().replace(/\s+/g, '').replace(/[0-9]/g, '');
  const validBases = new Set(DNA_BASES);
  const invalidChars: string[] = [];
  let gcCount = 0;
  let validSequence = '';

  for (const char of cleaned) {
    if (validBases.has(char as DNABase)) {
      validSequence += char;
      if (char === 'G' || char === 'C') {
        gcCount++;
      }
    } else if (char !== '\n' && char !== '\r' && char !== '>') {
      if (!invalidChars.includes(char)) {
        invalidChars.push(char);
      }
    }
  }

  const gcContent = validSequence.length > 0 ? (gcCount / validSequence.length) * 100 : 0;

  return {
    isValid: invalidChars.length === 0 && validSequence.length > 0,
    cleanedSequence: validSequence,
    length: validSequence.length,
    gcContent: Math.round(gcContent * 10) / 10,
    invalidCharacters: invalidChars,
  };
}

export function parseFASTA(input: string): { header: string; sequence: string }[] {
  const entries: { header: string; sequence: string }[] = [];
  const lines = input.split('\n');
  let currentHeader = '';
  let currentSequence = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('>')) {
      if (currentSequence) {
        entries.push({ header: currentHeader, sequence: currentSequence });
      }
      currentHeader = trimmed.substring(1);
      currentSequence = '';
    } else {
      currentSequence += trimmed;
    }
  }

  if (currentSequence) {
    entries.push({ header: currentHeader, sequence: currentSequence });
  }

  return entries;
}

export function formatSequence(sequence: string, lineLength: number = 60): string {
  const chunks: string[] = [];
  for (let i = 0; i < sequence.length; i += lineLength) {
    chunks.push(sequence.substring(i, i + lineLength));
  }
  return chunks.join('\n');
}

export function getSequenceStats(sequence: string): {
  length: number;
  gcContent: number;
  atContent: number;
  aCount: number;
  tCount: number;
  gCount: number;
  cCount: number;
} {
  const counts = { A: 0, T: 0, G: 0, C: 0 };
  
  for (const base of sequence.toUpperCase()) {
    if (base in counts) {
      counts[base as keyof typeof counts]++;
    }
  }

  const total = sequence.length;
  const gcContent = total > 0 ? ((counts.G + counts.C) / total) * 100 : 0;
  const atContent = total > 0 ? ((counts.A + counts.T) / total) * 100 : 0;

  return {
    length: total,
    gcContent: Math.round(gcContent * 10) / 10,
    atContent: Math.round(atContent * 10) / 10,
    aCount: counts.A,
    tCount: counts.T,
    gCount: counts.G,
    cCount: counts.C,
  };
}

export const EXAMPLE_SEQUENCES = [
  {
    name: 'Cardiac Enhancer',
    description: 'A regulatory element active in cardiac tissue development',
    sequence: 'ATGCGTACGTAGCTAGCTGATCGATCGTAGCTAGCTGATCGATCGTAGCTAGCTGATCGATCGTAGCTAGCTGATCGATCGTAGCTAGCTGATCGATCGTAGCTAGCTGATCGATCGTAGCTAGCTGATCGATCGTAGCTAGCTGATCGATCGTAGCTAGCTGATCGATCGTAGCTAGCTGATCGATCG',
    type: 'enhancer',
  },
  {
    name: 'Promoter Region',
    description: 'Contains TATA box and transcription start site',
    sequence: 'TATAAAAGGCCGCGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACG',
    type: 'promoter',
  },
  {
    name: 'Silencer Element',
    description: 'Represses gene expression when bound by specific factors',
    sequence: 'GCGCGCATATATATAGCGCGCGCGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA',
    type: 'silencer',
  },
  {
    name: 'CTCF Binding Site',
    description: 'Chromatin organization and insulator function',
    sequence: 'CCGCGNGGNGGCAGCACCGCGNGGNGGCAGCACCGCGNGGNGGCAGCACCGCGNGGNGGCAGCACCGCGNGGNGGCAGCACCGCGNGGNGGCAGCACCGCGNGGNGGCAGCACCGCGNGGNGGCAGCACCGCGNGGNGGCAGCACCGCGNGGNGGCAGCACCGCGNGGNGGCAGCAC'.replace(/N/g, 'A'),
    type: 'insulator',
  },
];

export function generateMockPredictions(sequence: string): FunctionPrediction[] {
  const gcContent = getSequenceStats(sequence).gcContent;
  const length = sequence.length;
  
  const predictions: FunctionPrediction[] = [];
  
  // Determine primary prediction based on sequence characteristics
  if (sequence.includes('TATA')) {
    predictions.push({
      id: 'pred-1',
      name: 'Core Promoter Element',
      category: 'Gene Regulation',
      confidence: 88 + Math.floor(Math.random() * 10),
      mechanism: 'Contains canonical TATA box sequence that recruits TFIID and positions RNA polymerase II for transcription initiation',
      evidence: ['TATA box motif detected', 'Positioned -25 to -30 from TSS', 'Compatible with Pol II transcription'],
      diseaseAssociations: ['Promoter mutations linked to various cancers', 'Beta-thalassemia mutations'],
    });
  }
  
  if (gcContent > 55) {
    predictions.push({
      id: 'pred-2',
      name: 'CpG Island Regulatory Region',
      category: 'Epigenetic Regulation',
      confidence: 75 + Math.floor(Math.random() * 15),
      mechanism: 'High GC content suggests CpG island presence, often found near gene promoters and subject to DNA methylation regulation',
      evidence: [`GC content: ${gcContent}%`, 'CpG dinucleotide enrichment', 'Potential methylation target'],
      diseaseAssociations: ['Aberrant methylation in cancer', 'Imprinting disorders'],
    });
  }
  
  if (sequence.match(/GCGC.*GCGC/)) {
    predictions.push({
      id: 'pred-3',
      name: 'Silencer Element',
      category: 'Transcriptional Repression',
      confidence: 65 + Math.floor(Math.random() * 20),
      mechanism: 'Repetitive GC-rich motifs can recruit repressive transcription factors and chromatin modifiers',
      evidence: ['GC-rich repeat pattern', 'Potential REST/NRSF binding', 'Chromatin condensation target'],
      diseaseAssociations: ['Neurological disorders', 'Developmental abnormalities'],
    });
  }
  
  // Add some general predictions
  predictions.push({
    id: 'pred-4',
    name: 'Enhancer Activity',
    category: 'Tissue-Specific Regulation',
    confidence: 55 + Math.floor(Math.random() * 30),
    mechanism: 'Sequence features suggest potential enhancer activity, capable of increasing transcription of target genes in specific cellular contexts',
    evidence: ['Moderate sequence complexity', 'Potential TF binding sites', 'Conserved across species'],
    diseaseAssociations: ['Enhancer hijacking in cancer', 'Limb malformations'],
  });
  
  predictions.push({
    id: 'pred-5',
    name: 'Transcription Factor Binding Site',
    category: 'Gene Regulation',
    confidence: 40 + Math.floor(Math.random() * 30),
    mechanism: 'Contains potential binding motifs for sequence-specific transcription factors',
    evidence: ['Short conserved motifs detected', 'DNase hypersensitivity predicted', 'Evolutionary conservation'],
    diseaseAssociations: ['Mutations affect gene expression', 'Associated with complex traits'],
  });
  
  // Sort by confidence
  return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

export function generateMockTargetGenes(): TargetGene[] {
  const genes = [
    { name: 'GATA4', full: 'GATA Binding Protein 4', role: 'Cardiac transcription factor' },
    { name: 'NKX2-5', full: 'NK2 Homeobox 5', role: 'Heart development' },
    { name: 'SOX2', full: 'SRY-Box 2', role: 'Pluripotency maintenance' },
    { name: 'MYC', full: 'MYC Proto-Oncogene', role: 'Cell proliferation' },
    { name: 'CTCF', full: 'CCCTC-Binding Factor', role: 'Chromatin organization' },
    { name: 'TP53', full: 'Tumor Protein P53', role: 'Cell cycle regulation' },
    { name: 'HNF4A', full: 'Hepatocyte Nuclear Factor 4 Alpha', role: 'Liver function' },
  ];
  
  const shuffled = genes.sort(() => Math.random() - 0.5).slice(0, 5);
  
  return shuffled.map((gene, index) => ({
    id: `gene-${index}`,
    name: gene.name,
    relationship: Math.random() > 0.4 ? 'activation' : 'repression',
    strength: 0.3 + Math.random() * 0.7,
    description: `${gene.full} - ${gene.role}`,
  }));
}

export function generateMockHypotheses(predictions: FunctionPrediction[]): Hypothesis[] {
  const topPrediction = predictions[0];
  
  const hypotheses: Hypothesis[] = [
    {
      id: 'hyp-1',
      statement: `The identified sequence functions as a ${topPrediction?.name.toLowerCase() || 'regulatory element'} and enhances expression of nearby genes in a tissue-specific manner.`,
      experimentType: 'Reporter Assay',
      approach: 'Clone the sequence upstream of a luciferase reporter gene and transfect into relevant cell lines. Measure luminescence to quantify enhancer activity.',
      expectedOutcome: 'Increased luciferase activity (>2-fold) compared to empty vector control in target tissue cell lines.',
      resources: 'Luciferase reporter plasmid, cell lines, transfection reagents, luminometer',
      timeline: '4-6 weeks',
    },
    {
      id: 'hyp-2',
      statement: 'Specific transcription factors bind to the regulatory sequence and mediate its function.',
      experimentType: 'ChIP-seq Analysis',
      approach: 'Perform chromatin immunoprecipitation followed by sequencing using antibodies against predicted transcription factors.',
      expectedOutcome: 'Enrichment of ChIP signal at the sequence location with predicted TFs in relevant cell types.',
      resources: 'ChIP-grade antibodies, sequencing platform, computational analysis pipeline',
      timeline: '6-8 weeks',
    },
    {
      id: 'hyp-3',
      statement: 'Deletion of this regulatory sequence affects expression of target genes.',
      experimentType: 'CRISPR Knockout',
      approach: 'Design guide RNAs flanking the sequence region. Use CRISPR-Cas9 to delete the region in cell lines or animal models.',
      expectedOutcome: 'Measurable changes in expression of predicted target genes via qPCR or RNA-seq.',
      resources: 'CRISPR reagents, cell culture, molecular biology supplies',
      timeline: '8-12 weeks',
    },
    {
      id: 'hyp-4',
      statement: 'The sequence exhibits chromatin accessibility patterns consistent with its predicted regulatory function.',
      experimentType: 'ATAC-seq Profiling',
      approach: 'Perform ATAC-seq in relevant cell types to assess chromatin accessibility at the sequence location.',
      expectedOutcome: 'Open chromatin signal at the sequence region in cell types where function is predicted.',
      resources: 'ATAC-seq protocol, sequencing, bioinformatics analysis',
      timeline: '3-4 weeks',
    },
  ];
  
  return hypotheses;
}
