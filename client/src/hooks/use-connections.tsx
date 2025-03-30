import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Connection } from "@shared/schema";
import { useToast } from "./use-toast";

export type ConnectionWithUser = Connection & { 
  user: { 
    id: number; 
    username: string; 
    fullName: string; 
    email: string; 
    avatar?: string; 
    bio?: string; 
    graduationYear?: number; 
    company?: string; 
    jobTitle?: string; 
    location?: string; 
    linkedin?: string; 
    twitter?: string; 
    github?: string; 
    website?: string; 
    isAdmin?: boolean; 
    isVerified: boolean; 
    isMentor: boolean; 
  }
};

export function useConnections(status?: string) {
  const queryKey = status 
    ? ['/api/connections', { status }] 
    : ['/api/connections'];
    
  return useQuery<ConnectionWithUser[]>({
    queryKey,
    queryFn: async () => {
      const url = status 
        ? `/api/connections?status=${status}` 
        : '/api/connections';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch connections');
      }
      return res.json();
    }
  });
}

export function useConnection(id: number) {
  return useQuery<Connection>({
    queryKey: ['/api/connections', id],
    queryFn: async () => {
      const res = await fetch(`/api/connections/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch connection');
      }
      return res.json();
    },
    enabled: !!id
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (receiverId: number) => {
      const res = await apiRequest('POST', '/api/connections', { receiverId });
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.message === "Connection already exists") {
          return errorData.connection;
        }
        throw new Error(errorData.message || 'Failed to create connection');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Request Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useUpdateConnectionStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'accepted' | 'rejected' }) => {
      const res = await apiRequest('PATCH', `/api/connections/${id}`, { status });
      if (!res.ok) {
        throw new Error('Failed to update connection status');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      toast({
        title: variables.status === 'accepted' ? "Connection Accepted" : "Connection Rejected",
        description: variables.status === 'accepted' 
          ? "You are now connected with this user." 
          : "You have rejected this connection request.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Connection",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}