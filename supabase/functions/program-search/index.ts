import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, filters = {}, limit = 50, offset = 0 } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Build search query
    let searchQuery = supabase
      .from('programs')
      .select(`
        id,
        title,
        description,
        provider,
        category,
        subcategory,
        delivery_method,
        duration,
        cost,
        location,
        keywords,
        created_at
      `)
      .limit(limit)
      .range(offset, offset + limit - 1)

    // Apply text search if query provided
    if (query && query.trim()) {
      searchQuery = searchQuery.or(`
        title.ilike.%${query}%,
        description.ilike.%${query}%,
        provider.ilike.%${query}%,
        keywords.cs.{${query}}
      `)
    }

    // Apply filters
    if (filters.category) {
      searchQuery = searchQuery.eq('category', filters.category)
    }
    if (filters.provider) {
      searchQuery = searchQuery.eq('provider', filters.provider)
    }
    if (filters.delivery_method) {
      searchQuery = searchQuery.eq('delivery_method', filters.delivery_method)
    }
    if (filters.location) {
      searchQuery = searchQuery.eq('location', filters.location)
    }

    const { data, error, count } = await searchQuery

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        programs: data,
        total: count,
        limit,
        offset
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})