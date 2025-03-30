import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, SearchIcon, MessagesSquare, Briefcase, MapPin, GraduationCap } from "lucide-react";
import { ChatDialog } from "@/components/chat/chat-dialog";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ConnectionButton } from "@/components/connection/connection-button";
import { Link } from "wouter";

interface UserItemProps {
  user: Omit<User, "password">;
  currentUserId: number;
  onMentorRequest?: (mentorId: number) => void;
}

function UserItem({ user, currentUserId, onMentorRequest }: UserItemProps) {
  // For simplicity in the UI, use fullName if available, otherwise construct from first/last name
  const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const initials = getInitials(fullName);
  
  function getInitials(name: string) {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <Link to={`/profile/${user.id}`}>
              <div className="flex items-center space-x-3 cursor-pointer">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar || user.profilePicture} alt={fullName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{fullName}</h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
            </Link>
            
            <div className="flex space-x-2">
              <ChatDialog
                recipientId={user.id}
                recipientName={fullName}
                trigger={
                  <Button variant="outline" size="icon">
                    <MessagesSquare className="h-4 w-4" />
                  </Button>
                }
              />
              <ConnectionButton userId={user.id} compact hideTooltip />
            </div>
          </div>
          
          {user.jobTitle && (
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Briefcase className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <span>{user.jobTitle}</span>
            </div>
          )}
          
          {user.company && (
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Briefcase className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <span>{user.company}</span>
            </div>
          )}
          
          {user.location && (
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <span>{user.location}</span>
            </div>
          )}
          
          {user.graduationYear && (
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <span>Class of {user.graduationYear}</span>
            </div>
          )}
        </div>
        
        <div className="border-t px-4 py-3 flex justify-between items-center bg-gray-50">
          {user.isMentor && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600">
              Mentor
            </Badge>
          )}
          
          {user.isAlumni && (
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600">
              Alumni
            </Badge>
          )}
          
          {user.isStudent && (
            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
              Student
            </Badge>
          )}
          
          {onMentorRequest && user.isMentor && user.id !== currentUserId && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onMentorRequest(user.id)}
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              Request Mentorship
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function UserList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  
  const { data: currentUser } = useQuery<Omit<User, "password">>({
    queryKey: ["/api/user"],
  });
  
  const { data: users, isLoading } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });
  
  const handleMentorRequest = async (mentorId: number) => {
    if (!currentUser || isRequesting) return;
    
    setIsRequesting(true);
    try {
      await apiRequest("POST", "/api/mentorships", {
        mentorId,
        menteeId: currentUser.id,
        status: "pending"
      });
      
      setIsRequesting(false);
    } catch (error) {
      console.error("Failed to request mentorship:", error);
      setIsRequesting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Network</CardTitle>
        <CardDescription>Connect with fellow alumni and students</CardDescription>
        <div className="relative mt-4">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, company, position..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !users?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        ) : (
          <div>
            {users.filter(user => user.id !== currentUser?.id).map((user) => (
              <UserItem
                key={user.id}
                user={user}
                currentUserId={currentUser?.id || 0}
                onMentorRequest={handleMentorRequest}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}