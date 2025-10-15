export async function logAgentEvent(supabase: any, params: any) {
  const { source, from, subject, plan, result, metadata } = params;
  
  const { data, error } = await supabase
    .from('agent_events')
    .insert({
      event_type: 'email_ingest',
      action_name: plan?.action || 'unknown',
      parameters: {
        source,
        from,
        subject,
        plan,
        metadata,
      },
      result: result,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    success: true,
    eventId: data.id,
    message: 'Event logged',
  };
}
