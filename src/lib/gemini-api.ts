// Direct Gemini API client for DNA sequence analysis

export interface GeminiAnalysisResult {
  sequence_stats: {
    length: number;
    gc_content: number;
  };
  predictions: Array<{
    name: string;
    confidence: number;
    category: string;
    mechanism: string;
    evidence: string[];
    diseases: string[];
  }>;
  regulatory_network: {
    genes: string[];
    relationships: Array<{
      from: string;
      to: string;
      type: 'activation' | 'repression';
      strength: number;
    }>;
  };
  hypotheses: Array<{
    statement: string;
    method: string;
    expected_outcome: string;
    resources: string;
    timeline: string;
  }>;
}

export async function analyzeSequenceWithGemini(
  sequence: string,
  apiKey: string
): Promise<GeminiAnalysisResult> {
  const prompt = `You are a genomics expert. Analyze this DNA sequence and predict its functions.

DNA Sequence: ${sequence}

Provide a detailed analysis in JSON format:
{
  "sequence_stats": {
    "length": <number>,
    "gc_content": <percentage>
  },
  "predictions": [
    {
      "name": "<function name>",
      "confidence": <0-100>,
      "category": "<Gene Regulation|RNA Processing|Chromatin Structure>",
      "mechanism": "<detailed 3-4 sentence explanation>",
      "evidence": ["<evidence 1>", "<evidence 2>", "<evidence 3>"],
      "diseases": ["<disease 1>", "<disease 2>"]
    }
  ],
  "regulatory_network": {
    "genes": ["<gene1>", "<gene2>", "<gene3>", "<gene4>", "<gene5>"],
    "relationships": [
      {"from": "DNA_SEQUENCE", "to": "<gene>", "type": "activation|repression", "strength": <0-1>}
    ]
  },
  "hypotheses": [
    {
      "statement": "<hypothesis>",
      "method": "<experimental approach>",
      "expected_outcome": "<outcome>",
      "resources": "<what's needed>",
      "timeline": "<time estimate>"
    }
  ]
}

Return ONLY valid JSON, no markdown formatting.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API Error:', response.status, errorText);
    
    if (response.status === 400) {
      throw new Error('Invalid API key or request. Please check your API key.');
    } else if (response.status === 403) {
      throw new Error('API key does not have access. Please check your API key permissions.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    console.error('Unexpected API response:', data);
    throw new Error('Unexpected response format from API');
  }
  
  const text = data.candidates[0].content.parts[0].text;
  
  // Clean up markdown if present
  const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    console.error('JSON parse error:', parseError, 'Raw text:', jsonText);
    throw new Error('Error processing results. The AI response was not valid JSON.');
  }
}
