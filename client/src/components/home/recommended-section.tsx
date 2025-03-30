import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, Event, Resource } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, FileText } from "lucide-react";
import { format } from "date-fns";

// Mock recommendation function - in a real app, this would be more sophisticated
const getMentorRecommendations = (users: User[], currentUser: User | null) => {
  if (!users.length || !currentUser) return [];
  
  // Simple logic - filter alumni who are not the current user
  return users.filter(u => u.isAlumni && u.id !== currentUser.id).slice(0, 3);
};

export default function RecommendedSection() {
  const { user } = useAuth();
  
  // Get users for mentor recommendations
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users/search"],
  });
  
  // Get upcoming events
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events/upcoming"],
  });
  
  // Get resources
  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources", { limit: 3 }],
  });
  
  const [recommendedMentors, setRecommendedMentors] = useState<User[]>([]);
  
  useEffect(() => {
    if (users.length && user) {
      setRecommendedMentors(getMentorRecommendations(users, user));
    }
  }, [users, user]);

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: Date) => {
    return format(new Date(dateString), "MMMM d, yyyy • h:mm a");
  };

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Recommended for You</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mentor Recommendation */}
        {recommendedMentors.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={recommendedMentors[0].profilePicture || ""} alt={`${recommendedMentors[0].firstName} ${recommendedMentors[0].lastName}`} />
                  <AvatarFallback>{getInitials(`${recommendedMentors[0].firstName} ${recommendedMentors[0].lastName}`)}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">
                    {recommendedMentors[0].firstName} {recommendedMentors[0].lastName}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {recommendedMentors[0].position} at {recommendedMentors[0].company}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {recommendedMentors[0].major && (
                  <Badge variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                    {recommendedMentors[0].major}
                  </Badge>
                )}
                {recommendedMentors[0].graduationYear && (
                  <Badge variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                    Class of {recommendedMentors[0].graduationYear}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Connect with {recommendedMentors[0].firstName} to get career advice and industry insights.
              </p>
              <Button className="w-full">Connect</Button>
            </CardContent>
          </Card>
        )}

        {/* Event Recommendation */}
        {events.length > 0 && (
          <Card className="overflow-hidden">
            <div className="h-48 w-full bg-primary-100"></div>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-slate-900">{events[0].title}</h3>
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                  {events[0].isVirtual ? "Virtual" : "In-Person"}
                </Badge>
              </div>
              <div className="text-sm text-slate-500 mb-3">
                <div className="flex items-center mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(events[0].date)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{events[0].location || events[0].meetingLink}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">{events[0].description}</p>
              <Button className="w-full">RSVP</Button>
            </CardContent>
          </Card>
        )}

        {/* Resource Recommendation */}
        {resources.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-primary-100">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-slate-900">{resources[0].title}</h3>
                    <p className="text-sm text-slate-500">Shared by Career Services</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">{resources[0].description}</p>
              <Button className="w-full" asChild>
                <a href={resources[0].url} target="_blank" rel="noopener noreferrer">
                  {resources[0].type === 'document' ? 'Download' : 
                   resources[0].type === 'video' ? 'Watch' : 
                   resources[0].type === 'job' ? 'Apply' : 'View'}
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
