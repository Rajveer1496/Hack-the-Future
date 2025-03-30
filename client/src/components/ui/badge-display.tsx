import React from "react";
import { Badge as BadgeType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Award, Calendar, Info, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface BadgeProps {
  badge: BadgeType;
  size?: "sm" | "md" | "lg";
  className?: string;
  highlighted?: boolean;
  showDetails?: boolean;
  earnedAt?: Date;
  interactive?: boolean;
  onHighlight?: (badgeId: number, highlighted: boolean) => void;
}

export function BadgeDisplay({
  badge,
  size = "md",
  className,
  highlighted = false,
  showDetails = false,
  earnedAt,
  interactive = false,
  onHighlight,
}: BadgeProps) {
  // Determine size dimensions
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  // Styles for the badge icon container
  const containerClasses = cn(
    "rounded-full flex items-center justify-center relative cursor-default",
    sizeClasses[size],
    highlighted ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
    interactive ? "cursor-pointer hover:brightness-90 transition-all" : "",
    className
  );

  // Get appropriate icon size based on badge size
  const getIconSize = () => {
    switch (size) {
      case "sm": return 16;
      case "lg": return 36;
      default: return 24;
    }
  };

  // Determine badge color based on its tier or type
  const getBadgeColor = (badge: BadgeType) => {
    switch (badge.tier) {
      case "gold": return "bg-amber-100 border-amber-500 text-amber-800";
      case "silver": return "bg-slate-100 border-slate-400 text-slate-800";
      case "bronze": return "bg-orange-100 border-orange-500 text-orange-800";
      default: return "bg-blue-100 border-blue-500 text-blue-800";
    }
  };

  // Format the date
  const formattedDate = earnedAt ? format(earnedAt, "MMM d, yyyy") : "";

  const badgeElement = (
    <div
      className={cn(
        containerClasses,
        getBadgeColor(badge),
        "border-2"
      )}
      role={interactive ? "button" : "presentation"}
      onClick={interactive && onHighlight ? () => onHighlight(badge.id, !highlighted) : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <Award size={getIconSize()} />
      {highlighted && (
        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
          <Star size={size === "sm" ? 10 : 12} fill="currentColor" />
        </div>
      )}
    </div>
  );

  // If no details are to be shown, just return the badge
  if (!showDetails) {
    return badgeElement;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeElement}
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="max-w-xs">
            <div className="space-y-1 text-center">
              <p className="font-semibold">{badge.name}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
              {earnedAt && (
                <p className="text-xs flex items-center justify-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Earned on {formattedDate}
                </p>
              )}
              {badge.criteria && (
                <p className="text-xs flex items-center justify-center mt-1">
                  <Info className="h-3 w-3 mr-1" />
                  {badge.criteria}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="text-center">
        <p className="text-xs font-medium truncate max-w-[100px]">{badge.name}</p>
        {earnedAt && (
          <p className="text-[10px] text-muted-foreground flex items-center justify-center">
            <Calendar className="h-2 w-2 mr-0.5" />
            {format(earnedAt, "MMM yyyy")}
          </p>
        )}
      </div>
    </div>
  );
}

interface BadgeCollectionProps {
  badges: Array<BadgeType & { earnedAt?: Date; highlighted?: boolean }>;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  interactive?: boolean;
  onHighlight?: (badgeId: number, highlighted: boolean) => void;
  emptyMessage?: string;
}

export function BadgeCollection({
  badges,
  size = "md",
  showDetails = false,
  interactive = false,
  onHighlight,
  emptyMessage = "No badges to display",
}: BadgeCollectionProps) {
  if (badges.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Award className="mx-auto h-10 w-10 opacity-20 mb-2" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
      {badges.map((badge) => (
        <BadgeDisplay
          key={badge.id}
          badge={badge}
          size={size}
          highlighted={badge.highlighted}
          showDetails={showDetails}
          earnedAt={badge.earnedAt}
          interactive={interactive}
          onHighlight={onHighlight}
        />
      ))}
    </div>
  );
}

export function BadgeSkeleton({ count = 3, size = "md" }: { count?: number; size?: "sm" | "md" | "lg" }) {
  // Determine size dimensions
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  return (
    <div className="flex flex-wrap gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Skeleton className={cn("rounded-full", sizeClasses[size])} />
          <Skeleton className="h-3 w-16" />
          {size !== "sm" && <Skeleton className="h-2 w-12" />}
        </div>
      ))}
    </div>
  );
}