import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Resource } from "@shared/schema";
import { format } from "date-fns";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Video, 
  Briefcase, 
  Link as LinkIcon, 
  Download, 
  Search, 
  Plus,
  ChevronDown,
  Loader2
} from "lucide-react";

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceType, setResourceType] = useState<string | null>(null);
  
  // Get all resources
  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources", { type: resourceType }],
  });
  
  // Filter resources based on search query
  const filteredResources = resources.filter(resource => {
    if (!searchQuery) return true;
    return (
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMMM d, yyyy");
  };
  
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-6 w-6 text-primary" />;
      case "video":
        return <Video className="h-6 w-6 text-primary" />;
      case "job":
        return <Briefcase className="h-6 w-6 text-primary" />;
      case "link":
        return <LinkIcon className="h-6 w-6 text-primary" />;
      default:
        return <FileText className="h-6 w-6 text-primary" />;
    }
  };
  
  const getResourceAction = (type: string) => {
    switch (type) {
      case "document":
        return "Download";
      case "video":
        return "Watch";
      case "job":
        return "Apply";
      case "link":
        return "Visit";
      default:
        return "View";
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled by the state filter
  };
  
  const handleTypeFilter = (type: string | null) => {
    setResourceType(type);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Resources</h1>
              <p className="text-slate-500 mt-1">
                Access valuable resources shared by alumni and the university
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search resources..."
                    className="pl-10 w-full md:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="ml-2">
                  Search
                </Button>
              </form>
              
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Share Resource
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader className="px-6 py-5 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <Tabs defaultValue="all" onValueChange={(value) => handleTypeFilter(value === "all" ? null : value)}>
                  <TabsList className="border-b border-slate-200 w-full justify-start rounded-none bg-transparent p-0">
                    <TabsTrigger 
                      value="all"
                      className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
                    >
                      All Resources
                    </TabsTrigger>
                    <TabsTrigger 
                      value="document"
                      className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
                    >
                      Documents
                    </TabsTrigger>
                    <TabsTrigger 
                      value="job"
                      className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
                    >
                      Job Opportunities
                    </TabsTrigger>
                    <TabsTrigger 
                      value="video"
                      className="border-primary text-primary data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 rounded-none bg-transparent"
                    >
                      Videos
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="mt-4 sm:mt-0">
                    <Button variant="outline" className="ml-auto">
                      Sort by
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Newest First</DropdownMenuItem>
                    <DropdownMenuItem>Oldest First</DropdownMenuItem>
                    <DropdownMenuItem>Alphabetical</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">No resources found matching your criteria.</p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setResourceType(null);
                  }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <Card key={resource.id} className="h-full flex flex-col">
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center mb-4">
                          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary-100">
                            {getResourceIcon(resource.type)}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-slate-900 line-clamp-1">{resource.title}</h3>
                            <p className="text-sm text-slate-500">Shared on {formatDate(resource.createdAt)}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 flex-1">
                          {resource.description}
                        </p>
                        <div className="mt-auto">
                          <Button className="w-full" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              {resource.type === "document" && <Download className="mr-2 h-4 w-4" />}
                              {getResourceAction(resource.type)}
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
