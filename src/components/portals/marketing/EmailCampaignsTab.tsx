import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Send, Users, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { emailManagementService, EmailSegment } from '@/services/emailManagementService';

interface CampaignRow {
  id: string;
  name: string;
  subject: string | null;
  status: string;
  recipient_count: number | null;
  sent_count: number | null;
  failed_count: number | null;
  sent_at: string | null;
  created_at: string;
}

const EmailCampaignsTab: React.FC = () => {
  const { toast } = useToast();
  const [segments, setSegments] = useState<EmailSegment[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);

  // Compose form
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [fromName, setFromName] = useState('Amuse Bush Camp');
  const [segmentId, setSegmentId] = useState<string>('');
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [resolving, setResolving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [segs, camps] = await Promise.all([
      emailManagementService.getEmailSegments(),
      emailManagementService.getCampaigns(),
    ]);
    setSegments(segs);
    setCampaigns(camps as CampaignRow[]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // Resolve recipients whenever segment changes
  useEffect(() => {
    if (!segmentId) { setRecipientCount(null); return; }
    setResolving(true);
    emailManagementService.resolveSegmentRecipients(segmentId)
      .then(r => setRecipientCount(r.length))
      .finally(() => setResolving(false));
  }, [segmentId]);

  const resetCompose = () => {
    setName(''); setSubject(''); setBodyHtml(''); setFromName('Amuse Bush Camp');
    setSegmentId(''); setRecipientCount(null); setTestEmail('');
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Campaign name is required';
    if (!subject.trim()) return 'Subject is required';
    if (!bodyHtml.trim()) return 'Email body is required';
    if (!segmentId) return 'Pick an audience segment';
    return null;
  };

  const handleSendTest = async () => {
    const err = validate();
    if (err) { toast({ title: 'Missing info', description: err, variant: 'destructive' }); return; }
    if (!testEmail.trim()) {
      toast({ title: 'Test email required', description: 'Enter an email address for the test send', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const created = await emailManagementService.createCampaign({
        name: `${name} (test)`, subject, body_html: bodyHtml, from_name: fromName,
        segment_id: segmentId, recipient_count: 1,
      });
      if (!created) throw new Error('Could not create campaign');
      const result = await emailManagementService.sendCampaign(created.id, testEmail.trim());
      if (!result.success) throw new Error(result.error || 'Send failed');
      toast({ title: 'Test sent', description: `Test email sent to ${testEmail}` });
    } catch (e: any) {
      toast({ title: 'Test failed', description: e?.message || 'Could not send test', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleSendBlast = async () => {
    const err = validate();
    if (err) { toast({ title: 'Missing info', description: err, variant: 'destructive' }); return; }
    if (!recipientCount || recipientCount === 0) {
      toast({ title: 'No recipients', description: 'This segment has no eligible recipients', variant: 'destructive' });
      return;
    }
    if (!confirm(`Send "${subject}" to ${recipientCount} recipients?`)) return;
    setSending(true);
    try {
      const created = await emailManagementService.createCampaign({
        name, subject, body_html: bodyHtml, from_name: fromName,
        segment_id: segmentId, recipient_count: recipientCount,
      });
      if (!created) throw new Error('Could not create campaign');
      const result = await emailManagementService.sendCampaign(created.id);
      if (!result.success) throw new Error(result.error || 'Send failed');
      toast({ title: 'Blast sent', description: `Sent ${result.sent} / failed ${result.failed}` });
      setComposeOpen(false);
      resetCompose();
      loadAll();
    } catch (e: any) {
      toast({ title: 'Send failed', description: e?.message || 'Could not send', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      completed: 'default', active: 'default', planning: 'secondary', paused: 'outline',
    };
    return <Badge variant={map[s] || 'outline'}>{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Campaigns</h2>
          <p className="text-muted-foreground">Compose and send marketing email blasts to saved segments</p>
        </div>
        <Dialog open={composeOpen} onOpenChange={(o) => { setComposeOpen(o); if (!o) resetCompose(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Campaign</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Compose Email Blast</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cname">Campaign Name *</Label>
                  <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Easter Camp 2026 Launch" />
                </div>
                <div>
                  <Label htmlFor="from">From Name</Label>
                  <Input id="from" value={fromName} onChange={(e) => setFromName(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="subj">Subject *</Label>
                <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Easter Camp registration is open!" />
              </div>
              <div>
                <Label htmlFor="seg">Audience Segment *</Label>
                <Select value={segmentId} onValueChange={setSegmentId}>
                  <SelectTrigger><SelectValue placeholder="Select a segment" /></SelectTrigger>
                  <SelectContent>
                    {segments.length === 0 && <div className="px-2 py-3 text-sm text-muted-foreground">No segments yet — create one in the Email Segments tab</div>}
                    {segments.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {segmentId && (
                  <p className="text-sm mt-2 flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {resolving ? 'Resolving recipients…' : (
                      <span><strong className="text-foreground">{recipientCount ?? 0}</strong> eligible recipients (excluding suppressed/unsubscribed)</span>
                    )}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="body">Email Body (HTML) *</Label>
                <Textarea id="body" value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} rows={10}
                  placeholder="<h1>Hello!</h1><p>Your message here…</p>" className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground mt-1">An unsubscribe footer is appended automatically.</p>
              </div>
              <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                <Label className="text-sm">Send a test first</Label>
                <div className="flex gap-2">
                  <Input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="your@email.com" />
                  <Button variant="outline" onClick={handleSendTest} disabled={sending}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Test'}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
                <Button onClick={handleSendBlast} disabled={sending || !recipientCount}>
                  {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Send to {recipientCount ?? 0}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading…</div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No campaigns sent yet</p>
            <p className="text-sm text-muted-foreground">Create your first email blast above</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(c => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                  {statusBadge(c.status)}
                </div>
                {c.subject && <p className="text-sm text-muted-foreground">{c.subject}</p>}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold">{c.recipient_count ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Recipients</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{c.sent_count ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Sent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">{c.failed_count ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {c.sent_at ? `Sent ${new Date(c.sent_at).toLocaleString()}` : `Created ${new Date(c.created_at).toLocaleString()}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailCampaignsTab;
