import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, Mentorship } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function MentorshipCard() {
  const { user } = useAuth();
  
  // Get mentorships where user is mentee
  const { data: mentorships = [] } = useQuery<Mentorship[]>({
    queryKey: ["/api/users", user?.id, "mentorships", { role: "mentee" }],
    enabled: !!user,
  });
  
  // Get mentors data
  const { data: mentors = [] } = useQuery<User[]>({
    queryKey: ["/api/users/search"],
    enabled: !!mentorships.length,
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  // Filter mentors for the current active mentorships
  const activeMentors = mentors.filter(mentor => 
    mentorships.some(m => m.mentorId === mentor.id && m.status === "active")
  );

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    if (!user) return 0;
    
    const requiredFields = [
      'firstName', 'lastName', 'email', 'major', 
      'graduationYear', 'company', 'position', 'bio'
    ];
    
    const completedFields = requiredFields.filter(field => !!user[field as keyof typeof user]);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const profileCompletion = getProfileCompletion();

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Mentorship Status</h2>
        
        <div className="bg-primary-50 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Info className="h-6 w-6 text-primary mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary-800">
                Your mentorship profile is {profileCompletion}% complete
              </h3>
              <Progress value={profileCompletion} className="h-2 mt-2" />
              <p className="mt-1 text-sm text-primary-700">
                Complete your profile to improve mentor matches.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-800 mb-2">Current Mentors</h3>
            {activeMentors.length > 0 ? (
              activeMentors.map(mentor => (
                <div key={mentor.id} className="flex items-center border-b border-slate-200 py-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={mentor.profilePicture || ""} 
                      alt={`${mentor.firstName} ${mentor.lastName}`} 
                    />
                    <AvatarFallback>
                      {getInitials(mentor.firstName, mentor.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-slate-900">
                      {mentor.firstName} {mentor.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {mentor.position} • Class of {mentor.graduationYear}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500 italic">
                You don't have any mentors yet. Find a mentor below!
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-800 mb-2">Current Mentees</h3>
            <div className="text-sm text-slate-500 italic">
              You're not mentoring anyone yet. Consider becoming a mentor!
            </div>
          </div>
          
          <Link href="/mentorship">
            <Button className="w-full">
              Find a Mentor
            </Button>
          </Link>
          
          <Link href="/mentorship?become=true">
            <Button 
              variant="outline" 
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
            >
              Become a Mentor
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
