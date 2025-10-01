import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Heart } from 'lucide-react';

const WhoWeAre = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Who We Are - Amuse Kenya"
        description="Learn about Amuse Kenya, our mission, vision, and values in providing nature-based experiences for children and families."
      />
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Who We Are</h1>
            
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Amuse Kenya is a leading provider of fun, meaningful, and enriching outdoor activities for 
                children and families. We are dedicated to creating structured, nature-based experiences that 
                help children build essential life skills, from physical fitness to leadership and problem-solving. 
                We also specialize in creating memorable team-building and party packages for all ages.
              </p>
            </div>

            <div className="space-y-8 mb-12">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-3">Our Purpose</h2>
                      <p className="text-muted-foreground">
                        Our purpose is to enrich the lives of children and families by connecting them with nature 
                        through play, adventure, and learning.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-3">Mission</h2>
                      <p className="text-muted-foreground">
                        To provide fun, meaningful, and enriching outdoor activities that foster curiosity, confidence, and 
                        a lifelong appreciation for nature.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-3">Vision</h2>
                      <p className="text-muted-foreground">
                        To be the premier provider of nature-based experiences in Kenya, inspiring a generation of 
                        resilient and compassionate leaders who are deeply connected to their environment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-3">Values</h2>
                      <ul className="space-y-3 text-muted-foreground">
                        <li>
                          <strong className="text-foreground">Adventure:</strong> We believe in the power of exploration and challenge to ignite personal growth.
                        </li>
                        <li>
                          <strong className="text-foreground">Education:</strong> We are committed to fostering learning through hands-on experiences and a deep connection to the natural world.
                        </li>
                        <li>
                          <strong className="text-foreground">Community:</strong> We build strong bonds through shared experiences and a sense of belonging.
                        </li>
                        <li>
                          <strong className="text-foreground">Sustainability:</strong> We operate with a deep respect for the environment, promoting conservation and responsible outdoor practices.
                        </li>
                        <li>
                          <strong className="text-foreground">Joy:</strong> We prioritize fun and laughter, ensuring every experience is filled with positive, lasting memories.
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WhoWeAre;
