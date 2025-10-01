import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TeamSection from '@/components/TeamSection';
import SEOHead from '@/components/SEOHead';

const Team = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Meet Our Team - Amuse Kenya"
        description="Meet the dedicated team at Amuse Kenya who create memorable outdoor experiences for children and families."
      />
      <Navbar />
      <main className="pt-20">
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
};

export default Team;
