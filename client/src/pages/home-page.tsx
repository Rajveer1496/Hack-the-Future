import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import RecommendedSection from "@/components/home/recommended-section";
import NetworkSection from "@/components/home/network-section";
import EventsSection from "@/components/home/events-section";
import MentorshipCard from "@/components/home/mentorship-card";
import ResourcesCard from "@/components/home/resources-card";
import QuickLinksCard from "@/components/home/quick-links-card";
import { StatsSection } from "@/components/home/stats-section";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Stats Section */}
        <StatsSection />

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Recommended Section */}
          <RecommendedSection />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Network) */}
            <div className="lg:col-span-8">
              {/* Network Section */}
              <NetworkSection />
              
              {/* Events Section */}
              <EventsSection />
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-4">
              {/* Mentorship Status Card */}
              <MentorshipCard />
              
              {/* Resources Card */}
              <ResourcesCard />
              
              {/* Quick Links Card */}
              <QuickLinksCard />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
