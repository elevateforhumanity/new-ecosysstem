import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, data, source = 'api' } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let result

    switch (action) {
      case 'sync_programs':
        // Bulk sync program data from external sources
        if (!Array.isArray(data)) {
          throw new Error('Programs data must be an array')
        }

        // Process programs in batches of 100
        const batchSize = 100
        const batches = []
        for (let i = 0; i < data.length; i += batchSize) {
          batches.push(data.slice(i, i + batchSize))
        }

        let totalInserted = 0
        let totalUpdated = 0

        for (const batch of batches) {
          const { data: insertResult, error: insertError } = await supabase
            .from('programs')
            .upsert(batch, { 
              onConflict: 'external_id',
              ignoreDuplicates: false 
            })
            .select('id')

          if (insertError) {
            console.error('Batch insert error:', insertError)
            continue
          }

          totalInserted += insertResult?.length || 0
        }

        result = {
          action: 'sync_programs',
          source,
          total_processed: data.length,
          total_inserted: totalInserted,
          batches_processed: batches.length
        }
        break

      case 'update_search_index':
        // Update search vectors and indexes
        const { error: searchError } = await supabase.rpc('refresh_search_index')
        
        if (searchError) throw searchError

        result = {
          action: 'update_search_index',
          status: 'completed',
          timestamp: new Date().toISOString()
        }
        break

      case 'cleanup_old_data':
        // Clean up old or invalid records
        const cutoffDate = new Date()
        cutoffDate.setDays(cutoffDate.getDate() - 90) // 90 days ago

        const { data: cleanupResult, error: cleanupError } = await supabase
          .from('programs')
          .delete()
          .lt('updated_at', cutoffDate.toISOString())
          .eq('status', 'draft')

        if (cleanupError) throw cleanupError

        result = {
          action: 'cleanup_old_data',
          records_deleted: cleanupResult?.length || 0,
          cutoff_date: cutoffDate.toISOString()
        }
        break

      case 'generate_analytics':
        // Generate analytics data
        const { data: analytics, error: analyticsError } = await supabase.rpc('generate_program_analytics')
        
        if (analyticsError) throw analyticsError

        result = {
          action: 'generate_analytics',
          data: analytics,
          generated_at: new Date().toISOString()
        }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Data sync error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})