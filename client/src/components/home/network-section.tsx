import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";

export default function NetworkSection() {
  const [activeTab, setActiveTab] = useState("recent");
  
  const { data: connections = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/search"],
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="px-6 py-5 border-b border-slate-200">
        <CardTitle className="text-xl font-bold text-slate-800">Your Network</CardTitle>
      </CardHeader>
      
      {/* Network Tabs */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="sm:hidden">
          <select 
            className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="recent">Recent Connections</option>
            <option value="suggested">Suggested Connections</option>
            <option value="mentors">Your Mentors</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <Tabs defaultValue="recent" onValueChange={setActiveTab}>
            <TabsList className="border-b border-slate-200 w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger 
                value="recent"
                className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
              >
                Recent Connections
              </TabsTrigger>
              <TabsTrigger 
                value="suggested"
                className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
              >
                Suggested Connections
              </TabsTrigger>
              <TabsTrigger 
                value="mentors"
                className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
              >
                Your Mentors
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="mt-0">
              {/* Network list content is below */}
            </TabsContent>
            <TabsContent value="suggested" className="mt-0">
              {/* Suggested connections would go here */}
            </TabsContent>
            <TabsContent value="mentors" className="mt-0">
              {/* Mentors would go here */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Network List */}
      <CardContent className="px-6 py-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No connections found. Start networking!
          </div>
        ) : (
          connections.slice(0, 3).map((connection) => (
            <div key={connection.id} className="flex items-center py-3 border-b border-slate-200 last:border-0">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={connection.profilePicture || ""} 
                  alt={`${connection.firstName} ${connection.lastName}`} 
                />
                <AvatarFallback>
                  {getInitials(connection.firstName, connection.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">
                      {connection.firstName} {connection.lastName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {connection.position} at {connection.company} • Class of {connection.graduationYear}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                  >
                    Message
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        
        <div className="mt-4 text-center">
          <Link href="/network">
            <Button 
              variant="outline" 
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
            >
              View All Connections
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
