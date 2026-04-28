// send-marketing-campaign
// Sends a marketing email blast to all recipients of a saved segment, batched
// through Resend. Server-side suppression checks, per-recipient delivery
// logging into email_deliveries (with campaign_id), and aggregate counters
// updated on the campaigns row.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "Amuse Bush Camp <hello@amusekenya.co.ke>";
const APP_URL = "https://amusekenya.co.ke";

interface SendBody {
  campaignId: string;
  testEmail?: string | null;
}

function buildHtml(bodyHtml: string, unsubToken: string): string {
  const unsubUrl = `${APP_URL}/unsubscribe/${unsubToken}`;
  return `<!doctype html>
<html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  ${bodyHtml}
  <hr style="margin-top:32px;border:none;border-top:1px solid #eee" />
  <p style="font-size:12px;color:#888;text-align:center;">
    You received this because you registered with Amuse Bush Camp.<br/>
    <a href="${unsubUrl}" style="color:#888;">Unsubscribe</a>
  </p>
</body></html>`;
}

async function getOrCreateUnsubToken(supabase: any, email: string): Promise<string> {
  const { data: existing } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", email)
    .maybeSingle();
  if (existing?.token) return existing.token;
  const token = crypto.randomUUID().replace(/-/g, "");
  await supabase.from("email_unsubscribe_tokens").insert({ token, email });
  return token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      return new Response(JSON.stringify({ success: false, error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Auth: require admin/marketing/ceo
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    const allowed = (roles || []).some((r: any) => ["admin", "marketing", "ceo"].includes(r.role));
    if (!allowed) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { campaignId, testEmail }: SendBody = await req.json();
    if (!campaignId) {
      return new Response(JSON.stringify({ success: false, error: "campaignId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Load campaign
    const { data: campaign, error: cErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();
    if (cErr || !campaign) {
      return new Response(JSON.stringify({ success: false, error: "Campaign not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build recipient list
    let recipients: { email: string; lead_id?: string }[] = [];
    if (testEmail) {
      recipients = [{ email: testEmail.trim().toLowerCase() }];
    } else {
      // Resolve segment server-side
      const { data: segment } = await supabase
        .from("email_segments")
        .select("filters")
        .eq("id", campaign.segment_id)
        .single();
      const f = segment?.filters || {};

      let q = supabase.from("leads").select("id, email, email_subscribed").not("email", "is", null);
      if (f.program_type) q = q.eq("program_type", f.program_type);
      if (f.status) q = q.eq("status", f.status);
      const { data: leads } = await q;

      const { data: suppressions } = await supabase.from("email_suppressions").select("email");
      const suppressedSet = new Set((suppressions || []).map((s: any) => (s.email || "").toLowerCase()));

      const seen = new Set<string>();
      for (const l of (leads || []) as any[]) {
        const e = (l.email || "").trim().toLowerCase();
        if (!e || l.email_subscribed === false || suppressedSet.has(e) || seen.has(e)) continue;
        seen.add(e);
        recipients.push({ email: e, lead_id: l.id });
      }
    }

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "No eligible recipients" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Mark active
    await supabase.from("campaigns").update({ status: "active" }).eq("id", campaignId);

    const resend = new Resend(resendKey);
    const fromName = campaign.from_name || "Amuse Bush Camp";
    const fromAddr = `${fromName} <hello@amusekenya.co.ke>`;
    const subject = campaign.subject || campaign.name;

    let sent = 0;
    let failed = 0;
    const BATCH = 25;
    for (let i = 0; i < recipients.length; i += BATCH) {
      const batch = recipients.slice(i, i + BATCH);
      await Promise.all(batch.map(async (r) => {
        try {
          const token = await getOrCreateUnsubToken(supabase, r.email);
          const html = buildHtml(campaign.body_html || "", token);
          const result = await resend.emails.send({
            from: fromAddr,
            to: r.email,
            subject,
            html,
          });
          const messageId = (result as any)?.data?.id || (result as any)?.id || null;

          await supabase.from("email_deliveries").insert({
            email: r.email,
            message_id: messageId,
            recipient_type: r.lead_id ? "lead" : null,
            recipient_id: r.lead_id || null,
            email_type: "marketing",
            subject,
            status: "sent",
            campaign_id: testEmail ? null : campaignId,
          });
          sent++;
        } catch (err: any) {
          console.error("send failed", r.email, err?.message);
          failed++;
          await supabase.from("email_deliveries").insert({
            email: r.email,
            email_type: "marketing",
            subject,
            status: "bounced",
            campaign_id: testEmail ? null : campaignId,
            postmark_data: { error: err?.message || "send failed" },
          });
        }
      }));
      // small delay between batches
      if (i + BATCH < recipients.length) await new Promise(res => setTimeout(res, 250));
    }

    if (!testEmail) {
      await supabase.from("campaigns").update({
        status: "completed",
        sent_count: sent,
        failed_count: failed,
        sent_at: new Date().toISOString(),
      }).eq("id", campaignId);
    }

    return new Response(JSON.stringify({ success: true, sent, failed, total: recipients.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("send-marketing-campaign error", e);
    return new Response(JSON.stringify({ success: false, error: e?.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
