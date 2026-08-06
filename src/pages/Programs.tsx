import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import ProgramsOverview from '@/components/forms/ProgramsOverview';
import CustomHomeSection from '@/components/home/CustomHomeSection';
import CardsGridSection from '@/components/home/CardsGridSection';
import { cmsService, ContentItem } from '@/services/cmsService';

/**
 * Public "Programs" page. Content is CMS-driven via the `about_section`
 * content_type with `metadata.scope = 'programs'` — mirrors the Home / Camp
 * CMS pattern. Marketers add custom sections and card grids linking to the
 * individual programme pages / registration forms.
 *
 * If no CMS sections exist yet, the page falls back to the original
 * ProgramsOverview cards so the route never appears empty.
 */
const Programs: React.FC = () => {
  const [sections, setSections] = useState<ContentItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await cmsService.getProgramsPageSections();
        setSections(rows);
      } catch (err) {
        console.error('Failed to load programs page sections', err);
      } finally {
        setLoaded(true);
      }
    };
    load();
    const onUpdate = () => load();
    window.addEventListener('cms-content-updated', onUpdate);
    return () => window.removeEventListener('cms-content-updated', onUpdate);
  }, []);

  const visible = sections
    .filter(s => s.metadata?.visible !== false)
    .sort((a, b) => (a.metadata?.order ?? 99) - (b.metadata?.order ?? 99));

  return (
    <>
      <SEOHead
        title="Our Programs | Amuse Kenya Forest Adventures"
        description="Explore daily activities, holiday camps, homeschooling, parties, team building & school experiences at Karura Forest, Nairobi."
        keywords="programs, forest activities, outdoor programs Kenya, children programs, nature education, adventure programs, Karura Forest programs"
        canonical="https://amusekenya.co.ke/programs"
      />
      <div className="min-h-screen bg-background">
        <header role="banner"><Navbar /></header>
        <main role="main" className="pt-20">
          {loaded && visible.length === 0 && <ProgramsOverview />}
          {visible.map(s => {
            const kind = s.metadata?.section_kind;
            if (kind === 'custom_cards') {
              return (
                <section key={s.id} aria-label={s.title || 'Cards section'}>
                  <CardsGridSection section={s} />
                </section>
              );
            }
            return (
              <section key={s.id} aria-label={s.title || 'Custom section'}>
                <CustomHomeSection section={s} />
              </section>
            );
          })}
        </main>
        <footer role="contentinfo"><Footer /></footer>
      </div>
    </>
  );
};

export default Programs;
