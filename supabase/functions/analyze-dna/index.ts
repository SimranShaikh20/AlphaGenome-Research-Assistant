import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = 'AIzaSyDfkKaGJznfoMj_6UD756OvZKIgy3vfj7s';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sequence } = await req.json();
    
    if (!sequence) {
      return new Response(
        JSON.stringify({ error: "No sequence provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a genomics expert. Analyze this DNA sequence and predict its functions.

DNA Sequence: ${sequence}

Provide a detailed analysis in JSON format:
{
  "sequence_stats": {
    "length": <number>,
    "gc_content": <percentage as number>
  },
  "predictions": [
    {
      "name": "<function name>",
      "confidence": <0-100>,
      "category": "<Gene Regulation|RNA Processing|Chromatin Structure|Epigenetic Regulation>",
      "mechanism": "<detailed 3-4 sentence explanation>",
      "evidence": ["<evidence 1>", "<evidence 2>", "<evidence 3>"],
      "diseases": ["<disease 1>", "<disease 2>"]
    }
  ],
  "regulatory_network": {
    "genes": ["<gene1>", "<gene2>", "<gene3>", "<gene4>", "<gene5>"],
    "relationships": [
      {"from": "DNA_SEQUENCE", "to": "<gene>", "type": "activation", "strength": <0-1>}
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

Return ONLY valid JSON, no markdown formatting or code blocks.`;

    console.log("Calling Gemini API...");
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini response received");
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Clean up markdown if present
    let jsonText = content.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const analysisResult = JSON.parse(jsonText);
      return new Response(
        JSON.stringify(analysisResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Raw:", jsonText);
      throw new Error("Failed to parse AI response");
    }

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});