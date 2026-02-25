import { cn } from "@/lib/utils";

interface AlertStatusBadgeProps {
  status: string;
  className?: string;
}

export function AlertStatusBadge({ status, className }: AlertStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  
  let styles = "bg-secondary text-secondary-foreground";
  if (normalizedStatus === "new") styles = "bg-blue-500/20 text-blue-500 border-blue-500/20";
  if (normalizedStatus === "investigating") styles = "bg-amber-500/20 text-amber-500 border-amber-500/20 animate-pulse";
  if (normalizedStatus === "closed") styles = "bg-slate-500/20 text-slate-500 border-slate-500/20";
  
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider",
      styles,
      className
    )}>
      {status}
    </span>
  );
}

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const normalized = severity.toLowerCase();
  
  let styles = "bg-secondary text-secondary-foreground";
  if (normalized === "critical") styles = "bg-[hsl(0,84%,60%)]/20 text-[hsl(0,84%,60%)] border-[hsl(0,84%,60%)]/30 shadow-[0_0_10px_-3px_hsl(0,84%,60%)]";
  if (normalized === "high") styles = "bg-[hsl(25,95%,53%)]/20 text-[hsl(25,95%,53%)] border-[hsl(25,95%,53%)]/30";
  if (normalized === "medium") styles = "bg-[hsl(45,93%,47%)]/20 text-[hsl(45,93%,47%)] border-[hsl(45,93%,47%)]/30";
  if (normalized === "low") styles = "bg-[hsl(217,91%,60%)]/20 text-[hsl(217,91%,60%)] border-[hsl(217,91%,60%)]/30";

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-md text-xs font-bold border flex items-center gap-1.5 w-fit",
      styles,
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}
