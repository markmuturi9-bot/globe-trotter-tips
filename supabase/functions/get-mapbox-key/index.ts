import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Restrict CORS to app domains only
const ALLOWED_ORIGINS = [
  'https://81195315-70f6-4ad1-b5f9-255d17b94d5e.lovableproject.com',
  'https://id-preview--81195315-70f6-4ad1-b5f9-255d17b94d5e.lovable.app',
  'capacitor://localhost',
  'http://localhost',
  'http://localhost:8100',
  'http://localhost:5173',
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate origin for security (CORS headers alone don't prevent server-side requests)
  const isValidOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com')
  );
  
  if (!isValidOrigin) {
    console.error('Invalid origin:', origin);
    return new Response(
      JSON.stringify({ error: 'Unauthorized origin' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const apiKey = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    if (!apiKey) {
      console.error('MAPBOX_PUBLIC_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Mapbox API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log access (authenticated or guest)
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const token = authHeader.replace('Bearer ', '');
      const { data: authData } = await supabaseClient.auth.getClaims(token);
      if (authData?.claims?.sub) {
        console.log(`Mapbox API key retrieved for authenticated user ${authData.claims.sub}`);
      } else {
        console.log('Mapbox API key retrieved for guest user');
      }
    } else {
      console.log('Mapbox API key retrieved for guest user');
    }
    
    return new Response(
      JSON.stringify({ apiKey }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error fetching Mapbox API key:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch API key' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
