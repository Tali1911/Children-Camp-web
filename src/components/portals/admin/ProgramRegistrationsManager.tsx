import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Eye, CheckCircle, XCircle, Search } from 'lucide-react';
import {
  kenyanExperiencesService,
  homeschoolingService,
  schoolExperienceService,
  teamBuildingService,
  partiesService
} from '@/services/programRegistrationService';

export const ProgramRegistrationsManager = () => {
  const [activeTab, setActiveTab] = useState('kenyan-experiences');
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadRegistrations();
  }, [activeTab, statusFilter]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      let data = [];
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;

      switch (activeTab) {
        case 'kenyan-experiences':
          data = await kenyanExperiencesService.getAll(filters);
          break;
        case 'homeschooling':
          data = await homeschoolingService.getAll(filters);
          break;
        case 'school-experience':
          data = await schoolExperienceService.getAll(filters);
          break;
        case 'team-building':
          data = await teamBuildingService.getAll(filters);
          break;
        case 'parties':
          data = await partiesService.getAll(filters);
          break;
      }

      setRegistrations(data || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, service: any) => {
    try {
      await service.update(id, { status });
      toast.success('Status updated successfully');
      loadRegistrations();
      setSelectedRegistration(null);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async (id: string, note: string, service: any) => {
    try {
      await service.update(id, { admin_notes: note });
      toast.success('Note added successfully');
      loadRegistrations();
      setSelectedRegistration(null);
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const getService = () => {
    switch (activeTab) {
      case 'kenyan-experiences':
        return kenyanExperiencesService;
      case 'homeschooling':
        return homeschoolingService;
      case 'school-experience':
        return schoolExperienceService;
      case 'team-building':
        return teamBuildingService;
      case 'parties':
        return partiesService;
      default:
        return kenyanExperiencesService;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.phone?.includes(searchTerm) ||
    (reg.parent_name && reg.parent_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (reg.parent_leader && reg.parent_leader.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (reg.school_name && reg.school_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const RegistrationDetails = ({ registration }: { registration: any }) => {
    const [note, setNote] = useState(registration.admin_notes || '');

    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Contact Information</h4>
          <p><strong>Email:</strong> {registration.email}</p>
          <p><strong>Phone:</strong> {registration.phone}</p>
        </div>

        {registration.participants && (
          <div>
            <h4 className="font-semibold mb-2">Participants</h4>
            <pre className="bg-muted p-2 rounded text-sm overflow-auto">
              {JSON.stringify(registration.participants, null, 2)}
            </pre>
          </div>
        )}

        {registration.children && (
          <div>
            <h4 className="font-semibold mb-2">Children</h4>
            <pre className="bg-muted p-2 rounded text-sm overflow-auto">
              {JSON.stringify(registration.children, null, 2)}
            </pre>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">Status</h4>
          <div className="flex gap-2">
            {getStatusBadge(registration.status)}
            <Select
              defaultValue={registration.status}
              onValueChange={(value) => handleUpdateStatus(registration.id, value, getService())}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="admin-note">Admin Notes</Label>
          <Textarea
            id="admin-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add notes about this registration..."
            rows={3}
            className="mt-2"
          />
          <Button
            onClick={() => handleAddNote(registration.id, note, getService())}
            className="mt-2"
            size="sm"
          >
            Save Note
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Registered: {new Date(registration.created_at).toLocaleString()}</p>
          {registration.updated_at !== registration.created_at && (
            <p>Last Updated: {new Date(registration.updated_at).toLocaleString()}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Program Registrations</h2>
        <p className="text-muted-foreground">
          Manage registrations from Experiences, Schools, and Group Activities programs
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by email, phone, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="kenyan-experiences">Experiences</TabsTrigger>
          <TabsTrigger value="homeschooling">Homeschooling</TabsTrigger>
          <TabsTrigger value="school-experience">Schools</TabsTrigger>
          <TabsTrigger value="team-building">Team Building</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
        </TabsList>

        {['kenyan-experiences', 'homeschooling', 'school-experience', 'team-building', 'parties'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {loading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading registrations...</p>
              </Card>
            ) : filteredRegistrations.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No registrations found</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredRegistrations.map((reg) => (
                  <Card key={reg.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {reg.parent_name || reg.parent_leader || reg.school_name || reg.email}
                          </h3>
                          {getStatusBadge(reg.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{reg.email} • {reg.phone}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Registered: {new Date(reg.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRegistration(reg)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && <RegistrationDetails registration={selectedRegistration} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};
