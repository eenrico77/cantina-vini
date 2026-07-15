"use client";

import { usePathname } from "next/navigation";

export default function ConditionalHeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWineDetailPage = pathname?.startsWith("/cantina/") && pathname !== "/cantina/new";

  if (isWineDetailPage) return null;

  return <>{children}</>;
}
