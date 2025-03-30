import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Event, EventAttendee, InsertEventAttendee } from "@shared/schema";
import { format } from "date-fns";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Video, 
  Users, 
  Filter,
  Share2,
  Loader2
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  
  // Get all events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  // Get user's event attendances
  const { data: userEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/users", user?.id, "events"],
    enabled: !!user,
  });
  
  // Mutation for RSVP
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number, status: string }) => {
      const attendance: InsertEventAttendee = {
        eventId,
        userId: user!.id,
        status
      };
      const res = await apiRequest("POST", `/api/events/${eventId}/attendees`, attendance);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events"] });
      toast({
        title: "Success!",
        description: "Your RSVP has been recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to RSVP",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating RSVP status
  const updateRsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/events/${eventId}/attendees/${user!.id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events"] });
      toast({
        title: "Success!",
        description: "Your RSVP has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update RSVP",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const now = new Date();
  
  // Filter events based on the selected tab
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    if (filter === "upcoming") {
      return eventDate >= now;
    } else if (filter === "past") {
      return eventDate < now;
    }
    return true;
  });
  
  // Sort events by date - upcoming first
  filteredEvents.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (filter === "past") {
      return dateB.getTime() - dateA.getTime(); // Most recent past events first
    }
    return dateA.getTime() - dateB.getTime(); // Soonest upcoming events first
  });
  
  const formatEventDate = (date: Date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy • h:mm a");
  };
  
  const isAttending = (eventId: number) => {
    return userEvents.some(e => e.id === eventId);
  };
  
  const handleRSVP = (eventId: number) => {
    if (!user) return;
    
    if (isAttending(eventId)) {
      updateRsvpMutation.mutate({ eventId, status: "going" });
    } else {
      rsvpMutation.mutate({ eventId, status: "going" });
    }
  };
  
  const handleShare = (event: Event) => {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.origin + `/events/${event.id}`,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      toast({
        title: "Share",
        description: "Sharing functionality isn't supported in your browser.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Events</h1>
              <p className="text-slate-500 mt-1">
                Connect with alumni and students at these upcoming events
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Add to Calendar
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader className="px-6 py-5 border-b border-slate-200">
              <Tabs defaultValue="upcoming" onValueChange={(value) => setFilter(value as "all" | "upcoming" | "past")}>
                <TabsList className="border-b border-slate-200 w-full justify-start rounded-none bg-transparent p-0">
                  <TabsTrigger 
                    value="upcoming"
                    className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
                  >
                    Upcoming Events
                  </TabsTrigger>
                  <TabsTrigger 
                    value="past"
                    className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
                  >
                    Past Events
                  </TabsTrigger>
                  <TabsTrigger 
                    value="all"
                    className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
                  >
                    All Events
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">No events found for the selected filter.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="p-6">
                      <div className="sm:flex sm:items-start sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                          <div className="flex items-center">
                            <div className="rounded-md bg-primary-100 p-2">
                              <CalendarIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-slate-900">{event.title}</h3>
                                <Badge className={`ml-2 ${event.isVirtual ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'} border-0`}>
                                  {event.isVirtual ? 'Virtual' : 'In-Person'}
                                </Badge>
                              </div>
                              <div className="mt-1 flex items-center">
                                <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-500" />
                                <span className="text-sm text-slate-500">{formatEventDate(event.date)}</span>
                              </div>
                              <div className="mt-1 flex items-center">
                                {event.isVirtual ? (
                                  <>
                                    <Video className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-500" />
                                    <span className="text-sm text-slate-500">
                                      {event.meetingLink || "Virtual Event (link will be provided)"}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-500" />
                                    <span className="text-sm text-slate-500">{event.location}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">{event.description}</p>
                        </div>
                        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                          {new Date(event.date) > now && (
                            <Button 
                              className={isAttending(event.id) ? "bg-green-600 hover:bg-green-700" : ""}
                              onClick={() => handleRSVP(event.id)}
                              disabled={rsvpMutation.isPending || updateRsvpMutation.isPending}
                            >
                              {(rsvpMutation.isPending || updateRsvpMutation.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              {isAttending(event.id) ? (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Going
                                </>
                              ) : (
                                "RSVP"
                              )}
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            className="inline-flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                            onClick={() => handleShare(event)}
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
