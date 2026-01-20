import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await supabaseClient.auth.getClaims(token);
    
    if (authError || !authData?.claims) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, countries } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`User ${authData.claims.sub} parsing tips`);

    const countriesList = countries?.map((c: { name: string; id: string }) => `${c.name} (id: ${c.id})`).join(', ') || '';

    const systemPrompt = `You are an expert at extracting travel tips from unstructured text. 
Your task is to parse the input text and extract individual travel tips.

IMPORTANT: Keep all text in its ORIGINAL LANGUAGE. Do NOT translate anything to English or any other language.
The title and description should be in the same language as the input text.

For each tip, extract:
- title: A short, catchy title in the ORIGINAL language (max 100 chars)
- description: The detailed tip/recommendation in the ORIGINAL language
- category: One of: general, food, attractions, activities, accommodation, other
- country_id: The UUID of the country from the list below (if mentioned or can be inferred)
- address: A specific address or location if mentioned (optional)

Available countries: ${countriesList}

Return a JSON array of tips. Each tip should be a separate object.
If the text contains multiple tips, create multiple objects.
If no country is mentioned but can be inferred from context, use that.
If category cannot be determined, use "general".

Example output (if input is in Swedish):
{
  "tips": [
    {
      "title": "Bästa pizzan i Rom",
      "description": "Prova margheritan på Pizzeria Da Baffetto. De har gjort pizza sedan 1922...",
      "category": "food",
      "country_id": "uuid-for-italy",
      "address": "Via del Governo Vecchio 114, Rome"
    }
  ]
}

Only return valid JSON, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let parsedTips;
    try {
      // Try to extract JSON from the response (sometimes wrapped in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedTips = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse tips from AI response');
    }

    console.log('Tips parsed successfully');

    return new Response(
      JSON.stringify(parsedTips),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-tips:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
