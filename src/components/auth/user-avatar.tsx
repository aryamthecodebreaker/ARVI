"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar({ className }: { className?: string }) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Avatar className={className}>
      <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
      <AvatarFallback>
        {user?.name?.charAt(0)?.toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
  );
}
