import type { ReactNode } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KPICardProps {
  title: string;
  value: string | number | ReactNode;
  icon?: ReactNode;
  tooltipText?: string;
  className?: string;
}

export function KPICard({ title, value, icon, tooltipText, className }: KPICardProps) {
  return (
    <div className={`bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col justify-between relative overflow-hidden group ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm text-muted-foreground font-body font-medium z-10">{title}</h3>
        {tooltipText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help z-10">
                  <Info className="h-4 w-4 text-muted-foreground opacity-70 hover:opacity-100" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-body text-xs">{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="text-4xl font-display font-bold tracking-tight text-foreground z-10">
        {value}
      </div>

      {icon && (
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity z-0 pointer-events-none">
          <div className="w-32 h-32 flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
    </div>
  );
}
