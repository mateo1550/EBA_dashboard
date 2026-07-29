import { Clock, Building2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DepartmentMetricItem {
  departamento: string;
  count: number;
  avgResponseTime: number | null;
}

interface DepartmentMetricsCardProps {
  data: DepartmentMetricItem[];
}

export function DepartmentMetricsCard({ data }: DepartmentMetricsCardProps) {
  const totalGeneral = data.reduce((sum, item) => sum + item.count, 0);

  const formatAvgTime = (timeInMinutes: number | null): string => {
    if (timeInMinutes === null) return "Sin datos";
    if (timeInMinutes < 1) {
      const seconds = Math.round(timeInMinutes * 60);
      return `${seconds} seg`;
    }
    return `${timeInMinutes.toFixed(1)} min`;
  };

  const getBadgeStyles = (timeInMinutes: number | null): string => {
    if (timeInMinutes === null) {
      return "bg-secondary/50 text-muted-foreground border-border/30";
    }
    if (timeInMinutes < 5) {
      return "bg-green-500/10 text-green-600 border-green-500/20";
    }
    if (timeInMinutes <= 15) {
      return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    }
    return "bg-red-500/10 text-red-600 border-red-500/20";
  };

  const getProgressBarColor = (timeInMinutes: number | null): string => {
    if (timeInMinutes === null) return "bg-muted";
    if (timeInMinutes < 5) return "bg-green-500";
    if (timeInMinutes <= 15) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-6 w-full h-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-display font-bold text-foreground">Rendimiento por Departamento</h3>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help inline-flex">
                  <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-body text-xs bg-popover border-border text-popover-foreground z-50">
                <p>Muestra el volumen de derivaciones recibidas y el tiempo promedio de primera respuesta de agentes humanos por departamento.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground font-body">Volumen y tiempos promedio de primera respuesta</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 flex flex-col gap-4 thin-scrollbar">
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground font-body">No hay derivaciones por departamento en este periodo</p>
          </div>
        ) : (
          data
            .sort((a, b) => b.count - a.count) // Ordenar por volumen descendente
            .map((item) => {
              const percentage = totalGeneral > 0 ? (item.count / totalGeneral) * 100 : 0;
              return (
                <div key={item.departamento} className="flex flex-col gap-1.5 p-3 bg-secondary/5 rounded-xl border border-border/10 hover:bg-secondary/10 transition-colors">
                  <div className="flex items-center justify-between text-xs font-body">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{item.departamento}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-[10px]">
                        {item.count} {item.count === 1 ? 'persona' : 'personas'}
                      </span>
                      <span className={`font-semibold text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${getBadgeStyles(item.avgResponseTime)}`}>
                        <Clock className="w-3 h-3" />
                        {formatAvgTime(item.avgResponseTime)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar of Volume */}
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(item.avgResponseTime)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
