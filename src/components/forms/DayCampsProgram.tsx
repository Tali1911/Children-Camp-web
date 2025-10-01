import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Users, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import dailyActivitiesImage from '@/assets/daily-activities.jpg';

const dayCampsSchema = z.object({
  parentName: z.string().min(1, 'Parent name is required').max(100),
  childName: z.string().min(1, 'Child name is required').max(100),
  ageRange: z.string().min(1, 'Age range is required'),
  campLocation: z.string().min(1, 'Camp location is required'),
  dates: z.string().min(1, 'Dates are required'),
  emergencyContact: z.string().min(1, 'Emergency contact is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required').max(20),
  consent: z.boolean().refine(val => val === true, 'Consent is required')
});

type DayCampsFormData = z.infer<typeof dayCampsSchema>;

const DayCampsProgram = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<DayCampsFormData>({
    resolver: zodResolver(dayCampsSchema),
    defaultValues: {
      consent: false
    }
  });

  const onSubmit = async (data: DayCampsFormData) => {
    try {
      console.log('Day Camps form submission:', data);
      toast.success('Registration submitted successfully! We will contact you soon.');
    } catch (error) {
      toast.error('Failed to submit registration. Please try again.');
    }
  };

  const ageGroups = [
    {
      age: '3 & Below',
      locations: 'Karura Gate F, Tigoni',
      schedule: '9:30 Songs • 10:00 Walk • 10:45 Snack • 11:15 Craft • 12:00 Story • 12:30 Close',
      skills: 'Sensory, Language, Motor Skills',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      age: '4–6',
      locations: 'Karura Gate F, Tigoni',
      schedule: '9:30 Warmup • 10:00 Bushcraft Basics • 11:30 Snack • 12:00 Games • 1:00 Creative Craft',
      skills: 'Confidence, Social Play, Curiosity',
      color: 'bg-green-50 border-green-200'
    },
    {
      age: '7–10',
      locations: 'Karura Gate F',
      schedule: '8:30 Safety Brief • 9:00 Rope Course • 10:30 Orienteering • 12:00 Lunch • 2:00 Group Game',
      skills: 'Survival Basics, Teamwork',
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      age: '11–13',
      locations: 'Karura Gate A, Ngong',
      schedule: '8:30 Navigation Skills • 10:30 Survival Task • 1:00 Leadership Challenge • 3:30 Reflection',
      skills: 'Leadership, Resilience',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      age: '14–17',
      locations: 'Karura Gate A, Ngong',
      schedule: '8:00 Expedition Simulation • 11:00 River Crossing • 2:00 Team Strategy Game',
      skills: 'Problem-Solving, Decision Making',
      color: 'bg-red-50 border-red-200'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/programs" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
            <ArrowLeft size={20} />
            Back to Programs
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Program Information */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-primary">
                    Day Camps
                  </h1>
                  <p className="text-lg text-muted-foreground">(Nairobi Circuit)</p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Structured daily experiences to build confidence, friendships, and life skills while reinforcing Amuse's mission of enriching kids through nature. Programs run across Karura Gate F and Ngong Sanctuary.
              </p>
            </div>

            <div className="relative h-80 rounded-2xl overflow-hidden">
              <img 
                src={dailyActivitiesImage} 
                alt="Children enjoying day camp activities"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 rounded-lg p-4">
                  <h3 className="font-semibold text-primary mb-2">Locations</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Karura Gate F
                    </span>
                    <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Ngong Sanctuary
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Age Group Details */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-primary">Age Groups & Schedules</h3>
              <div className="space-y-4">
                {ageGroups.map((group, index) => (
                  <Card key={index} className={`p-6 border-2 ${group.color}`}>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h4 className="text-xl font-semibold text-primary">Age {group.age}</h4>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{group.locations}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <h5 className="font-medium text-sm text-primary mb-1">Daily Schedule:</h5>
                            <p className="text-sm text-muted-foreground">{group.schedule}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm text-primary mb-1">Key Skills:</h5>
                            <div className="flex flex-wrap gap-1">
                              {group.skills.split(', ').map((skill) => (
                                <span key={skill} className="bg-white/80 text-primary text-xs px-2 py-1 rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Special Note */}
            <Card className="p-6 bg-primary/5">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Special Needs Accommodation
              </h4>
              <p className="text-muted-foreground">
                We provide specialized support and adapted activities for children with special needs. Please indicate any requirements during registration so we can ensure the best possible experience for your child.
              </p>
            </Card>
          </div>

          {/* Registration Form */}
          <Card className="p-8 sticky top-8">
            <h3 className="text-2xl font-bold text-primary mb-6">Register for Day Camp</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="parentName" className="text-base font-medium">Parent Name *</Label>
                <Input
                  id="parentName"
                  {...register('parentName')}
                  className="mt-2"
                  placeholder="Enter your full name"
                />
                {errors.parentName && (
                  <p className="text-destructive text-sm mt-1">{errors.parentName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childName" className="text-base font-medium">Child Name *</Label>
                  <Input
                    id="childName"
                    {...register('childName')}
                    className="mt-2"
                    placeholder="Child's full name"
                  />
                  {errors.childName && (
                    <p className="text-destructive text-sm mt-1">{errors.childName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ageRange" className="text-base font-medium">Age Range *</Label>
                  <Input
                    id="ageRange"
                    {...register('ageRange')}
                    className="mt-2"
                    placeholder="e.g., 7 years old"
                  />
                  {errors.ageRange && (
                    <p className="text-destructive text-sm mt-1">{errors.ageRange.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="campLocation" className="text-base font-medium">Camp Location *</Label>
                <Input
                  id="campLocation"
                  {...register('campLocation')}
                  className="mt-2"
                  placeholder="e.g., Karura Gate F"
                />
                {errors.campLocation && (
                  <p className="text-destructive text-sm mt-1">{errors.campLocation.message}</p>
                )}
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

              <div>
                <Label htmlFor="emergencyContact" className="text-base font-medium">Emergency Contact *</Label>
                <Input
                  id="emergencyContact"
                  {...register('emergencyContact')}
                  className="mt-2"
                  placeholder="Emergency contact name and phone"
                />
                {errors.emergencyContact && (
                  <p className="text-destructive text-sm mt-1">{errors.emergencyContact.message}</p>
                )}
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

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="consent"
                  {...register('consent')}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed">
                  I consent to my child participating in the day camp program and understand the age-appropriate activities involved *
                </Label>
              </div>
              {errors.consent && (
                <p className="text-destructive text-sm mt-1">{errors.consent.message}</p>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Register for Day Camp'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DayCampsProgram;