import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mountain, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import adventureImage from '@/assets/adventure.jpg';
import { ConsentDialog } from './ConsentDialog';

const kenyanExperiencesSchema = z.object({
  parentLeader: z.string().min(1, 'Parent/Leader name is required').max(100),
  participantsNames: z.string().min(1, 'Participant names and age ranges are required').max(500),
  circuit: z.enum(['mt-kenya', 'coast', 'mara', 'chalbi', 'western']),
  dates: z.string().min(1, 'Dates are required'),
  transport: z.boolean().default(false),
  specialMedicalNeeds: z.string().max(500),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required').max(20),
  consent: z.boolean().refine(val => val === true, 'Consent is required')
});

type KenyanExperiencesFormData = z.infer<typeof kenyanExperiencesSchema>;

const KenyanExperiencesProgram = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<KenyanExperiencesFormData>({
    resolver: zodResolver(kenyanExperiencesSchema),
    defaultValues: {
      transport: false,
      consent: false
    }
  });

  const consent = watch('consent');

  const onSubmit = async (data: KenyanExperiencesFormData) => {
    try {
      console.log('Kenyan Experiences form submission:', data);
      toast.success('Registration submitted successfully! We will contact you soon.');
    } catch (error) {
      toast.error('Failed to submit registration. Please try again.');
    }
  };

  const circuits = [
    {
      id: 'mt-kenya',
      title: 'Mount Kenya Experiences',
      description: 'Alpine hike, bushcraft, team course',
      ageGroups: [
        { range: '9–12', focus: 'Independence' },
        { range: '13–17', focus: 'Expedition Leadership' }
      ],
      features: ['Alpine Environment', 'Bushcraft Skills', 'Team Challenges', 'Leadership Development']
    },
    {
      id: 'coast',
      title: 'Swahili Coastal Experiences',
      description: 'Marine ecology, kayaking, Swahili culture',
      ageGroups: [
        { range: '9–12', focus: 'Water Confidence' },
        { range: '13–17', focus: 'Marine Stewardship' }
      ],
      features: ['Marine Ecology', 'Cultural Immersion', 'Water Sports', 'Conservation Focus']
    },
    {
      id: 'mara',
      title: 'Mara Experiences',
      description: 'Game drives, Maasai culture immersion',
      ageGroups: [
        { range: '9–12', focus: 'Wildlife Journaling' },
        { range: '13–17', focus: 'Conservation Projects' }
      ],
      features: ['Wildlife Observation', 'Cultural Exchange', 'Conservation Education', 'Photography']
    },
    {
      id: 'chalbi',
      title: 'Rift-valley Experiences',
      description: 'Desert trek, camel safari, shelter build',
      ageGroups: [
        { range: '9–12', focus: 'Resilience' },
        { range: '13–17', focus: 'Desert Survival Challenge' }
      ],
      features: ['Desert Navigation', 'Survival Skills', 'Cultural Learning', 'Resilience Building']
    },
    {
      id: 'western',
      title: 'Western Experiences',
      description: 'Kakamega biodiversity, cultural visits',
      ageGroups: [
        { range: '9–12', focus: 'Curiosity' },
        { range: '13–17', focus: 'Community Project Leadership' }
      ],
      features: ['Biodiversity Study', 'Community Engagement', 'Forest Ecology', 'Project Leadership']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Program Information */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <Mountain className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-primary">
                    Kenyan Experiences
                  </h1>
                  <p className="text-lg text-muted-foreground">(5-Day Programs)</p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Each 5-day camp is designed to progressively build resilience, teamwork, cultural awareness, and outdoor confidence through immersive experiences across Kenya's diverse landscapes.
              </p>
            </div>

            <div className="relative h-80 rounded-2xl overflow-hidden">
              <img 
                src={adventureImage} 
                alt="Kenyan landscape adventures"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 rounded-lg p-4">
                  <h3 className="font-semibold text-primary mb-2">Age-Appropriate Learning</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">Ages 9-12: Skill Building</span>
                    <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">Ages 13-17: Leadership</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Circuit Details */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-primary">Available Circuits</h3>
              <div className="space-y-6">
                {circuits.map((circuit) => (
                  <Card key={circuit.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold mb-2">{circuit.title}</h4>
                        <p className="text-muted-foreground mb-4">{circuit.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {circuit.ageGroups.map((group, index) => (
                            <div key={index} className="bg-accent/30 p-3 rounded-lg">
                              <div className="font-medium text-primary">Age {group.range}</div>
                              <div className="text-sm text-muted-foreground">Focus: {group.focus}</div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {circuit.features.map((feature) => (
                            <span key={feature} className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Program Benefits */}
            <Card className="p-6 bg-primary/5">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                5-Day Progressive Learning
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Day 1-2:</strong> Orientation and skill building</li>
                <li>• <strong>Day 3:</strong> Challenge application and teamwork</li>
                <li>• <strong>Day 4-5:</strong> Leadership development and reflection</li>
                <li>• <strong>Cultural Integration:</strong> Local community engagement throughout</li>
              </ul>
            </Card>
          </div>

          {/* Registration Form */}
          <Card className="p-8 sticky top-8">
            <h3 className="text-2xl font-bold text-primary mb-6">Register for Experience</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="parentLeader" className="text-base font-medium">Parent/Leader Name *</Label>
                <Input
                  id="parentLeader"
                  {...register('parentLeader')}
                  className="mt-2"
                  placeholder="Enter your full name"
                />
                {errors.parentLeader && (
                  <p className="text-destructive text-sm mt-1">{errors.parentLeader.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="participantsNames" className="text-base font-medium">Participants Names & Age Ranges *</Label>
                <Textarea
                  id="participantsNames"
                  {...register('participantsNames')}
                  className="mt-2"
                  placeholder="e.g., John Smith (14), Mary Johnson (16), etc."
                  rows={3}
                />
                {errors.participantsNames && (
                  <p className="text-destructive text-sm mt-1">{errors.participantsNames.message}</p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">Circuit *</Label>
                <Select onValueChange={(value) => setValue('circuit', value as any)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a circuit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mt-kenya">Mt Kenya</SelectItem>
                    <SelectItem value="coast">Coast</SelectItem>
                    <SelectItem value="mara">Mara</SelectItem>
                    <SelectItem value="chalbi">Chalbi</SelectItem>
                    <SelectItem value="western">Western</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dates" className="text-base font-medium">Preferred Dates *</Label>
                <Input
                  id="dates"
                  {...register('dates')}
                  className="mt-2"
                  placeholder="e.g., July 15-19, 2024"
                />
                {errors.dates && (
                  <p className="text-destructive text-sm mt-1">{errors.dates.message}</p>
                )}
              </div>

              <div className="bg-accent/30 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="transport"
                    {...register('transport')}
                  />
                  <Label htmlFor="transport" className="text-base">
                    Transport Required
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2 ml-7">
                  Check if you need transportation to/from the circuit location
                </p>
              </div>

              <div>
                <Label htmlFor="specialMedicalNeeds" className="text-base font-medium">Special/Medical Needs (Optional)</Label>
                <Textarea
                  id="specialMedicalNeeds"
                  {...register('specialMedicalNeeds')}
                  className="mt-2"
                  placeholder="Please describe any special needs, medical conditions, or dietary requirements"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-base font-medium">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="mt-2"
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-base font-medium">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    className="mt-2"
                    placeholder="+254 700 000 000"
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <ConsentDialog
                checked={consent}
                onCheckedChange={(checked) => setValue('consent', checked)}
                error={errors.consent?.message}
              />

              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Register for Experience'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KenyanExperiencesProgram;