import { useState } from "react";
import { useConnections, ConnectionWithUser } from "@/hooks/use-connections";
import { Link } from "wouter";
import { ConnectionButton } from "./connection-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building, 
  MapPin, 
  GraduationCap, 
  Briefcase,
  Search,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";

export function ConnectionsList() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: connections, isLoading } = useConnections();
  
  // Filter connections based on tab and search query
  const filteredConnections = connections?.filter(connection => {
    // Filter by tab
    if (activeTab === "pending" && connection.status !== "pending") return false;
    if (activeTab === "connected" && connection.status !== "accepted") return false;
    
    // Filter by search query
    if (searchQuery && !connection.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  const pendingCount = connections?.filter(conn => conn.status === "pending").length || 0;
  const connectedCount = connections?.filter(conn => conn.status === "accepted").length || 0;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search connections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All
            <Badge variant="outline" className="ml-2">
              {connections?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="outline" className="ml-2">
              {pendingCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="connected">
            Connected
            <Badge variant="outline" className="ml-2">
              {connectedCount}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ConnectionGrid connections={filteredConnections || []} />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <ConnectionGrid 
            connections={filteredConnections || []} 
            emptyMessage="No pending connection requests." 
          />
        </TabsContent>
        
        <TabsContent value="connected" className="mt-6">
          <ConnectionGrid 
            connections={filteredConnections || []} 
            emptyMessage="No connected users yet. Start connecting with alumni and mentors!" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ConnectionGridProps {
  connections: ConnectionWithUser[];
  emptyMessage?: string;
}

function ConnectionGrid({ connections, emptyMessage = "No connections found." }: ConnectionGridProps) {
  if (connections.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((connection) => (
        <ConnectionCard key={connection.id} connection={connection} />
      ))}
    </div>
  );
}

interface ConnectionCardProps {
  connection: ConnectionWithUser;
}

function ConnectionCard({ connection }: ConnectionCardProps) {
  const { user } = connection;
  
  // Get the first letter of the first and last name for the avatar fallback
  const getInitials = () => {
    if (!user.fullName) return "?";
    const parts = user.fullName.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <Link to={`/profile/${user.id}`}>
              <div className="flex items-center space-x-3 cursor-pointer">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{user.fullName}</h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
            </Link>
            
            <ConnectionButton userId={user.id} compact hideTooltip />
          </div>
          
          {user.jobTitle && (
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Briefcase className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <span>{user.jobTitle}</span>
            </div>
          )}
          
          {user.company && (
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Building className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
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
          
          {connection.status === "pending" && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
              {connection.requesterId === user.id ? "Awaiting Your Response" : "Request Sent"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}