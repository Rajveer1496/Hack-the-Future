import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Mentorship, InsertMentorship } from "@shared/schema";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  UserPlus, 
  UserCheck,
  MessageSquare,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MentorshipPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const becomeMentor = searchParams.get("become") === "true";
  const [isMentorMode, setIsMentorMode] = useState(becomeMentor);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Get all users who could be mentors
  const { data: potentialMentors = [], isLoading: mentorsLoading } = useQuery<User[]>({
    queryKey: ["/api/users/search"],
  });
  
  // Get mentorships where user is mentee
  const { data: menteeMentorships = [], isLoading: menteeLoading } = useQuery<Mentorship[]>({
    queryKey: ["/api/users", user?.id, "mentorships", { role: "mentee" }],
    enabled: !!user,
  });
  
  // Get mentorships where user is mentor
  const { data: mentorMentorships = [], isLoading: mentorLoading } = useQuery<Mentorship[]>({
    queryKey: ["/api/users", user?.id, "mentorships", { role: "mentor" }],
    enabled: !!user,
  });
  
  // Mutation for creating a mentorship
  const mentorshipMutation = useMutation({
    mutationFn: async (mentorship: InsertMentorship) => {
      const res = await apiRequest("POST", "/api/mentorships", mentorship);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "mentorships"] });
      toast({
        title: "Success!",
        description: "Mentorship request has been sent.",
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to request mentorship",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating mentorship status
  const updateMentorshipMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/mentorships/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "mentorships"] });
      toast({
        title: "Success!",
        description: "Mentorship status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update mentorship",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter mentors based on search query
  const filteredMentors = potentialMentors.filter(mentor => {
    if (mentor.id === user?.id) return false; // Don't show the current user
    if (!mentor.isAlumni) return false; // Only show alumni as potential mentors
    if (!searchQuery) return true;
    
    return (
      mentor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mentor.company && mentor.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (mentor.position && mentor.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (mentor.major && mentor.major.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  
  // Get all active mentors for the current user
  const activeMentors = potentialMentors.filter(mentor => 
    menteeMentorships.some(m => m.mentorId === mentor.id && m.status === "active")
  );
  
  // Get all active mentees for the current user
  const activeMentees = potentialMentors.filter(mentee => 
    mentorMentorships.some(m => m.menteeId === mentee.id && m.status === "active")
  );
  
  // Get pending mentorship requests (both as mentor and mentee)
  const pendingRequests = [
    ...menteeMentorships.filter(m => m.status === "pending"),
    ...mentorMentorships.filter(m => m.status === "pending")
  ];
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled by the state filter
  };
  
  const handleRequestMentor = (mentor: User) => {
    setSelectedUser(mentor);
    setIsDialogOpen(true);
  };
  
  const confirmMentorRequest = () => {
    if (!user || !selectedUser) return;
    
    const mentorship: InsertMentorship = {
      mentorId: selectedUser.id,
      menteeId: user.id,
      status: "pending"
    };
    
    mentorshipMutation.mutate(mentorship);
  };
  
  const acceptMentorship = (mentorshipId: number) => {
    updateMentorshipMutation.mutate({ id: mentorshipId, status: "active" });
  };
  
  const declineMentorship = (mentorshipId: number) => {
    updateMentorshipMutation.mutate({ id: mentorshipId, status: "declined" });
  };
  
  const isRequested = (mentorId: number) => {
    return menteeMentorships.some(m => m.mentorId === mentorId && m.status === "pending");
  };
  
  const isMentoring = (mentorId: number) => {
    return menteeMentorships.some(m => m.mentorId === mentorId && m.status === "active");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Mentorship</h1>
              <p className="text-slate-500 mt-1">
                Connect with mentors or become a mentor to help others
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <Label htmlFor="mentor-toggle" className={isMentorMode ? "text-primary" : "text-slate-500"}>
                Become a Mentor
              </Label>
              <Switch
                id="mentor-toggle"
                checked={isMentorMode}
                onCheckedChange={setIsMentorMode}
              />
            </div>
          </div>
          
          {isMentorMode ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <Card>
                  <CardHeader className="px-6 py-5 border-b border-slate-200">
                    <CardTitle className="text-xl font-bold text-slate-800">Become a Mentor</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <p>
                        Mentoring is a rewarding way to give back to your community and help guide the next generation of professionals.
                        As a mentor, you'll have the opportunity to share your knowledge, provide career advice, and make a meaningful
                        impact on a student's journey.
                      </p>
                      
                      <h3>Benefits of becoming a mentor:</h3>
                      <ul>
                        <li>Share your expertise and industry knowledge</li>
                        <li>Develop your leadership and coaching skills</li>
                        <li>Expand your professional network</li>
                        <li>Make a positive impact on someone's career</li>
                        <li>Gain fresh perspectives from the next generation</li>
                      </ul>
                      
                      <h3>What's expected of mentors:</h3>
                      <ul>
                        <li>Commit to regular communication with your mentee</li>
                        <li>Provide guidance based on your professional experience</li>
                        <li>Help mentees set and achieve realistic goals</li>
                        <li>Share constructive feedback and advice</li>
                        <li>Maintain a professional relationship</li>
                      </ul>
                    </div>
                    
                    {user?.isAlumni ? (
                      <div className="mt-6">
                        <Button className="w-full sm:w-auto">Update Mentorship Profile</Button>
                      </div>
                    ) : (
                      <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                        <p className="text-yellow-800">
                          Only alumni can become mentors. If you're an alumnus and your profile doesn't reflect this,
                          please update your profile information.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {user?.isAlumni && (
                  <Card className="mt-6">
                    <CardHeader className="px-6 py-5 border-b border-slate-200">
                      <CardTitle className="text-xl font-bold text-slate-800">Your Mentees</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {mentorLoading ? (
                        <div className="flex justify-center items-center py-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : activeMentees.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-slate-500">You don't have any active mentees yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeMentees.map(mentee => (
                            <div key={mentee.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                              <div className="flex items-center">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage 
                                    src={mentee.profilePicture || ""} 
                                    alt={`${mentee.firstName} ${mentee.lastName}`} 
                                  />
                                  <AvatarFallback>
                                    {getInitials(mentee.firstName, mentee.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="ml-4">
                                  <h3 className="text-lg font-medium text-slate-900">
                                    {mentee.firstName} {mentee.lastName}
                                  </h3>
                                  <p className="text-sm text-slate-500">
                                    {mentee.major || "Student"} • Class of {mentee.graduationYear || "N/A"}
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="flex items-center">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="lg:col-span-4">
                <Card>
                  <CardHeader className="px-6 py-5 border-b border-slate-200">
                    <CardTitle className="text-lg font-bold text-slate-800">Pending Requests</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {mentorLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : pendingRequests.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-slate-500">No pending mentorship requests.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingRequests.map(request => {
                          const isIncomingRequest = request.mentorId === user?.id;
                          const otherPersonId = isIncomingRequest ? request.menteeId : request.mentorId;
                          const otherPerson = potentialMentors.find(u => u.id === otherPersonId);
                          
                          if (!otherPerson) return null;
                          
                          return (
                            <div key={request.id} className="p-4 border rounded-lg bg-white shadow-sm">
                              <div className="flex items-center mb-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage 
                                    src={otherPerson.profilePicture || ""} 
                                    alt={`${otherPerson.firstName} ${otherPerson.lastName}`} 
                                  />
                                  <AvatarFallback>
                                    {getInitials(otherPerson.firstName, otherPerson.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-slate-900">
                                    {otherPerson.firstName} {otherPerson.lastName}
                                  </h3>
                                  <p className="text-xs text-slate-500">
                                    {isIncomingRequest ? "Requesting you as a mentor" : "Pending mentor request"}
                                  </p>
                                </div>
                              </div>
                              
                              {isIncomingRequest && (
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => acceptMentorship(request.id)}
                                    disabled={updateMentorshipMutation.isPending}
                                  >
                                    {updateMentorshipMutation.isPending && (
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    )}
                                    Accept
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => declineMentorship(request.id)}
                                    disabled={updateMentorshipMutation.isPending}
                                  >
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <Card className="mb-6">
                  <CardHeader className="px-6 py-5 border-b border-slate-200">
                    <CardTitle className="text-lg font-bold text-slate-800">Your Mentors</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {menteeLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : activeMentors.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-slate-500">You don't have any mentors yet. Find a mentor below!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeMentors.map(mentor => (
                          <div key={mentor.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12">
                                <AvatarImage 
                                  src={mentor.profilePicture || ""} 
                                  alt={`${mentor.firstName} ${mentor.lastName}`} 
                                />
                                <AvatarFallback>
                                  {getInitials(mentor.firstName, mentor.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <h3 className="text-lg font-medium text-slate-900">
                                  {mentor.firstName} {mentor.lastName}
                                </h3>
                                <p className="text-sm text-slate-500">
                                  {mentor.position} at {mentor.company}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="flex items-center">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {pendingRequests.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-slate-800 mb-2">Pending Requests</h3>
                        <div className="space-y-2">
                          {pendingRequests.filter(r => r.menteeId === user?.id).map(request => {
                            const mentor = potentialMentors.find(u => u.id === request.mentorId);
                            if (!mentor) return null;
                            
                            return (
                              <div key={request.id} className="flex items-center justify-between px-3 py-2 bg-yellow-50 rounded text-sm">
                                <span className="text-yellow-800">
                                  Request to {mentor.firstName} {mentor.lastName} pending
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="px-6 py-5 border-b border-slate-200">
                    <CardTitle className="text-lg font-bold text-slate-800">Find a Mentor</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                          type="text"
                          placeholder="Search by name, company, expertise..."
                          className="pl-10 w-full"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="mt-2 w-full">
                        Search
                      </Button>
                    </form>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-800 mb-2">Suggested Expertise</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary-50"
                          onClick={() => setSearchQuery("Software Engineering")}
                        >
                          Software Engineering
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary-50"
                          onClick={() => setSearchQuery("Marketing")}
                        >
                          Marketing
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary-50"
                          onClick={() => setSearchQuery("Finance")}
                        >
                          Finance
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary-50"
                          onClick={() => setSearchQuery("Product Management")}
                        >
                          Product Management
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-8">
                <Card>
                  <CardHeader className="px-6 py-5 border-b border-slate-200">
                    <CardTitle className="text-xl font-bold text-slate-800">Available Mentors</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {mentorsLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : filteredMentors.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-slate-500 mb-4">No mentors found matching your criteria.</p>
                        <Button variant="outline" onClick={() => setSearchQuery("")}>
                          Clear Search
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {filteredMentors.slice(0, 6).map((mentor) => (
                          <div key={mentor.id} className="flex flex-col sm:flex-row sm:items-center p-6 border rounded-lg bg-white shadow-sm">
                            <div className="flex items-center mb-4 sm:mb-0">
                              <Avatar className="h-12 w-12">
                                <AvatarImage 
                                  src={mentor.profilePicture || ""} 
                                  alt={`${mentor.firstName} ${mentor.lastName}`} 
                                />
                                <AvatarFallback>
                                  {getInitials(mentor.firstName, mentor.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <h3 className="text-lg font-medium text-slate-900">
                                  {mentor.firstName} {mentor.lastName}
                                </h3>
                                <p className="text-sm text-slate-500">
                                  {mentor.position} at {mentor.company}
                                </p>
                                {mentor.major && (
                                  <p className="text-sm text-slate-500">
                                    Major: {mentor.major}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="sm:ml-auto flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                              {isMentoring(mentor.id) ? (
                                <Button 
                                  variant="outline" 
                                  className="flex items-center"
                                  disabled
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                  Current Mentor
                                </Button>
                              ) : isRequested(mentor.id) ? (
                                <Button 
                                  variant="outline" 
                                  className="flex items-center"
                                  disabled
                                >
                                  Request Pending
                                </Button>
                              ) : (
                                <Button 
                                  className="flex items-center"
                                  onClick={() => handleRequestMentor(mentor)}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Request as Mentor
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      {/* Mentorship Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              You're requesting {selectedUser?.firstName} {selectedUser?.lastName} to be your mentor.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-4 py-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={selectedUser?.profilePicture || ""} 
                alt={`${selectedUser?.firstName} ${selectedUser?.lastName}`} 
              />
              <AvatarFallback>
                {selectedUser ? getInitials(selectedUser.firstName, selectedUser.lastName) : "??"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium text-slate-900">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </h3>
              <p className="text-sm text-slate-500">
                {selectedUser?.position} at {selectedUser?.company}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Add a personalized message (optional)</Label>
              <textarea
                id="message"
                className="mt-1 block w-full p-2 border border-slate-300 rounded-md text-sm"
                rows={3}
                placeholder="Explain why you'd like them to be your mentor and what you hope to learn."
              ></textarea>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmMentorRequest}
              disabled={mentorshipMutation.isPending}
            >
              {mentorshipMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
