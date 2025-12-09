import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { sequence, sequenceStats } = await req.json();

    if (!sequence) {
      throw new Error('No sequence provided');
    }

    const prompt = `You are an expert genomics researcher analyzing non-coding DNA sequences. Analyze this DNA sequence and predict its potential functions.

DNA Sequence (${sequenceStats?.length || sequence.length} bp, GC content: ${sequenceStats?.gcContent || 'unknown'}%):
${sequence.substring(0, 500)}${sequence.length > 500 ? '...' : ''}

Provide your analysis in the following JSON format ONLY (no other text):
{
  "predictions": [
    {
      "id": "unique_id",
      "name": "Function name",
      "category": "Category (e.g., Gene Regulation, RNA Processing, Chromatin Structure)",
      "confidence": 85,
      "mechanism": "Detailed biological mechanism explanation",
      "evidence": "Supporting evidence from sequence patterns",
      "diseaseAssociations": ["Disease 1", "Disease 2"]
    }
  ],
  "targetGenes": [
    {
      "id": "gene_id",
      "name": "Gene Symbol",
      "fullName": "Full gene name",
      "relationship": "activation or repression",
      "strength": 0.8,
      "description": "How this sequence might regulate this gene"
    }
  ],
  "hypotheses": [
    {
      "id": "hyp_id",
      "statement": "Clear hypothesis statement",
      "approach": "Suggested experimental approach",
      "expectedOutcome": "What results would support/refute this",
      "resources": "Required resources",
      "timeline": "Estimated timeline"
    }
  ]
}

Provide 3-5 function predictions with varying confidence levels, 4-6 target genes, and 3-4 testable hypotheses. Be scientifically accurate and specific.`;

    console.log('Calling Gemini API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response received');

    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error('No content in Gemini response');
    }

    // Extract JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const analysisResult = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in analyze-dna function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
