import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateConnection, useConnections, useUpdateConnectionStatus } from "@/hooks/use-connections";
import { useAuth } from "@/hooks/use-auth";
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock, 
  Loader2, 
  Check, 
  X 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConnectionButtonProps {
  userId: number;
  hideTooltip?: boolean;
  compact?: boolean;
  className?: string;
}

export function ConnectionButton({ userId, hideTooltip = false, compact = false, className = "" }: ConnectionButtonProps) {
  const { user } = useAuth();
  const { data: connections, isLoading: isLoadingConnections } = useConnections();
  const createConnectionMutation = useCreateConnection();
  const updateConnectionStatusMutation = useUpdateConnectionStatus();
  
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending-outgoing' | 'pending-incoming' | 'connected' | 'rejected'>('none');
  const [connectionId, setConnectionId] = useState<number | null>(null);
  
  // Don't show connection button for your own profile
  if (user?.id === userId) {
    return null;
  }
  
  // Determine connection status
  useEffect(() => {
    if (!connections) return;
    
    const connection = connections.find(conn => 
      (conn.requesterId === userId && conn.receiverId === user?.id) || 
      (conn.receiverId === userId && conn.requesterId === user?.id)
    );
    
    if (!connection) {
      setConnectionStatus('none');
      setConnectionId(null);
      return;
    }
    
    setConnectionId(connection.id);
    
    if (connection.status === 'accepted') {
      setConnectionStatus('connected');
    } else if (connection.status === 'rejected') {
      setConnectionStatus('rejected');
    } else if (connection.requesterId === user?.id) {
      setConnectionStatus('pending-outgoing');
    } else {
      setConnectionStatus('pending-incoming');
    }
  }, [connections, userId, user?.id]);
  
  // Handle connect button click
  const handleConnect = () => {
    createConnectionMutation.mutate(userId);
  };
  
  // Handle accept/reject connection
  const handleAccept = () => {
    if (connectionId) {
      updateConnectionStatusMutation.mutate({ id: connectionId, status: 'accepted' });
    }
  };
  
  const handleReject = () => {
    if (connectionId) {
      updateConnectionStatusMutation.mutate({ id: connectionId, status: 'rejected' });
    }
  };
  
  if (isLoadingConnections || !user) {
    return (
      <Button disabled className={className} size={compact ? "sm" : "default"}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading
      </Button>
    );
  }
  
  // Render button based on connection status
  const renderButton = () => {
    switch (connectionStatus) {
      case 'none':
        return (
          <Button 
            onClick={handleConnect} 
            className={className}
            size={compact ? "sm" : "default"}
            disabled={createConnectionMutation.isPending}
          >
            {createConnectionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            {compact ? "" : "Connect"}
          </Button>
        );
        
      case 'pending-outgoing':
        return (
          <Button 
            variant="outline" 
            className={className}
            size={compact ? "sm" : "default"}
            disabled
          >
            <Clock className="h-4 w-4 mr-2" />
            {compact ? "" : "Request Sent"}
          </Button>
        );
        
      case 'pending-incoming':
        return (
          <div className="flex space-x-2">
            <Button 
              onClick={handleAccept} 
              variant="outline"
              className={className}
              size={compact ? "sm" : "default"}
              disabled={updateConnectionStatusMutation.isPending}
            >
              {updateConnectionStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {compact ? "" : "Accept"}
            </Button>
            <Button 
              onClick={handleReject} 
              variant="outline"
              className={`text-red-500 hover:text-red-600 ${className}`}
              size={compact ? "sm" : "default"}
              disabled={updateConnectionStatusMutation.isPending}
            >
              {updateConnectionStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              {compact ? "" : "Reject"}
            </Button>
          </div>
        );
        
      case 'connected':
        return (
          <Button 
            variant="outline" 
            className={`text-green-500 hover:text-green-600 ${className}`}
            size={compact ? "sm" : "default"}
            disabled
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {compact ? "" : "Connected"}
          </Button>
        );
        
      case 'rejected':
        return (
          <Button 
            onClick={handleConnect} 
            variant="outline"
            className={className}
            size={compact ? "sm" : "default"}
          >
            <UserX className="h-4 w-4 mr-2" />
            {compact ? "" : "Reconnect"}
          </Button>
        );
        
      default:
        return null;
    }
  };
  
  if (hideTooltip) {
    return renderButton();
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {renderButton()}
        </TooltipTrigger>
        <TooltipContent>
          {connectionStatus === 'none' && "Send a connection request"}
          {connectionStatus === 'pending-outgoing' && "Your request is pending"}
          {connectionStatus === 'pending-incoming' && "Respond to connection request"}
          {connectionStatus === 'connected' && "You are connected"}
          {connectionStatus === 'rejected' && "Send a new connection request"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}