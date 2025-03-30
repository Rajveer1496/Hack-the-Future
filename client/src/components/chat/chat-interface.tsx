import { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Loader2, SendIcon, MessageSquare } from "lucide-react";
import { Message } from "@shared/schema";
import { format } from "date-fns";

interface ChatInterfaceProps {
  recipientId: number;
  recipientName: string;
}

export function ChatInterface({ recipientId, recipientName }: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const { status, messages, sendMessage, connect } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get the conversation with this recipient
  const conversation = messages[recipientId] || [];

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (status === "disconnected") {
      connect();
    }
  }, [status, connect]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const success = await sendMessage(recipientId, newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  const renderMessage = (msg: Message) => {
    const isSentByCurrentUser = msg.senderId === user?.id;
    const initials = isSentByCurrentUser 
      ? `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`
      : recipientName.split(" ").map(name => name[0]).join("");
    
    return (
      <div
        key={msg.id}
        className={`flex ${isSentByCurrentUser ? "justify-end" : "justify-start"}`}
      >
        {!isSentByCurrentUser && (
          <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
            <AvatarFallback className="bg-slate-200 text-slate-600 font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        <div
          className={`rounded-2xl px-4 py-2 max-w-[75%] shadow-sm ${
            isSentByCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-white border border-slate-200"
          }`}
        >
          <div className="break-words">{msg.content}</div>
          <div className={`text-xs mt-1 ${
            isSentByCurrentUser 
              ? "text-primary-foreground/70" 
              : "text-slate-500"
          }`}>
            {format(new Date(msg.createdAt), "h:mm a")}
          </div>
        </div>
        {isSentByCurrentUser && (
          <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-3 border-b flex items-center bg-slate-50">
        <Avatar className="h-9 w-9 mr-3">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {recipientName.split(" ").map(name => name[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-slate-900">{recipientName}</div>
          <div className="text-xs text-slate-500">
            {status === "connected" ? (
              <span className="flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                Online
              </span>
            ) : status === "connecting" ? (
              <span className="flex items-center">
                <span className="h-2 w-2 bg-amber-500 rounded-full mr-1"></span>
                Connecting...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="h-2 w-2 bg-red-500 rounded-full mr-1"></span>
                Offline
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
        {status === "connecting" && (
          <div className="flex flex-col justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60 mb-2" />
            <p className="text-slate-500 text-sm">Connecting to chat...</p>
          </div>
        )}
        
        {status === "error" && (
          <div className="flex flex-col justify-center items-center h-full text-red-500">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <p className="font-medium mb-1">Connection Error</p>
              <p className="text-sm text-red-600">Failed to connect to chat server. Please try again.</p>
            </div>
          </div>
        )}
        
        {status === "connected" && conversation.length === 0 && (
          <div className="flex flex-col justify-center items-center h-full text-slate-500">
            <div className="bg-slate-100 p-6 rounded-lg max-w-xs text-center">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 text-slate-400" />
              <p className="font-medium mb-1">No messages yet</p>
              <p className="text-sm">Send a message to start the conversation!</p>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {conversation.map(renderMessage)}
        </div>
        <div ref={messagesEndRef} className="h-3" />
      </div>
      
      {/* Chat input */}
      <form onSubmit={handleSend} className="border-t p-4 flex space-x-2 bg-white">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={status !== "connected"}
          className="flex-1 focus-visible:ring-primary/20 border-slate-200"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={status !== "connected" || !newMessage.trim()}
          className="rounded-full bg-primary hover:bg-primary/90 transition-colors"
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}