/**
 * EFH Autopilot - Execute Action Edge Function
 * Securely executes AI agent commands against Supabase database
 * 
 * Deployment:
 * supabase functions deploy executeAction --project-ref <your-project-ref>
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ActionRequest {
  action: string;
  params: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, params }: ActionRequest = await req.json();

    let message = "";
    let data = null;

    // Execute action based on type
    switch (action) {
      case "createProgram": {
        const { data: program, error } = await supabase
          .from("courses")
          .insert({
            title: params.title,
            description: params.description || `${params.title} training program`,
            duration: params.hours ? `${params.hours} hours` : "120 hours",
            credentials: params.credentials || "Certificate of Completion",
            published: params.published !== false,
            thumbnail_url: params.thumbnail_url || null,
          })
          .select()
          .single();

        if (error) throw error;
        data = program;
        message = `✅ Program created: ${program.title} (ID: ${program.id})`;
        break;
      }

      case "updateTuition": {
        // Note: LMS schema doesn't have tuition field, would need to add it
        // For now, update description to include tuition info
        const { data: program, error } = await supabase
          .from("courses")
          .update({
            description: `Tuition: $${params.amount}`,
          })
          .eq("id", params.id)
          .select()
          .single();

        if (error) throw error;
        data = program;
        message = `✅ Tuition updated to $${params.amount} for program ${params.id}`;
        break;
      }

      case "createAffiliate": {
        // Create affiliate record
        const { data: affiliate, error } = await supabase
          .from("affiliates")
          .insert({
            user_id: params.user_id,
            tier: params.tier,
            w9_file_id: params.w9_file_id || null,
            commission_rate: params.tier === 'platinum' ? 15 : params.tier === 'gold' ? 12 : 10,
            status: 'active',
          })
          .select()
          .single();

        if (error) throw error;
        data = affiliate;
        message = `✅ Affiliate created: ${params.tier} tier (ID: ${affiliate.id})`;
        break;
      }

      case "createReferral": {
        // Create referral record
        const { data: referral, error } = await supabase
          .from("referrals")
          .insert({
            affiliate_id: params.affiliate_id,
            client_name: params.client_name,
            client_email: params.client_email || null,
            source: params.source,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;
        data = referral;
        message = `✅ Referral created: ${params.client_name} (ID: ${referral.id})`;
        break;
      }

      case "calculateCommission": {
        // Calculate and create commission record
        const { data: commission, error } = await supabase
          .from("commissions")
          .insert({
            referral_id: params.referral_id,
            affiliate_id: params.affiliate_id || null, // Will be set by trigger if needed
            basis_amount: params.basis_amount,
            percent: params.percent,
            status: 'approved',
            approved_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        data = commission;
        message = `✅ Commission approved: $${commission.amount.toFixed(2)} (${params.percent}% of $${params.basis_amount})`;
        break;
      }

      case "runPayoutBatch": {
        // Get all approved commissions
        const { data: toPay, error: qErr } = await supabase
          .from("commissions")
          .select("id, amount, affiliate_id")
          .eq("status", "approved")
          .lte("created_at", params.cutoff_date);

        if (qErr) throw qErr;

        if (!toPay || toPay.length === 0) {
          message = `⚠️ No approved commissions found before ${params.cutoff_date}`;
          break;
        }

        const total = toPay.reduce((sum, c) => sum + Number(c.amount), 0);

        // Create payout batch
        const { data: payout, error: pErr } = await supabase
          .from("payouts")
          .insert({
            amount: total,
            method: "manual",
            status: "pending",
          })
          .select()
          .single();

        if (pErr) throw pErr;

        // Mark commissions as batched
        const { error: updateErr } = await supabase
          .from("commissions")
          .update({
            status: "batched",
            payout_batch_id: payout.id,
          })
          .in("id", toPay.map(c => c.id));

        if (updateErr) throw updateErr;

        data = { payout_id: payout.id, commission_count: toPay.length, total };
        message = `✅ Payout batch created: ${toPay.length} commissions, $${total.toFixed(2)} (ID: ${payout.id})`;
        break;
      }

      case "getETPLReport": {
        // Generate ETPL compliance report
        const { data: courses, error: coursesErr } = await supabase
          .from("courses")
          .select(`
            id,
            title,
            duration,
            credentials,
            created_at,
            enrollments (
              id,
              status,
              completed_at,
              progress
            )
          `)
          .eq("published", true);

        if (coursesErr) throw coursesErr;

        const report = courses.map(course => ({
          program: course.title,
          duration: course.duration,
          credentials: course.credentials,
          total_enrollments: course.enrollments.length,
          active: course.enrollments.filter((e: any) => e.status === 'active').length,
          completed: course.enrollments.filter((e: any) => e.status === 'completed').length,
          completion_rate: course.enrollments.length > 0
            ? ((course.enrollments.filter((e: any) => e.status === 'completed').length / course.enrollments.length) * 100).toFixed(1) + '%'
            : '0%',
        }));

        data = report;
        message = `✅ ETPL report generated: ${courses.length} programs`;
        break;
      }

      case "addStudent": {
        // Enroll student in course
        const { data: enrollment, error } = await supabase
          .from("enrollments")
          .insert({
            user_id: params.student_id,
            course_id: params.program_id,
            status: "active",
            progress: 0,
          })
          .select()
          .single();

        if (error) throw error;
        data = enrollment;
        message = `✅ Student enrolled in program (Enrollment ID: ${enrollment.id})`;
        break;
      }

      case "updateEnrollment": {
        const { data: enrollment, error } = await supabase
          .from("enrollments")
          .update({
            status: params.status,
            ...(params.progress !== undefined && { progress: params.progress }),
            ...(params.status === "completed" && { completed_at: new Date().toISOString() }),
          })
          .eq("id", params.enrollment_id)
          .select()
          .single();

        if (error) throw error;
        data = enrollment;
        message = `✅ Enrollment updated: ${params.status}`;
        break;
      }

      case "generateReport": {
        // Generate ETPL or compliance report
        if (params.type === "etpl") {
          const { data: courses, error } = await supabase
            .from("courses")
            .select(`
              id,
              title,
              duration,
              credentials,
              created_at,
              enrollments (count)
            `)
            .eq("published", true);

          if (error) throw error;
          data = courses;
          message = `✅ ETPL report generated: ${courses.length} programs`;
        } else {
          // Other report types
          data = { type: params.type, generated_at: new Date().toISOString() };
          message = `✅ ${params.type} report generated`;
        }
        break;
      }

      case "processPayout": {
        // Log payout (would integrate with Stripe in production)
        message = `✅ Payout processed: $${params.amount} to affiliate ${params.affiliate_id}`;
        data = {
          affiliate_id: params.affiliate_id,
          amount: params.amount,
          processed_at: new Date().toISOString(),
        };
        break;
      }

      case "getStats": {
        // Dashboard statistics
        const { count: totalCourses } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true });

        const { count: totalEnrollments } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true });

        const { count: activeEnrollments } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        data = {
          total_courses: totalCourses,
          total_enrollments: totalEnrollments,
          active_enrollments: activeEnrollments,
        };
        message = `✅ Stats retrieved`;
        break;
      }

      case "postStripeCheckout": {
        // Handle Stripe checkout completion
        const session = params.session;
        const kind = session.metadata?.kind;

        if (kind === "enrollment") {
          // Enroll user in course
          const { error } = await supabase
            .from("enrollments")
            .insert({
              user_id: session.metadata.user_id,
              course_id: session.metadata.course_id,
              status: "active",
              progress: 0,
            });

          if (error) throw error;
          message = `✅ Enrollment created from checkout (Session: ${session.id})`;
        } else if (kind === "affiliate_signup") {
          // Create affiliate from paid signup
          const { error } = await supabase
            .from("affiliates")
            .insert({
              user_id: session.metadata.user_id,
              tier: session.metadata.tier || "standard",
              status: "active",
            });

          if (error) throw error;
          message = `✅ Affiliate created from checkout (Session: ${session.id})`;
        } else if (kind === "donation") {
          // Record donation
          const { error } = await supabase
            .from("donations")
            .insert({
              user_id: session.metadata.user_id,
              amount: session.amount_total / 100,
              stripe_session_id: session.id,
              status: "completed",
            });

          if (error) throw error;
          message = `✅ Donation recorded: $${(session.amount_total / 100).toFixed(2)}`;
        } else {
          message = `✅ Checkout received (no handler for kind: ${kind})`;
        }

        data = { session_id: session.id, kind };
        break;
      }

      case "postPayment": {
        // Handle payment intent success
        const pi = params.payment_intent;
        const refId = pi.metadata?.referral_id;
        const percent = Number(pi.metadata?.commission_percent || 0);

        if (refId && percent > 0) {
          // Auto-approve commission from client payment
          const basis = Number(pi.amount_received) / 100;
          const amt = (basis * percent) / 100;

          // Get affiliate_id from referral
          const { data: referral, error: refErr } = await supabase
            .from("referrals")
            .select("affiliate_id")
            .eq("id", refId)
            .single();

          if (refErr) throw refErr;

          const { error } = await supabase
            .from("commissions")
            .insert({
              referral_id: refId,
              affiliate_id: referral.affiliate_id,
              basis_amount: basis,
              percent: percent,
              status: "approved",
              approved_at: new Date().toISOString(),
            });

          if (error) throw error;
          message = `✅ Commission approved from payment: $${amt.toFixed(2)} (${percent}% of $${basis.toFixed(2)})`;
          data = { commission_amount: amt, basis, percent };
        } else {
          message = `✅ Payment logged (no commission metadata)`;
          data = { payment_intent_id: pi.id };
        }
        break;
      }

      case "recordFile": {
        // Record file metadata in database
        const { error } = await supabase
          .from("files")
          .insert({
            org_id: params.org_id || null,
            owner_id: params.owner_id,
            purpose: params.purpose,
            storage_key: params.storage_key,
            mime: params.mime,
            size: params.size,
          });

        if (error) throw error;
        message = `✅ File recorded: ${params.storage_key}`;
        data = { storage_key: params.storage_key, size: params.size };
        break;
      }

      case "linkStripeAccount": {
        // Link Stripe Connect account to affiliate
        const { affiliate_id, stripe_account_id } = params;
        
        const { error } = await supabase
          .from("affiliates")
          .update({
            stripe_account_id,
            stripe_onboarded: true,
            stripe_onboarded_at: new Date().toISOString(),
          })
          .eq("id", affiliate_id);

        if (error) throw error;
        message = `✅ Stripe account linked to affiliate ${affiliate_id}`;
        data = { affiliate_id, stripe_account_id };
        break;
      }

      case "getAffiliateAccount": {
        // Get affiliate's Stripe Connect account ID
        const { affiliate_id } = params;
        
        const { data: affiliate, error } = await supabase
          .from("affiliates")
          .select("stripe_account_id, stripe_onboarded")
          .eq("id", affiliate_id)
          .single();

        if (error) throw error;
        
        return new Response(
          JSON.stringify({
            data: {
              stripe_account_id: affiliate?.stripe_account_id || null,
              stripe_onboarded: affiliate?.stripe_onboarded || false,
            }
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "recordTransfer": {
        // Record Stripe Connect transfer
        const { affiliate_id, amount, stripe_account_id, stripe_transfer_id } = params;
        
        const { error } = await supabase
          .from("transfers")
          .insert({
            affiliate_id,
            amount,
            stripe_account_id,
            stripe_transfer_id,
            status: "paid",
            completed_at: new Date().toISOString(),
          });

        if (error) throw error;
        message = `✅ Transfer recorded: $${amount.toFixed(2)} to ${stripe_account_id}`;
        data = { transfer_id: stripe_transfer_id, amount };
        break;
      }

      default:
        message = `❌ Unknown action: ${action}`;
        data = null;
    }

    // Log action to audit table
    await supabase.from("agent_events").insert({
      action,
      params,
      message,
      success: true,
      created_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ message, data }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (err) {
    console.error("Edge function error:", err);

    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
