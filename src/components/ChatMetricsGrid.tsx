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
}

export function ChatMetricsGrid({ data, isLoading }: ChatMetricsGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-row justify-center items-start gap-6 w-full max-w-7xl mx-auto overflow-x-auto pb-4">
        {/* Left Column Skeleton */}
        <div className="w-[320px] flex-shrink-0 flex flex-col gap-6">
          <Skeleton className="h-[140px] w-full rounded-2xl" />
          <Skeleton className="h-[320px] w-full rounded-2xl" />
        </div>
        
        {/* Right Columns Skeleton */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Skeleton className="h-[250px] w-full rounded-2xl" />
            <Skeleton className="h-[250px] w-full rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            <Skeleton className="h-[380px] w-full rounded-2xl" />
            <Skeleton className="h-[380px] w-full rounded-2xl" />
            <Skeleton className="h-[380px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col lg:flex-row justify-center items-start gap-6 w-full max-w-7xl mx-auto pb-4">
      {/* Left Column: KPI & Leads/Clients */}
      <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
        {/* Total Consultas KPI Card */}
        <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-4 w-full">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Interacciones</h2>
            <p className="text-sm text-muted-foreground font-body">Volumen de chats en el periodo</p>
          </div>
          
          <div className="bg-primary/10 text-primary rounded-xl px-6 py-4 flex items-center justify-between gap-4">
            <span className="text-base font-body font-medium flex flex-col">
              <span>Consultas</span>
              <span className="text-[10px] opacity-75 font-normal">Totales recibidas</span>
            </span>
            <span className="text-5xl font-display font-bold">{data.totalConsultas}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-secondary/30 rounded-lg p-2.5 flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#4DD0E1]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-body leading-none">Mateo</span>
                <span className="text-sm font-display font-bold mt-1 text-[#4DD0E1]">{data.aiCount}</span>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#64B5F6]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-body leading-none">Humanos</span>
                <span className="text-sm font-display font-bold mt-1 text-[#64B5F6]">{data.humanCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clientes vs Leads Pie Chart */}
        <ClientesLeadsChart 
          data={data.clientesLeadsDistribucion} 
          total={data.totalConsultas} 
        />
      </div>

      {/* Right Column: Other metrics */}
      <div className="flex-1 flex flex-col gap-6 w-full">
        {/* Top widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <IntencionPagoCard 
            intencionPagoCount={data.intencionPagoCount}
            pagoEfectivoCount={data.pagoEfectivoCount}
            porcentajePagoEfectivo={data.porcentajePagoEfectivo}
          />
          <ResolucionChart 
            data={data.resolucionDistribucion}
            total={data.aiCount + data.humanCount}
          />
        </div>

        {/* Bottom widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
          <TopicRankingCard topicRanking={data.topicRanking} />
          <DepartmentMetricsCard data={data.departamentosMetrics} />
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
    </div>
  );
}
