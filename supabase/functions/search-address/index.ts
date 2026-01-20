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

  const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
  
  if (!mapboxToken) {
    console.error('MAPBOX_PUBLIC_TOKEN not configured');
    return new Response(
      JSON.stringify({ error: 'Mapbox API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { query, countryCode } = await req.json();
    
    console.log(`User ${authData.claims.sub} searching for address: "${query}" in country: ${countryCode || 'any'}`);
    
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mapbox Geocoding API
    const params = new URLSearchParams({
      access_token: mapboxToken,
      autocomplete: 'true',
      limit: '5',
      types: 'place,locality,neighborhood,address,poi',
    });
    
    // Add country filter if provided (Mapbox uses lowercase 2-letter codes)
    if (countryCode) {
      params.append('country', countryCode.toLowerCase());
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;
    console.log(`Mapbox Geocoding API request: ${url.replace(mapboxToken, '[REDACTED]')}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mapbox API error: ${response.status} - ${errorText}`);
      throw new Error('Mapbox API request failed');
    }

    const data = await response.json();
    
    console.log(`Found ${data.features?.length || 0} results`);
    
    // Transform Mapbox response to match our AddressResult interface
    const results = data.features?.map((feature: any) => {
      // Extract city from context
      const cityContext = feature.context?.find((c: any) => 
        c.id?.startsWith('place') || c.id?.startsWith('locality')
      );
      const countryContext = feature.context?.find((c: any) => 
        c.id?.startsWith('country')
      );
      
      return {
        id: feature.id,
        address: feature.place_name || '',
        name: feature.text,
        position: {
          lat: feature.center?.[1],
          lng: feature.center?.[0],
        },
        country: countryContext?.text || feature.properties?.country,
        city: cityContext?.text || feature.properties?.locality,
      };
    }) || [];

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Address search error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search addresses' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
