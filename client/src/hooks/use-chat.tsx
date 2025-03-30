import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@shared/schema";

type ChatStatus = "disconnected" | "connecting" | "connected" | "error";

type ChatContextType = {
  status: ChatStatus;
  sendMessage: (receiverId: number, content: string) => Promise<boolean>;
  messages: Record<number, Message[]>; // Key is user ID (conversation partner)
  connect: () => void;
  disconnect: () => void;
};

export const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<ChatStatus>("disconnected");
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const connect = () => {
    if (!user) {
      return;
    }

    setStatus("connecting");
    
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log("WebSocket connected");
      setStatus("connected");
      
      // Send authentication message
      newSocket.send(JSON.stringify({ 
        type: "authenticate", 
        userId: user.id 
      }));
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "message") {
          const message = data.message as Message;
          const partnerId = message.senderId === user.id 
            ? message.receiverId 
            : message.senderId;
          
          setMessages(prev => {
            const conversationMessages = [...(prev[partnerId] || []), message];
            // Sort by createdAt
            conversationMessages.sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            
            return {
              ...prev,
              [partnerId]: conversationMessages
            };
          });
        }
        
        if (data.type === "history") {
          const history = data.messages as Message[];
          
          // Group messages by conversation partner
          const messagesByPartner: Record<number, Message[]> = {};
          
          history.forEach(message => {
            const partnerId = message.senderId === user.id 
              ? message.receiverId 
              : message.senderId;
            
            if (!messagesByPartner[partnerId]) {
              messagesByPartner[partnerId] = [];
            }
            
            messagesByPartner[partnerId].push(message);
          });
          
          // Sort each conversation by createdAt
          Object.keys(messagesByPartner).forEach(key => {
            messagesByPartner[Number(key)].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
          
          setMessages(messagesByPartner);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("error");
      toast({
        title: "Chat Connection Error",
        description: "Failed to connect to chat server. Please try again later.",
        variant: "destructive",
      });
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
      setStatus("disconnected");
    };

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const sendMessage = async (receiverId: number, content: string): Promise<boolean> => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !user) {
      toast({
        title: "Cannot Send Message",
        description: "You are not connected to the chat server.",
        variant: "destructive",
      });
      return false;
    }

    try {
      socket.send(JSON.stringify({
        type: "message",
        message: {
          senderId: user.id,
          receiverId,
          content,
        },
      }));
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Message Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Clean up on unmount or user change
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [user?.id]);

  return (
    <ChatContext.Provider
      value={{
        status,
        sendMessage,
        messages,
        connect,
        disconnect,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}