import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Announcements from "@/components/Announcements";
import YearlyCalendar from "@/components/YearlyCalendar";
import SEOHead from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AnnouncementsPage = () => {
  const [activeTab, setActiveTab] = useState("announcements");

  return (
    <>
      <SEOHead 
        title="Announcements & Calendar | Amuse.Ke"
        description="Stay updated with the latest news, events, and schedules from Amuse Kenya. View our announcements and yearly calendar for upcoming programs and activities."
      />
      <div className="min-h-screen bg-gradient-to-b from-forest-50 to-white">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-forest-800 mb-4">
                Stay Connected
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Keep up with our latest announcements and upcoming events
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>

              <TabsContent value="announcements" className="mt-0">
                <Announcements />
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <YearlyCalendar />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AnnouncementsPage;
