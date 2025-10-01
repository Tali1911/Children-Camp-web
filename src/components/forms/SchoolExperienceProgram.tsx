import React from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { GraduationCap, MapPin, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import schoolsImage from '@/assets/schools.jpg';
import DatePickerField from './DatePickerField';

const schoolExperienceSchema = z.object({
  schoolName: z.string().min(1, 'School name is required').max(200),
  numberOfKids: z.string().min(1, 'Number of kids is required'),
  numberOfAdults: z.string().min(1, 'Number of adults is required'),
  ageRange: z.enum(['6-8', '9-11', '12-14', '15-17']),
  package: z.enum(['day-trip', 'sleep-away', 'after-school-club', 'physical-education']),
  visitDate: z.date({ required_error: 'Visit date is required' }),
  location: z.enum(['karura-gate-f', 'karura-gate-a', 'tigoni', 'ngong']),
  numberOfStudents: z.string().min(1, 'Number of students is required'),
  numberOfTeachers: z.string().min(1, 'Number of teachers is required'),
  transport: z.boolean().default(false),
  catering: z.boolean().default(false),
  specialNeeds: z.string().max(500),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required').max(20),
  consent: z.boolean().refine(val => val === true, 'Consent is required')
});

type SchoolExperienceFormData = z.infer<typeof schoolExperienceSchema>;

const SchoolExperienceProgram = () => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting }
  } = useForm<SchoolExperienceFormData>({
    resolver: zodResolver(schoolExperienceSchema),
    defaultValues: {
      transport: false,
      catering: false,
      consent: false
    }
  });

  const onSubmit = async (data: SchoolExperienceFormData) => {
    try {
      console.log('School Experience form submission:', data);
      toast.success('Registration submitted successfully! We will contact you soon.');
    } catch (error) {
      toast.error('Failed to submit registration. Please try again.');
    }
  };

  const globalPrograms = [
    {
      title: 'Forest-Based Curriculum Days',
      description: 'Ecology, conservation, and citizen science activities',
      features: ['Curriculum Integration', 'Reflection Journals', 'Scientific Method']
    },
    {
      title: 'Adventure Sleep-Aways (3–5 Days)',
      description: 'Mount Kenya, Coast, Mara, Chalbi, Western circuits',
      features: ['Multi-day Experience', 'Cultural Immersion', 'Team Building']
    },
    {
      title: 'After-School Clubs',
      description: 'Creative Arts, Leadership Games',
      features: ['Skill Development', 'Leadership', 'Creative Expression']
    },
    {
      title: 'PE & Well-being Consulting',
      description: 'Design of outdoor term plans for physical education',
      features: ['Curriculum Design', 'Physical Fitness', 'Well-being Focus']
    }
  ];

  const communityPrograms = [
    {
      title: 'Affordable Day Trips',
      description: 'Forest ecology walks, tree planting, group games, excursions & bushcraft days',
      features: ['Accessible Pricing', 'Environmental Education', 'Group Activities']
    },
    {
      title: 'Life Skills Immersion Days',
      description: 'Fireless cooking, navigation, ropes & survival challenges',
      features: ['Practical Skills', 'Problem Solving', 'Confidence Building']
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
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-primary">
                    School Experience Packages
                  </h1>
                  <p className="text-lg text-muted-foreground">(Ages 6-17 years)</p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Designed to complement curriculum with immersive experiential learning. International schools receive curriculum tie-in and reflection journals. Kenyan schools gain accessible packages focusing on practical life skills.
              </p>
            </div>

            <div className="relative h-80 rounded-2xl overflow-hidden">
              <img 
                src={schoolsImage} 
                alt="School groups in nature"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Global Learning Adventures */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-primary">A. Global Learning Adventures</h3>
              <div className="space-y-4">
                {globalPrograms.map((program, index) => (
                  <Card key={index} className="p-6">
                    <h4 className="text-xl font-semibold mb-3">{program.title}</h4>
                    <p className="text-muted-foreground mb-4">{program.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {program.features.map((feature) => (
                        <span key={feature} className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Community School Programs */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-primary">B. Community School Programs</h3>
              <div className="space-y-4">
                {communityPrograms.map((program, index) => (
                  <Card key={index} className="p-6">
                    <h4 className="text-xl font-semibold mb-3">{program.title}</h4>
                    <p className="text-muted-foreground mb-4">{program.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {program.features.map((feature) => (
                        <span key={feature} className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Rainy Day Plans */}
            <Card className="p-6 bg-accent/50">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Rainy-Day Plans
              </h4>
              <p className="text-muted-foreground">
                Use indoor pavilions or partner halls for storytelling, simulations, knot practice, cultural dance workshops - ensuring learning continues regardless of weather.
              </p>
            </Card>
          </div>

          {/* Registration Form */}
          <Card className="p-8 sticky top-8">
            <h3 className="text-2xl font-bold text-primary mb-6">School Registration</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="schoolName" className="text-base font-medium">School Name *</Label>
                <Input
                  id="schoolName"
                  {...register('schoolName')}
                  className="mt-2"
                  placeholder="Enter school name"
                />
                {errors.schoolName && (
                  <p className="text-destructive text-sm mt-1">{errors.schoolName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfKids" className="text-base font-medium">Number of Kids *</Label>
                  <Input
                    id="numberOfKids"
                    {...register('numberOfKids')}
                    className="mt-2"
                    placeholder="e.g., 25"
                  />
                  {errors.numberOfKids && (
                    <p className="text-destructive text-sm mt-1">{errors.numberOfKids.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="numberOfAdults" className="text-base font-medium">Number of Adults *</Label>
                  <Input
                    id="numberOfAdults"
                    {...register('numberOfAdults')}
                    className="mt-2"
                    placeholder="e.g., 3"
                  />
                  {errors.numberOfAdults && (
                    <p className="text-destructive text-sm mt-1">{errors.numberOfAdults.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Age Range *</Label>
                <Select onValueChange={(value) => setValue('ageRange', value as any)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6-8">6-8 years</SelectItem>
                    <SelectItem value="9-11">9-11 years</SelectItem>
                    <SelectItem value="12-14">12-14 years</SelectItem>
                    <SelectItem value="15-17">15-17 years</SelectItem>
                  </SelectContent>
                </Select>
                {errors.ageRange && (
                  <p className="text-destructive text-sm mt-1">{errors.ageRange.message}</p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">Package *</Label>
                <Select onValueChange={(value) => setValue('package', value as any)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day-trip">Day Trip</SelectItem>
                    <SelectItem value="sleep-away">Sleep-Away</SelectItem>
                    <SelectItem value="after-school-club">After-School Club</SelectItem>
                    <SelectItem value="physical-education">Physical Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Controller
                name="visitDate"
                control={control}
                render={({ field }) => (
                  <DatePickerField
                    label="Visit Date"
                    placeholder="Select visit date"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.visitDate?.message}
                    required
                  />
                )}
              />

              <div>
                <Label className="text-base font-medium">Location *</Label>
                <Select onValueChange={(value) => setValue('location', value as any)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="karura-gate-f">Karura Gate F</SelectItem>
                    <SelectItem value="karura-gate-a">Karura Gate A</SelectItem>
                    <SelectItem value="tigoni">Tigoni</SelectItem>
                    <SelectItem value="ngong">Ngong</SelectItem>
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="text-destructive text-sm mt-1">{errors.location.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfStudents" className="text-base font-medium">No. of Students *</Label>
                  <Input
                    id="numberOfStudents"
                    {...register('numberOfStudents')}
                    className="mt-2"
                    placeholder="Total students"
                  />
                  {errors.numberOfStudents && (
                    <p className="text-destructive text-sm mt-1">{errors.numberOfStudents.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="numberOfTeachers" className="text-base font-medium">No. of Teachers *</Label>
                  <Input
                    id="numberOfTeachers"
                    {...register('numberOfTeachers')}
                    className="mt-2"
                    placeholder="Total teachers"
                  />
                  {errors.numberOfTeachers && (
                    <p className="text-destructive text-sm mt-1">{errors.numberOfTeachers.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Add-Ons</Label>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="transport" {...register('transport')} />
                    <Label htmlFor="transport">Transport</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="catering" {...register('catering')} />
                    <Label htmlFor="catering">Catering</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="specialNeeds" className="text-base font-medium">Special Needs (Optional)</Label>
                <Textarea
                  id="specialNeeds"
                  {...register('specialNeeds')}
                  className="mt-2"
                  placeholder="Describe any special needs or requirements"
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
                    placeholder="school@email.com"
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
                <Checkbox
                  id="consent"
                  {...register('consent')}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed">
                  I consent to the students participating in the school experience program and understand the activities involved *
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
                {isSubmitting ? 'Submitting...' : 'Submit School Registration'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchoolExperienceProgram;