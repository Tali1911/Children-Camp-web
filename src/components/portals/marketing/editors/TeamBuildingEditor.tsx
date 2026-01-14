import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { cmsService } from '@/services/cmsService';

interface Package {
  id: string;
  title: string;
  description: string;
  features: string[];
  image?: string;
}

interface SampleFlowItem {
  title: string;
  description: string;
}

interface TeamBuildingConfig {
  title: string;
  subtitle: string;
  description: string;
  featuredImage: string;
  packages: Package[];
  sampleFlow: SampleFlowItem[];
  formTitle: string;
  ctaText: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

interface TeamBuildingEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const defaultConfig: TeamBuildingConfig = {
  title: 'Team Building',
  subtitle: '(All Ages)',
  description: 'Create safe, fun, memory-filled experiences with measurable outcomes. Each package is 90% fun + 10% reflection, focusing on team communication and problem-solving.',
  featuredImage: '',
  packages: [
    {
      id: 'adventure',
      title: 'Adventure Party',
      description: 'Arrival Icebreaker • Obstacle Challenge • Water Game • Treasure Hunt • Cake & Awards • Closing Circle',
      features: ['Team Communication', 'Problem-Solving', '90% Fun + 10% Reflection']
    },
    {
      id: 'bushcraft',
      title: 'Bushcraft Bash',
      description: 'Fire-making challenges, shelter building, navigation skills, and outdoor cooking activities.',
      features: ['Survival Skills', 'Leadership', 'Outdoor Confidence']
    },
    {
      id: 'nature-carnival',
      title: 'Nature Carnival',
      description: 'Nature games, eco-friendly activities, wildlife exploration, and environmental challenges.',
      features: ['Environmental Awareness', 'Teamwork', 'Creative Problem-Solving']
    },
    {
      id: 'family-corporate',
      title: 'Family/Corporate Build',
      description: 'Customized team building experiences for families and corporate groups with measurable outcomes.',
      features: ['Custom Activities', 'Team Bonding', 'Measurable Results']
    }
  ],
  sampleFlow: [
    { title: 'Arrival Icebreaker', description: 'Welcome activities and team formation' },
    { title: 'Obstacle Challenge', description: 'Physical and mental challenges' },
    { title: 'Water Game', description: 'Fun water-based team activities' },
    { title: 'Treasure Hunt', description: 'Problem-solving adventure' },
    { title: 'Cake & Awards', description: 'Celebration and recognition' },
    { title: 'Closing Circle', description: 'Reflection and key takeaways' }
  ],
  formTitle: 'Book Your Experience',
  ctaText: 'Book Experience',
  seo: {
    metaTitle: 'Team Building Programs | Amuse Kenya Corporate Events',
    metaDescription: 'Strengthen your team with nature-based team building activities at Karura Forest. Customized corporate programs focusing on collaboration, communication, and leadership development.',
    keywords: 'team building Kenya, corporate events, team activities, leadership training, corporate retreats Nairobi'
  }
};

export const TeamBuildingEditor: React.FC<TeamBuildingEditorProps> = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<TeamBuildingConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const content = await cmsService.getContentBySlug('team-building-page', 'camp_page');
      if (content?.metadata) {
        setConfig({ ...defaultConfig, ...content.metadata });
      }
    } catch (error) {
      console.error('Error loading team building config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const existingContent = await cmsService.getContentBySlug('team-building-page', 'camp_page');
      
      const contentData = {
        title: config.title,
        slug: 'team-building-page',
        content: config.description,
        content_type: 'camp_page' as const,
        status: 'published' as const,
        metadata: config
      };

      if (existingContent) {
        await cmsService.updateContent(existingContent.id, contentData);
      } else {
        await cmsService.createContent(contentData);
      }

      toast.success('Team Building page updated successfully');
      onSave();
    } catch (error) {
      console.error('Error saving team building config:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePackage = (index: number, field: keyof Package, value: any) => {
    const updated = [...config.packages];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, packages: updated });
  };

  const updatePackageFeature = (pkgIndex: number, featIndex: number, value: string) => {
    const updated = [...config.packages];
    const features = [...updated[pkgIndex].features];
    features[featIndex] = value;
    updated[pkgIndex] = { ...updated[pkgIndex], features };
    setConfig({ ...config, packages: updated });
  };

  const addPackageFeature = (pkgIndex: number) => {
    const updated = [...config.packages];
    updated[pkgIndex] = { ...updated[pkgIndex], features: [...updated[pkgIndex].features, ''] };
    setConfig({ ...config, packages: updated });
  };

  const removePackageFeature = (pkgIndex: number, featIndex: number) => {
    const updated = [...config.packages];
    const features = updated[pkgIndex].features.filter((_, i) => i !== featIndex);
    updated[pkgIndex] = { ...updated[pkgIndex], features };
    setConfig({ ...config, packages: updated });
  };

  const addPackage = () => {
    const newPackage: Package = {
      id: `package-${Date.now()}`,
      title: 'New Package',
      description: 'Package description',
      features: ['Feature 1']
    };
    setConfig({ ...config, packages: [...config.packages, newPackage] });
  };

  const removePackage = (index: number) => {
    const updated = config.packages.filter((_, i) => i !== index);
    setConfig({ ...config, packages: updated });
  };

  const updateSampleFlowItem = (index: number, field: keyof SampleFlowItem, value: string) => {
    const updated = [...config.sampleFlow];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, sampleFlow: updated });
  };

  const addSampleFlowItem = () => {
    setConfig({ 
      ...config, 
      sampleFlow: [...config.sampleFlow, { title: '', description: '' }] 
    });
  };

  const removeSampleFlowItem = (index: number) => {
    const updated = config.sampleFlow.filter((_, i) => i !== index);
    setConfig({ ...config, sampleFlow: updated });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team Building Page</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">Loading...</div>
        ) : (
          <Tabs defaultValue="content" className="space-y-4">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="flow">Sample Flow</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Title</Label>
                  <Input
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={config.subtitle}
                    onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Featured Image URL</Label>
                <Input
                  value={config.featuredImage}
                  onChange={(e) => setConfig({ ...config, featuredImage: e.target.value })}
                  placeholder="https://example.com/image.jpg or leave empty for default"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Form Title</Label>
                  <Input
                    value={config.formTitle}
                    onChange={(e) => setConfig({ ...config, formTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Button Text</Label>
                  <Input
                    value={config.ctaText}
                    onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="packages" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Available Packages</h3>
                <Button onClick={addPackage} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Package
                </Button>
              </div>

              <div className="space-y-4">
                {config.packages.map((pkg, pkgIndex) => (
                  <Card key={pkg.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Input
                            value={pkg.title}
                            onChange={(e) => updatePackage(pkgIndex, 'title', e.target.value)}
                            className="font-semibold w-48"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removePackage(pkgIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={pkg.description}
                          onChange={(e) => updatePackage(pkgIndex, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Image URL (optional)</Label>
                        <Input
                          value={pkg.image || ''}
                          onChange={(e) => updatePackage(pkgIndex, 'image', e.target.value)}
                          placeholder="https://example.com/package-image.jpg"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Features</Label>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => addPackageFeature(pkgIndex)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {pkg.features.map((feature, featIndex) => (
                            <div key={featIndex} className="flex gap-2">
                              <Input
                                value={feature}
                                onChange={(e) => updatePackageFeature(pkgIndex, featIndex, e.target.value)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePackageFeature(pkgIndex, featIndex)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="flow" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sample Adventure Party Flow</h3>
                <Button onClick={addSampleFlowItem} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Step
                </Button>
              </div>

              <div className="space-y-3">
                {config.sampleFlow.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start border rounded-lg p-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Step Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => updateSampleFlowItem(index, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateSampleFlowItem(index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSampleFlowItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={config.seo.metaTitle}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    seo: { ...config.seo, metaTitle: e.target.value } 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={config.seo.metaDescription}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    seo: { ...config.seo, metaDescription: e.target.value } 
                  })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={config.seo.keywords}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    seo: { ...config.seo, keywords: e.target.value } 
                  })}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
