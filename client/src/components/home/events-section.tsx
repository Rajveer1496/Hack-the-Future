import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Event } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Video } from "lucide-react";
import { format } from "date-fns";

export default function EventsSection() {
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events/upcoming"],
  });

  const formatEventDate = (date: Date) => {
    return format(new Date(date), "MMMM d, yyyy • h:mm a");
  };

  const handleRSVP = (eventId: number) => {
    // In a real app, this would make an API call to register attendance
    console.log(`RSVP to event ${eventId}`);
  };

  const handleShare = (eventId: number) => {
    // In a real app, this would open a share dialog
    console.log(`Share event ${eventId}`);
  };

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-slate-200 flex-row justify-between items-center">
        <CardTitle className="text-xl font-bold text-slate-800">Upcoming Events</CardTitle>
        <Link href="/events">
          <a className="text-sm font-medium text-primary hover:text-primary-600">
            View Calendar
          </a>
        </Link>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No upcoming events at this time.
          </div>
        ) : (
          <div className="overflow-hidden">
            {events.slice(0, 2).map((event) => (
              <div key={event.id} className="px-6 py-5 border-b border-slate-200 last:border-0">
                <div className="sm:flex sm:items-start sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center">
                      <div className="rounded-md bg-primary-100 p-2">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-slate-900">{event.title}</h3>
                        <div className="mt-1 flex items-center">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-500">{formatEventDate(event.date)}</span>
                        </div>
                        <div className="mt-1 flex items-center">
                          {event.isVirtual ? (
                            <>
                              <Video className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-500" />
                              <span className="text-sm text-slate-500">Virtual Event (Zoom)</span>
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
                    <Button onClick={() => handleRSVP(event.id)}>
                      RSVP
                    </Button>
                    <Button 
                      variant="outline" 
                      className="inline-flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                      onClick={() => handleShare(event.id)}
                    >
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
  );
}
