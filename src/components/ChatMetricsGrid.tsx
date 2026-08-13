import { Users, Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMetrics } from "@/hooks/useChatMetrics";
import { ClientesLeadsChart } from "./ClientesLeadsChart";
import { ResolucionChart } from "./ResolucionChart";
import { TopicRankingCard } from "./TopicRankingCard";
import { TransferRankingCard } from "./TransferRankingCard";
import { DepartmentMetricsCard } from "./DepartmentMetricsCard";
import { MetricInfoTooltip } from "./MetricInfoTooltip";

interface ChatMetricsGridProps {
  data?: ChatMetrics;
  isLoading: boolean;
  mesActual: string;
}

export function ChatMetricsGrid({ data, isLoading, mesActual }: ChatMetricsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 min-[1300px]:grid-cols-2 gap-6 w-full max-w-7xl mx-auto pb-4">
        <Skeleton className="h-[280px] w-full rounded-2xl" />
        <Skeleton className="h-[320px] w-full rounded-2xl" />
        <Skeleton className="h-[250px] w-full rounded-2xl" />
        <Skeleton className="h-[250px] w-full rounded-2xl" />
        <Skeleton className="h-[380px] w-full rounded-2xl" />
        <div className="min-[1300px]:col-span-2 min-[1300px]:justify-self-center min-[1300px]:w-full min-[1300px]:max-w-[640px]">
          <Skeleton className="h-[380px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 min-[1300px]:grid-cols-2 gap-6 w-full max-w-7xl mx-auto pb-4">
      <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 md:p-7 flex flex-col gap-5 w-full min-w-0 overflow-hidden min-[1300px]:order-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-foreground">Interacciones</h2>
              <MetricInfoTooltip content="Cantidad total de conversaciones recibidas durante el periodo seleccionado, separadas entre atención de Mateo y del equipo humano." />
            </div>
            <p className="text-sm text-muted-foreground font-body">Volumen de chats en el periodo</p>
          </div>
          <span className="shrink-0 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-[11px] font-body text-muted-foreground">
            {mesActual}
          </span>
        </div>

        <div className="flex flex-col min-[901px]:flex-row items-stretch gap-4 w-full min-w-0">
          <div className="bg-primary/10 text-primary rounded-2xl px-6 py-6 md:px-7 md:py-7 flex flex-col justify-between sm:flex-1 min-w-0 min-h-[180px]">
            <div>
              <span className="block text-lg font-body font-semibold">Consultas</span>
              <span className="block text-sm opacity-75 font-normal mt-1">Totales recibidas</span>
            </div>
            <span className="block text-[clamp(2.75rem,12vw,4.5rem)] leading-none mt-6 font-display font-bold tracking-tight break-words">
              {data.totalConsultas}
            </span>
          </div>

          <div className="flex flex-col min-[901px]:flex-col gap-4 min-[901px]:flex-1 min-w-0">
            <div className="bg-secondary/30 rounded-2xl p-5 flex-1 min-w-0 flex items-center gap-3">
              <div className="shrink-0 rounded-full bg-card/70 p-3">
                <Bot className="w-6 h-6 text-[#4DD0E1]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base text-muted-foreground font-body leading-none">Mateo</span>
                <span className="text-5xl font-display font-bold mt-1 text-[#4DD0E1] leading-none">
                  {data.aiCount}
                </span>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-2xl p-5 flex-1 min-w-0 flex items-center gap-3">
              <div className="shrink-0 rounded-full bg-card/70 p-3">
                <Users className="w-6 h-6 text-[#64B5F6]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base text-muted-foreground font-body leading-none">Humanos</span>
                <span className="text-5xl font-display font-bold mt-1 text-[#64B5F6] leading-none">
                  {data.humanCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0 min-[1300px]:order-1">
        <ClientesLeadsChart
          data={data.clientesLeadsDistribucion}
          total={data.totalConsultas}
        />
      </div>

      <div className="min-w-0 min-[1300px]:order-2">
        <ResolucionChart
          data={data.resolucionDistribucion}
          total={data.aiCount + data.humanCount}
        />
      </div>

      <div className="min-w-0 min-[1300px]:order-4">
        <TopicRankingCard topicRanking={data.topicRanking} />
      </div>
      <div className="min-w-0 min-[1300px]:order-5">
        <DepartmentMetricsCard data={data.departamentosMetrics} />
      </div>

      <div className="min-w-0 min-[1300px]:order-6">
        <TransferRankingCard
          derivacionesTotal={data.derivacionesTotal}
          scopeCount={data.scopeCount}
          errorCount={data.errorCount}
          protocolCount={data.protocolCount}
          porcentajeScope={data.porcentajeScope}
          porcentajeError={data.porcentajeError}
          porcentajeProtocol={data.porcentajeProtocol}
          transferReasonRanking={data.transferReasonRanking}
        />
      </div>
    </div>
  );
}
