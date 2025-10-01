
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/programs/ProgramDetail";
import SummerCamps from "./pages/camps/SummerCamps";
import KenyanExperiences from "./pages/camps/KenyanExperiences";
import Team from "./pages/about/Team";
import WhoWeAre from "./pages/about/WhoWeAre";
import WhatWeDo from "./pages/about/WhatWeDo";
import AnnouncementsPage from "./pages/Announcements";
import { AuthProvider } from "./hooks/useAuth";
import ProgramRegistration from "./components/ProgramRegistration";
import FloatingFAQ from "./components/FloatingFAQ";
import { useState } from "react";

function App() {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={<Gallery />} />
              {/* <Route path="/programs" element={<Programs />} /> */}
              <Route path="/programs/:programId" element={<ProgramDetail />} />
              {/* <Route path="/camps/summer" element={<SummerCamps />} /> */}
              <Route path="/camps/kenyan-experiences" element={<KenyanExperiences />} />
          <Route path="/about/team" element={<Team />} />
          <Route path="/about/who-we-are" element={<WhoWeAre />} />
          <Route path="/about/what-we-do" element={<WhatWeDo />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/register/:programId" element={<ProgramRegistration />} />
              <Route path="/register" element={<ProgramRegistration />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingFAQ />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
