import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-r from-primary via-primary/80 to-sky-500 py-14 md:py-20 relative overflow-hidden">
      {/* Decorative dots/circles pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white"></div>
        <div className="absolute top-1/4 right-1/3 w-24 h-24 rounded-full bg-white"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
          Connect, Grow, and Give Back
        </h1>
        <p className="mt-4 max-w-md mx-auto text-base text-blue-50 sm:text-lg md:mt-6 md:text-xl md:max-w-3xl">
          Build meaningful connections with fellow alumni and students. Share knowledge, find mentors, and discover opportunities.
        </p>
        <div className="mt-8 sm:flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/mentorship">
            <div className="inline-flex rounded-md shadow transition-transform hover:scale-105">
              <span className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10">
                Find a Mentor
              </span>
            </div>
          </Link>
          <Link href="/mentorship?become=true">
            <div className="inline-flex rounded-md shadow transition-transform hover:scale-105">
              <span className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                Become a Mentor
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
