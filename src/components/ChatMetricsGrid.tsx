import { Users, Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMetrics } from "@/hooks/useChatMetrics";
import { ClientesLeadsChart } from "./ClientesLeadsChart";
import { ResolucionChart } from "./ResolucionChart";
import { IntencionPagoCard } from "./IntencionPagoCard";
import { TopicRankingCard } from "./TopicRankingCard";
import { TransferRankingCard } from "./TransferRankingCard";
import { DepartmentMetricsCard } from "./DepartmentMetricsCard";

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
      <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 md:p-7 flex flex-col gap-5 w-full min-w-0 overflow-x-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Interacciones</h2>
            <p className="text-sm text-muted-foreground font-body">Volumen de chats en el periodo</p>
          </div>
          <span className="shrink-0 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-[11px] font-body text-muted-foreground">
            {mesActual}
          </span>
        </div>

        <div className="flex min-w-[560px] flex-row items-stretch gap-4">
          <div className="bg-primary/10 text-primary rounded-2xl px-6 py-6 md:px-7 md:py-7 flex flex-col justify-between w-[300px] flex-shrink-0 min-h-[226px]">
            <div>
              <span className="block text-lg font-body font-semibold">Consultas</span>
              <span className="block text-sm opacity-75 font-normal mt-1">Totales recibidas</span>
            </div>
            <span className="block text-7xl leading-none mt-6 font-display font-bold tracking-tight">
              {data.totalConsultas}
            </span>
          </div>

          <div className="flex flex-col gap-4 w-[200px] flex-shrink-0">
            <div className="bg-secondary/30 rounded-2xl p-5 min-h-[106px] flex items-center gap-3">
              <div className="shrink-0 rounded-full bg-white/70 p-2.5">
                <Bot className="w-5 h-5 text-[#4DD0E1]" />
              </div>
              <div className="flex flex-col">
                <span className="text-base text-muted-foreground font-body leading-none">Mateo</span>
                <span className="text-4xl font-display font-bold mt-1 text-[#4DD0E1] leading-none">
                  {data.aiCount}
                </span>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-2xl p-5 min-h-[106px] flex items-center gap-3">
              <div className="shrink-0 rounded-full bg-white/70 p-2.5">
                <Users className="w-5 h-5 text-[#64B5F6]" />
              </div>
              <div className="flex flex-col">
                <span className="text-base text-muted-foreground font-body leading-none">Humanos</span>
                <span className="text-4xl font-display font-bold mt-1 text-[#64B5F6] leading-none">
                  {data.humanCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClientesLeadsChart
        data={data.clientesLeadsDistribucion}
        total={data.totalConsultas}
      />

      <IntencionPagoCard
        intencionPagoCount={data.intencionPagoCount}
        pagoEfectivoCount={data.pagoEfectivoCount}
        porcentajePagoEfectivo={data.porcentajePagoEfectivo}
      />

      <ResolucionChart
        data={data.resolucionDistribucion}
        total={data.aiCount + data.humanCount}
      />

      <TopicRankingCard topicRanking={data.topicRanking} />
      <DepartmentMetricsCard data={data.departamentosMetrics} />

      <div className="min-[1300px]:col-span-2 min-[1300px]:justify-self-center min-[1300px]:w-full min-[1300px]:max-w-[640px]">
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
