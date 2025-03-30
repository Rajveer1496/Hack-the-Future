import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Resource } from "@shared/schema";
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent 
} from "@/components/ui/card";
import { FileText, Video, Briefcase } from "lucide-react";
import { format } from "date-fns";

export default function ResourcesCard() {
  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources", { limit: 3 }],
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
      default:
        return <FileText className="h-6 w-6 text-primary" />;
    }
  };

  const getResourceAction = (type: string) => {
    switch (type) {
      case "document":
        return "Download PDF";
      case "video":
        return "Watch Video";
      case "job":
        return "View Listings";
      default:
        return "View Resource";
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="px-6 py-5 border-b border-slate-200 flex-row justify-between items-center">
        <CardTitle className="text-lg font-bold text-slate-800">Latest Resources</CardTitle>
        <Link href="/resources">
          <a className="text-sm font-medium text-primary hover:text-primary-600">
            View All
          </a>
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-4 text-slate-500">
            No resources available yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {resources.map((resource) => (
              <li key={resource.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary-100 text-primary">
                      {getResourceIcon(resource.type)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-slate-900">{resource.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Shared by Career Services • {formatDate(resource.createdAt)}
                    </p>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 text-xs font-medium text-primary hover:text-primary-600"
                    >
                      {getResourceAction(resource.type)}
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
