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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { query, countryCode } = await req.json()
    
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TomTom Search API - Fuzzy Search with country filter
    const params = new URLSearchParams({
      key: tomtomApiKey,
      query: query,
      limit: '5',
      typeahead: 'true',
    })
    
    if (countryCode) {
      params.append('countrySet', countryCode)
    }

    const response = await fetch(
      `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?${params}`
    )

    if (!response.ok) {
      throw new Error('TomTom API request failed')
    }

    const data = await response.json()
    
    const results = data.results?.map((result: any) => ({
      id: result.id,
      address: result.address?.freeformAddress || result.poi?.name || '',
      name: result.poi?.name,
      position: {
        lat: result.position?.lat,
        lng: result.position?.lon,
      },
      country: result.address?.country,
      city: result.address?.municipality,
    })) || []

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Address search error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to search addresses' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
