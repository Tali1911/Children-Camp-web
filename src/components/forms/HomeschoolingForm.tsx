import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Clock, Users, Target, CheckCircle } from 'lucide-react';
import campingImage from '@/assets/camping.jpg';
import adventureImage from '@/assets/adventure.jpg';
import dailyActivitiesImage from '@/assets/daily-activities.jpg';
import DatePickerField from './DatePickerField';

const homeschoolingSchema = z.object({
  parentName: z.string().min(1, 'Parent name is required').max(100),
  childrenNames: z.string().min(1, 'Children names and birth years are required').max(500),
  ageRange: z.enum(['4-6', '7-10', '11-13', '14-17']),
  package: z.enum(['1-day-discovery', 'weekly-pod-plan', 'project-based-module']),
  startDate: z.date({ required_error: 'Start date is required' }),
  focus: z.array(z.string()).min(1, 'Please select at least one focus area'),
  transport: z.boolean().default(false),
  meal: z.boolean().default(false),
  allergies: z.string().max(500).optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required').max(20),
  consent: z.boolean().refine(val => val === true, 'Consent is required')
});

type HomeschoolingFormData = z.infer<typeof homeschoolingSchema>;

const HomeschoolingForm = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting }
  } = useForm<HomeschoolingFormData>({
    resolver: zodResolver(homeschoolingSchema),
    defaultValues: {
      focus: [],
      transport: false,
      meal: false,
      consent: false
    }
  });

  const watchedFocus = watch('focus') || [];

  const onSubmit = async (data: HomeschoolingFormData) => {
    try {
      console.log('Homeschooling form submission:', data);
      toast.success('Registration submitted successfully! We will contact you soon.');
    } catch (error) {
      toast.error('Failed to submit registration. Please try again.');
    }
  };

  const handleFocusChange = (value: string, checked: boolean) => {
    const currentFocus = watchedFocus;
    if (checked) {
      setValue('focus', [...currentFocus, value]);
    } else {
      setValue('focus', currentFocus.filter(item => item !== value));
    }
  };

  const packages = [
    {
      id: '1-day-discovery',
      title: '1-Day Discovery',
      image: dailyActivitiesImage,
      time: '6 hours',
      description: '10:00 Nature Circle | 10:15 Guided Lesson | 11:15 Journaling | 12:30 Project Build | 1:30 Math-in-Nature | 2:30 Reflection',
      skills: ['Observation', 'Sports', 'Teamwork', 'Journaling'],
      color: 'bg-blue-600'
    },
    {
      id: 'weekly-pod-plan',
      title: 'Weekly Pod Plan',
      subtitle: '(4-Weeks)',
      image: campingImage,
      time: '4 weeks',
      description: 'Each week builds on a theme: Week 1 – Ecology, Week 2 – Navigation, Week 3 – Survival, Week 4 – Showcase',
      skills: ['Progressive Learning', 'Leadership', 'Presentation Skills'],
      color: 'bg-green-600'
    },
    {
      id: 'project-based-module',
      title: 'Project-Based Module',
      subtitle: '(5 Days)',
      image: adventureImage,
      time: '5 days',
      description: 'Day 1 – Research, Day 2 – Build, Day 3 – Field Study, Day 4 – Prepare Presentation, Day 5 – Present',
      skills: ['Research', 'Collaboration', 'Critical Thinking'],
      color: 'bg-orange-600'
    }
  ];

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setValue('package', packageId as any);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => setShowForm(false)}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Packages
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Homeschooling Registration</CardTitle>
              {selectedPackage && (
                <p className="text-muted-foreground">
                  Selected Package: {packages.find(p => p.id === selectedPackage)?.title}
                  {packages.find(p => p.id === selectedPackage)?.subtitle}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="parentName">Parent Name *</Label>
                    <Input
                      id="parentName"
                      {...register('parentName')}
                      className="mt-1"
                    />
                    {errors.parentName && (
                      <p className="text-destructive text-sm mt-1">{errors.parentName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="childrenNames">Children Name(s) and Year of Birth *</Label>
                    <Textarea
                      id="childrenNames"
                      {...register('childrenNames')}
                      placeholder="e.g., John (2015), Mary (2018)"
                      className="mt-1 min-h-[80px]"
                    />
                    {errors.childrenNames && (
                      <p className="text-destructive text-sm mt-1">{errors.childrenNames.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="ageRange">Age Range *</Label>
                    <Select onValueChange={(value) => setValue('ageRange', value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4-6">4-6 years</SelectItem>
                        <SelectItem value="7-10">7-10 years</SelectItem>
                        <SelectItem value="11-13">11-13 years</SelectItem>
                        <SelectItem value="14-17">14-17 years</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.ageRange && (
                      <p className="text-destructive text-sm mt-1">{errors.ageRange.message}</p>
                    )}
                  </div>

                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <DatePickerField
                        label="Start Date"
                        placeholder="Select program start date"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.startDate?.message}
                        required
                      />
                    )}
                  />
                </div>

                <div>
                  <Label>Focus Areas *</Label>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {['STEM', 'History', 'Multi-Subject'].map((focus) => (
                      <div key={focus} className="flex items-center space-x-2">
                        <Checkbox
                          id={focus}
                          checked={watchedFocus.includes(focus)}
                          onCheckedChange={(checked) => handleFocusChange(focus, checked as boolean)}
                        />
                        <Label htmlFor={focus} className="text-sm font-medium">{focus}</Label>
                      </div>
                    ))}
                  </div>
                  {errors.focus && (
                    <p className="text-destructive text-sm mt-1">{errors.focus.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transport"
                      {...register('transport')}
                    />
                    <Label htmlFor="transport" className="text-sm font-medium">Transport Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="meal"
                      {...register('meal')}
                    />
                    <Label htmlFor="meal" className="text-sm font-medium">Meal Required</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="allergies">Allergies (Optional)</Label>
                  <Textarea
                    id="allergies"
                    {...register('allergies')}
                    placeholder="Please describe any allergies or dietary restrictions"
                    className="mt-1"
                  />
                  {errors.allergies && (
                    <p className="text-destructive text-sm mt-1">{errors.allergies.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="mt-1"
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      className="mt-1"
                    />
                    {errors.phone && (
                      <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent"
                    {...register('consent')}
                    className="mt-1"
                  />
                  <Label htmlFor="consent" className="text-sm leading-relaxed">
                    I consent to my child participating in the program and understand the activities involved *
                  </Label>
                </div>
                {errors.consent && (
                  <p className="text-destructive text-sm mt-1">{errors.consent.message}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full md:w-auto px-8 py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-6">Homeschooling Outdoor Experiences</h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Structured integration of physical education and nature immersion. Sports modules include mini athletics, relay races, and cooperative games to build physical literacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-500 overflow-hidden border-0 shadow-lg"
              onClick={() => handlePackageSelect(pkg.id)}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={pkg.image} 
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 ${pkg.color} bg-opacity-85 flex flex-col justify-center items-center text-white p-6`}>
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold">
                      {pkg.title}
                      {pkg.subtitle && <div className="text-lg font-medium opacity-90 mt-1">{pkg.subtitle}</div>}
                    </h3>
                    
                    <div className="flex items-center justify-center gap-2 bg-white/20 rounded-full px-4 py-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{pkg.time}</span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed opacity-95 line-clamp-3">
                        {pkg.description}
                      </p>
                      
                      <div className="flex items-center justify-center gap-2 text-xs bg-white/10 rounded-full px-3 py-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Skills: {pkg.skills.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <Button 
                  className="w-full text-lg py-3 font-semibold" 
                  variant="default"
                >
                  Select This Package
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Program Details Section */}
        <div className="bg-muted/30 rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-primary mb-6">Program Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Small group activities</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Skill-based learning</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Flexible scheduling</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg, index) => (
                <div key={pkg.id} className="bg-background rounded-xl p-6 shadow-sm border">
                  <div className={`w-12 h-12 ${pkg.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                    <span className="text-xl font-bold">{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {pkg.title}
                    {pkg.subtitle && <span className="text-sm text-muted-foreground block">{pkg.subtitle}</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {pkg.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {pkg.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rainy Day Activities */}
        <div className="text-center bg-secondary/10 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-secondary mb-4">Rainy Day Activities</h3>
          <p className="text-muted-foreground mb-4">
            Nature crafts, mapping indoors, and nature storytime
          </p>
          <div className="flex justify-center flex-wrap gap-2">
            {['Adaptability', 'Sensory Play', 'Creative Thinking'].map((skill, index) => (
              <span key={index} className="text-xs bg-secondary/20 text-secondary rounded-full px-3 py-1">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeschoolingForm;