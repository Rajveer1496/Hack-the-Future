import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, Award, Calendar } from "lucide-react";
import { User } from "@shared/schema";

export function StatsSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading || isLoadingUsers) {
    return (
      <div className="w-full px-4 py-8 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-700 to-indigo-500 text-transparent bg-clip-text">
            Community Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 pb-2">
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="pt-6">
                  <Skeleton className="h-10 w-1/3 mb-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics from users data
  const userArray = Array.isArray(users) ? users : [];
  const totalUsers = userArray.length || 0;
  const mentors = userArray.filter(user => user.isAlumni && !user.isStudent).length || 0;
  const students = userArray.filter(user => user.isStudent).length || 0;
  const alumni = userArray.filter(user => user.isAlumni).length || 0;

  return (
    <div className="w-full px-4 py-8 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-700 to-indigo-500 text-transparent bg-clip-text">
          Community Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Members" 
            value={totalUsers} 
            description="Alumni and students in the community"
            icon={<Users className="h-6 w-6 text-blue-500" />}
          />
          <StatCard 
            title="Mentors" 
            value={mentors} 
            description="Industry professionals available for mentorship"
            icon={<Award className="h-6 w-6 text-indigo-500" />}
          />
          <StatCard 
            title="Students" 
            value={students} 
            description="Current students seeking guidance"
            icon={<GraduationCap className="h-6 w-6 text-emerald-500" />}
          />
          <StatCard 
            title="Alumni" 
            value={alumni} 
            description="Graduates from our institution"
            icon={<Calendar className="h-6 w-6 text-violet-500" />}
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
          <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
        </div>
        <div className="p-2 bg-white rounded-full shadow-sm">{icon}</div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-3xl font-extrabold text-gray-900">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}