import { useState } from "react";
import { usePagos } from "@/hooks/usePagos";
import { PagosTable } from "@/components/PagosTable";
import { WeeklyChart } from "@/components/WeeklyChart";
import { BankMetrics } from "@/components/BankMetrics";
import { SummaryCard } from "@/components/SummaryCard";
import { DaysVolumeCard } from "@/components/DaysVolumeCard";
import { LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

function App() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  const { data, isLoading, error } = usePagos(selectedMonth);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="bg-destructive/10 text-destructive p-6 rounded-2xl">
          Error al cargar datos: {error.message}
        </div>
      </div>
    );
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // e.target.value es "YYYY-MM"
      const date = parseISO(`${e.target.value}-02`); // agregamos -02 para evitar problemas de timezone
      setSelectedMonth(date);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-foreground">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="font-display font-bold text-xl tracking-tight">EBA Analytics</h1>
            {!isLoading && data?.totalHistorico !== undefined && (
              <div className="ml-4 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                Total histórico: {data.totalHistorico} pagos
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm font-body text-muted-foreground">
            <span>Periodo actual</span>
            <input 
              type="month" 
              className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={handleMonthChange}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Top Section: Summary (Left) & Weekly Charts (Right) */}
        <div className="flex flex-row justify-center items-start gap-6 mb-8 w-full max-w-6xl mx-auto overflow-x-auto pb-4">
          {/* Left Column: Summary & Bank Metrics */}
          <div className="w-[320px] flex-shrink-0 flex flex-col gap-6">
            {isLoading ? (
              <Skeleton className="h-[500px] w-full rounded-2xl" />
            ) : (
              <SummaryCard 
                totalRegistrados={data?.totalRegistrados || 0}
                pagosConfirmados={data?.pagosConfirmados || 0}
                pagosConfirmadosManual={data?.pagosConfirmadosManual || 0}
                pagosSinConfirmar={data?.pagosSinConfirmar || 0}
                porcentajeConfirmados={data?.porcentajeConfirmados || 0}
                porcentajeConfirmadosManual={data?.porcentajeConfirmadosManual || 0}
                porcentajeSinConfirmar={data?.porcentajeSinConfirmar || 0}
                pagosWhatsapp={data?.pagosWhatsapp || 0}
              />
            )}
            
          </div>
          
          {/* Right Column: Weekly Charts & Bank Metrics */}
          <div className="w-auto flex flex-col items-start gap-6">
            {isLoading ? (
              <Skeleton className="h-[500px] w-full rounded-2xl min-w-[320px]" />
            ) : (
              <WeeklyChart />
            )}
            {isLoading ? (
              <Skeleton className="h-[400px] w-full rounded-2xl min-w-[320px]" />
            ) : (
              <BankMetrics data={data?.metodosDistribucion || []} />
            )}
          </div>
        </div>

        {/* Bottom Section: Volume Bar Chart */}
        <div className="w-full max-w-6xl mx-auto mb-8">
          {isLoading ? (
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          ) : (
            <DaysVolumeCard diasVolumen={data?.diasVolumen || []} />
          )}
        </div>




      </main>
    </div>
  );
}

export default App;
