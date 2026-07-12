"use client";

import { cn } from "@/lib/utils";


export function MenuItemImagePlaceholder({
 className,
}: {
 className?: string;
}) {
 return (
 <div
 className={cn(
 "flex aspect-square min-h-0 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--bg-surface-2)] to-[var(--bg-overlay)]",
 className
 )}
 aria-hidden
 >
 <span className="text-[32px] leading-none" role="img" aria-hidden>
 🍽️
 </span>
 </div>
 );
}
