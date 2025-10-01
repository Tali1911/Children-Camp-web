import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Baby, School, Tent, Users, MapPin } from 'lucide-react';

const WhatWeDo = () => {
  const programs = [
    {
      icon: GraduationCap,
      title: "Homeschooling Outdoor Experiences",
      description: "Structured programs integrating physical education and nature immersion."
    },
    {
      icon: Baby,
      title: "Little Forest Explorers",
      description: "Nurturing sensory exploration and early development for children aged three and below."
    },
    {
      icon: School,
      title: "School Experience Packages",
      description: "Tailored trips and clubs to complement school curriculum."
    },
    {
      icon: Tent,
      title: "Day and Overnight Camps",
      description: "Progressive experiences that build resilience and confidence."
    },
    {
      icon: Users,
      title: "Group Activities",
      description: "Customized parties and team-building events with a focus on fun and tangible outcomes."
    },
    {
      icon: MapPin,
      title: "Kenyan Experiences",
      description: "Multi-day adventures across various regions of Kenya to build teamwork and cultural awareness."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="What We Do - Amuse Kenya"
        description="Discover our range of nature-based programs including camps, homeschooling experiences, and team-building activities."
      />
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">What We Do</h1>
            
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-lg text-muted-foreground leading-relaxed">
                We design and deliver a wide range of programs that complement and enhance learning 
                through immersive, experiential activities. Our offerings include:
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-12">
              {programs.map((program, index) => {
                const Icon = program.icon;
                return (
                  <Card key={index} className="border-primary/20 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-2">{program.title}</h3>
                          <p className="text-muted-foreground">{program.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WhatWeDo;
