import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Users, Gift, PartyPopper, Cake, Camera, Star, Music, Sparkles } from "lucide-react";
import { cmsService } from "@/services/cmsService";
import birthdayImage from "@/assets/birthday.jpg";

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
  subtitle: 'Celebrate in the forest, at your home, or under the stars',
  description: 'Unforgettable celebrations that combine adventure, nature, and fun. Choose your party style: come to Karura Forest, we come to you, or plan an overnight camping experience.',
  featuredImage: '',
  details: {
    partyTypes: 'Birthdays, family reunions, group celebrations',
    groupSize: '10-50 guests',
    duration: 'Half-day / Full-day / Overnight',
    location: 'Karura Forest, your venue, or camping site'
  },
  whatsIncluded: [
    'Come to Karura: Obstacle courses, rope course, scavenger hunts, bushcraft',
    'We Come to You: Adventure brought to your home, school, or community space',
    'Overnight Camping: Spacious tents, archery, orienteering, campfire stories',
    'Custom themes with trained facilitators',
    'Full facilitation and equipment provided',
    'Age-appropriate activities',
    'Safety equipment and supervision',
    'Note: No single-use plastics at Karura (forest guidelines)'
  ],
  addOns: [
    { icon: 'Cake', text: 'Custom catering services' },
    { icon: 'Camera', text: 'Professional photography' },
    { icon: 'Star', text: 'Special activities (archery, bushcraft)' },
    { icon: 'Gift', text: 'Party favors and gift bags' }
  ],
  ctaText: 'Book Your Party',
  ctaLink: '/group-activities/parties/booking',
  metaTitle: 'Parties & Celebrations | Amuse Kenya Outdoor Events',
  metaDescription: 'Host unforgettable outdoor birthday parties and celebrations at Karura Forest or your venue.'
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cake,
  Camera,
  Star,
  Gift,
  Music,
  Sparkles
};

const Parties = () => {
  const [config, setConfig] = useState<PartiesConfig>(defaultConfig);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const content = await cmsService.getContentBySlug('parties-page', 'camp_page');
        if (content?.metadata?.pageConfig) {
          setConfig({ ...defaultConfig, ...content.metadata.pageConfig });
        }
      } catch (error) {
        console.error('Error loading parties config:', error);
      }
    };
    
    loadConfig();

    const handleCmsUpdate = () => loadConfig();
    window.addEventListener('cms-content-updated', handleCmsUpdate);
    return () => window.removeEventListener('cms-content-updated', handleCmsUpdate);
  }, []);

  return (
    <>
      <SEOHead
        title={config.metaTitle}
        description={config.metaDescription}
        keywords="birthday parties Kenya, outdoor celebrations, children's party venue, forest parties, group events, party packages Karura, outdoor party venue Nairobi"
        canonical="https://amusekenya.co.ke/group-activities/parties"
      />
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Back Navigation */}
            <Link 
              to="/programs" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Programs</span>
            </Link>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-primary/10 rounded-full p-3">
                <PartyPopper className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary">{config.title}</h1>
                <p className="text-muted-foreground mt-1">{config.subtitle}</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Image */}
                <div className="relative rounded-2xl overflow-hidden">
                  <img 
                    src={config.featuredImage || birthdayImage} 
                    alt={config.title} 
                    className="w-full h-[300px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-4">Celebrate Outdoors</h2>
                  <p className="text-muted-foreground leading-relaxed">{config.description}</p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Party Types</h3>
                      <p className="text-sm text-muted-foreground">{config.details.partyTypes}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Group Size</h3>
                      <p className="text-sm text-muted-foreground">{config.details.groupSize}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Duration</h3>
                      <p className="text-sm text-muted-foreground">{config.details.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Location</h3>
                      <p className="text-sm text-muted-foreground">{config.details.location}</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Link to={config.ctaLink}>
                  <Button size="lg" className="w-full md:w-auto">
                    {config.ctaText}
                  </Button>
                </Link>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* What's Included */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      What's Included
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {config.whatsIncluded.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Popular Add-Ons */}
                <Card className="bg-accent/50 border-accent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Cake className="h-5 w-5 text-primary" />
                      Popular Add-Ons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {config.addOns.map((addon, index) => {
                        const IconComponent = iconMap[addon.icon] || Star;
                        return (
                          <li key={index} className="flex items-start gap-2">
                            <IconComponent className="h-4 w-4 text-primary mt-0.5" />
                            <span className="text-sm text-muted-foreground">{addon.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Parties;
