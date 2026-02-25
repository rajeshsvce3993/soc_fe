import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function MetricsCard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  description,
  className,
  icon
}: MetricsCardProps) {
  return (
    <Card className={cn("overflow-hidden glass-card border-border/50 hover:shadow-lg transition-all duration-300 group", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          {icon && (
            <div className="p-2 bg-secondary/50 rounded-lg text-primary opacity-80 group-hover:opacity-100 transition-opacity">
              {icon}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-2xl lg:text-3xl font-bold font-mono tracking-tight">{value}</h3>
          
          {trendValue && (
            <div className="flex items-center gap-2 text-xs font-medium mt-2">
              <span className={cn(
                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md",
                trend === "up" && "bg-green-500/10 text-green-500",
                trend === "down" && "bg-red-500/10 text-red-500",
                trend === "neutral" && "bg-secondary text-muted-foreground"
              )}>
                {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                {trend === "neutral" && <Minus className="w-3 h-3" />}
                {trendValue}
              </span>
              <span className="text-muted-foreground">{description || "vs last month"}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Decorative gradient line at bottom */}
      <div className={cn(
        "h-1 w-full bg-gradient-to-r opacity-50",
        trend === "up" ? "from-green-500 to-transparent" :
        trend === "down" ? "from-red-500 to-transparent" :
        "from-primary to-transparent"
      )} />
    </Card>
  );
}
