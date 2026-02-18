"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useChatStore } from "@/stores/chat-store";
import { ChatSidebar } from "./chat-sidebar";

export function ChatSidebarMobile() {
  const { sidebarOpen, setSidebarOpen } = useChatStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="h-full" onClick={() => setSidebarOpen(false)}>
          <ChatSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}
