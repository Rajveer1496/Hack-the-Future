import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge, UserBadge } from "@shared/schema";
import { BadgeCollection } from "@/components/ui/badge-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Award, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BadgeSectionProps {
  userId: number;
  isCurrentUser: boolean;
}

export function BadgeSection({ userId, isCurrentUser }: BadgeSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("earned");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user badges
  const { 
    data: userBadges,
    isLoading: badgesLoading,
    error: badgesError,
  } = useQuery<
    Array<UserBadge & { badge: Badge }>
  >({
    queryKey: ['/api/user-badges', userId],
    enabled: !!userId,
  });

  // Mutation to toggle badge highlight status
  const toggleHighlightMutation = useMutation({
    mutationFn: async ({ badgeId, highlighted }: { badgeId: number; highlighted: boolean }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/user-badges/${badgeId}`, 
        { highlighted }
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the user badges query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/user-badges', userId] });
      toast({
        title: "Badge updated",
        description: "Your badge highlight preferences have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update badge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleHighlight = (badgeId: number, highlighted: boolean) => {
    toggleHighlightMutation.mutate({ badgeId, highlighted });
  };

  // Process badge data for different tabs
  const earnedBadges = userBadges?.map(ub => ({
    ...ub.badge,
    earnedAt: new Date(ub.earnedAt),
    highlighted: ub.highlighted,
  })) || [];

  const highlightedBadges = earnedBadges.filter(badge => badge.highlighted);

  // Show error if there was one
  if (badgesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center py-4">
            Error loading badges. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (badgesLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5" />
          Achievements
        </CardTitle>
        <CardDescription>
          {isCurrentUser 
            ? "View and manage your earned badges and achievements" 
            : "View earned badges and achievements"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="earned" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="earned" className="flex items-center justify-center">
              <Star className="mr-2 h-4 w-4" />
              All Badges ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="highlighted" className="flex items-center justify-center">
              <User className="mr-2 h-4 w-4" />
              Highlighted ({highlightedBadges.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="earned" className="mt-0">
              <BadgeCollection
                badges={earnedBadges}
                size="md"
                showDetails={true}
                interactive={isCurrentUser}
                onHighlight={isCurrentUser ? handleToggleHighlight : undefined}
                emptyMessage="No badges earned yet. Participate in events and connect with others to earn badges!"
              />
            </TabsContent>
            
            <TabsContent value="highlighted" className="mt-0">
              <BadgeCollection
                badges={highlightedBadges}
                size="md"
                showDetails={true}
                interactive={isCurrentUser}
                onHighlight={isCurrentUser ? handleToggleHighlight : undefined}
                emptyMessage={
                  isCurrentUser
                    ? "No badges highlighted. Highlight badges to showcase them on your profile!"
                    : "No badges highlighted."
                }
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}