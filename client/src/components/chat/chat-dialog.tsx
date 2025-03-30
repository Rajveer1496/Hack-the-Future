import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ChatInterface } from "@/components/chat/chat-interface";

interface ChatDialogProps {
  recipientId: number;
  recipientName: string;
  trigger?: React.ReactNode;
}

export function ChatDialog({
  recipientId,
  recipientName,
  trigger,
}: ChatDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm">Message</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] h-[70vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex flex-row justify-between items-center">
          <DialogTitle>{recipientName}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            recipientId={recipientId}
            recipientName={recipientName}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}