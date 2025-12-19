import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const tomtomApiKey = Deno.env.get('TOMTOM_API_KEY')
  
  if (!tomtomApiKey) {
    return new Response(
      JSON.stringify({ error: 'TomTom API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify({ apiKey: tomtomApiKey }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
})
