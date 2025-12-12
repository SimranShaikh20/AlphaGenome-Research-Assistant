import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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

    console.log("Calling Lovable AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a genomics expert. Always respond with valid JSON only, no markdown." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");
    
    const content = data.choices?.[0]?.message?.content;

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