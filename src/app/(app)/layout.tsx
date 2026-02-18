import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatSidebarMobile } from "@/components/chat/chat-sidebar-mobile";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-80 border-r flex-col bg-white">
        <ChatSidebar />
      </aside>
      {/* Mobile sidebar (Sheet) */}
      <ChatSidebarMobile />
      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {children}
      </main>
    </div>
  );
}
