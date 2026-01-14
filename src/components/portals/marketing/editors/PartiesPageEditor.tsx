import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cmsService, ContentItem } from '@/services/cmsService';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PartiesPageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
}

interface PartiesConfig {
  title: string;
  subtitle: string;
  description: string;
  featuredImage: string;
  details: {
    partyTypes: string;
    groupSize: string;
    duration: string;
    location: string;
  };
  whatsIncluded: string[];
  addOns: Array<{ icon: string; text: string }>;
  ctaText: string;
  ctaLink: string;
  metaTitle: string;
  metaDescription: string;
}

const defaultConfig: PartiesConfig = {
  title: 'Parties & Celebrations',
  subtitle: 'Customised parties and team-building events with a focus on fun and tangible outcomes.',
  description: 'Make your special occasion extraordinary! Our outdoor party packages combine nature, adventure, and celebration for birthday parties, family gatherings, and group events.',
  featuredImage: '',
  details: {
    partyTypes: 'Birthdays, anniversaries, reunions',
    groupSize: '10-50 guests',
    duration: 'Half-day / Full-day / Overnight',
    location: 'Our center or your choice'
  },
  whatsIncluded: [
    'Customized party themes',
    'Outdoor adventure activities',
    'Party games and entertainment',
    'Dedicated party area',
    'Basic decorations and setup',
    'Professional event coordination',
    'Photography opportunities',
    'Age-appropriate activities',
    'Safety equipment and supervision',
    'Flexible catering options'
  ],
  addOns: [
    { icon: 'Cake', text: 'Custom cake and catering services' },
    { icon: 'Camera', text: 'Professional photography package' },
    { icon: 'Star', text: 'Special activity sessions (rock climbing, kayaking)' },
    { icon: 'Gift', text: 'Party favors and gift bags' }
  ],
  ctaText: 'Book Your Party',
  ctaLink: '/group-activities/parties/booking',
  metaTitle: 'Parties & Celebrations | Amuse Kenya Outdoor Events',
  metaDescription: 'Host unforgettable outdoor birthday parties and celebrations at Karura Forest.'
};

export const PartiesPageEditor: React.FC<PartiesPageEditorProps> = ({ 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [config, setConfig] = useState<PartiesConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const content = await cmsService.getContentBySlug('parties-page', 'camp_page');
      if (content) {
        setExistingId(content.id);
        const savedConfig = content.metadata?.pageConfig || {};
        setConfig({ ...defaultConfig, ...savedConfig });
      }
    } catch (error) {
      console.error('Error loading parties config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `parties-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content-images')
        .getPublicUrl(filePath);

      setConfig(prev => ({ ...prev, featuredImage: publicUrl }));
      toast({ title: 'Image uploaded successfully' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Failed to upload image', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const addIncludedItem = () => {
    setConfig(prev => ({
      ...prev,
      whatsIncluded: [...prev.whatsIncluded, '']
    }));
  };

  const updateIncludedItem = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      whatsIncluded: prev.whatsIncluded.map((item, i) => i === index ? value : item)
    }));
  };

  const removeIncludedItem = (index: number) => {
    setConfig(prev => ({
      ...prev,
      whatsIncluded: prev.whatsIncluded.filter((_, i) => i !== index)
    }));
  };

  const addAddOn = () => {
    setConfig(prev => ({
      ...prev,
      addOns: [...prev.addOns, { icon: 'Star', text: '' }]
    }));
  };

  const updateAddOn = (index: number, field: 'icon' | 'text', value: string) => {
    setConfig(prev => ({
      ...prev,
      addOns: prev.addOns.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeAddOn = (index: number) => {
    setConfig(prev => ({
      ...prev,
      addOns: prev.addOns.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const contentData = {
        slug: 'parties-page',
        content_type: 'camp_page' as const,
        title: 'Parties & Celebrations Page',
        status: 'published' as const,
        content: JSON.stringify(config),
        metadata: { pageConfig: config },
        author_id: user?.id,
        published_at: new Date().toISOString()
      };

      if (existingId) {
        await cmsService.updateContent(existingId, contentData);
      } else {
        await cmsService.createContent(contentData);
      }

      toast({ title: 'Parties page saved successfully' });
      await onSave();
    } catch (error) {
      console.error('Error saving parties config:', error);
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Parties & Celebrations Page</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Page Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Featured Image */}
              <div className="space-y-2">
                <Label>Featured Image</Label>
                {config.featuredImage ? (
                  <div className="relative">
                    <img 
                      src={config.featuredImage} 
                      alt="Featured" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setConfig({ ...config, featuredImage: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Upload Featured Image'}
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Party Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Party Types</Label>
                <Input
                  value={config.details.partyTypes}
                  onChange={(e) => setConfig({
                    ...config,
                    details: { ...config.details, partyTypes: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Group Size</Label>
                <Input
                  value={config.details.groupSize}
                  onChange={(e) => setConfig({
                    ...config,
                    details: { ...config.details, groupSize: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={config.details.duration}
                  onChange={(e) => setConfig({
                    ...config,
                    details: { ...config.details, duration: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={config.details.location}
                  onChange={(e) => setConfig({
                    ...config,
                    details: { ...config.details, location: e.target.value }
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">What's Included</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addIncludedItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.whatsIncluded.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateIncludedItem(index, e.target.value)}
                    placeholder="Enter included item"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIncludedItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Add-Ons */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Popular Add-Ons</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addAddOn}>
                <Plus className="h-4 w-4 mr-1" /> Add Add-On
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.addOns.map((addon, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Select
                    value={addon.icon}
                    onValueChange={(value) => updateAddOn(index, 'icon', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cake">Cake</SelectItem>
                      <SelectItem value="Camera">Camera</SelectItem>
                      <SelectItem value="Star">Star</SelectItem>
                      <SelectItem value="Gift">Gift</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Sparkles">Sparkles</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={addon.text}
                    onChange={(e) => updateAddOn(index, 'text', e.target.value)}
                    placeholder="Add-on description"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAddOn(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Call to Action</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                  value={config.ctaText}
                  onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Button Link</Label>
                <Input
                  value={config.ctaLink}
                  onChange={(e) => setConfig({ ...config, ctaLink: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={config.metaTitle}
                  onChange={(e) => setConfig({ ...config, metaTitle: e.target.value })}
                  maxLength={60}
                />
                <p className="text-sm text-muted-foreground">{config.metaTitle.length}/60</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={config.metaDescription}
                  onChange={(e) => setConfig({ ...config, metaDescription: e.target.value })}
                  maxLength={160}
                  rows={2}
                />
                <p className="text-sm text-muted-foreground">{config.metaDescription.length}/160</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
