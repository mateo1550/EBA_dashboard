import { useState } from "react";
import { usePagos } from "@/hooks/usePagos";
import { useChatMetrics } from "@/hooks/useChatMetrics";
import { WeeklyChart } from "@/components/WeeklyChart";
import { BankMetrics } from "@/components/BankMetrics";
import { SummaryCard } from "@/components/SummaryCard";
import { DaysVolumeCard } from "@/components/DaysVolumeCard";
import { ChatMetricsGrid } from "@/components/ChatMetricsGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import logoGapfixers from "@/assets/logo_gapfixers.png";
import {
  Wallet,
  MessageSquare,
  Lock,
  Settings,
  TrendingUp,
  Receipt,
} from "lucide-react";

type ActiveSection = "pagos" | "conversaciones";

const LOCKED_SECTIONS = [
  { id: "gestion", label: "Gestión interna", icon: Settings },
  { id: "marketing", label: "Marketing y ads", icon: TrendingUp },
  { id: "cobranza", label: "Cobranza", icon: Receipt },
];

const UNLOCKED_SECTIONS = [
  { id: "pagos" as ActiveSection, label: "Métricas de pagos", icon: Wallet },
  {
    id: "conversaciones" as ActiveSection,
    label: "Atención al cliente",
    icon: MessageSquare,
  },
];

const SECTION_META: Record<
  ActiveSection,
  { title: string; description: string }
> = {
  pagos: {
    title: "Métricas de Pagos",
    description: "Análisis de conciliación, bancos y volumen mensual",
  },
  conversaciones: {
    title: "Atención al Cliente",
    description:
      "Interacciones del asistente virtual Mateo y el equipo de soporte",
  },
};

function App() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("pagos");

  const { data, isLoading, error } = usePagos(selectedMonth);
  const {
    data: chatData,
    isLoading: isChatLoading,
    error: chatError,
  } = useChatMetrics(selectedMonth);

  const fetchError = error || chatError;

  if (fetchError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="bg-destructive/10 text-destructive p-6 rounded-2xl">
          Error al cargar datos: {fetchError.message}
        </div>
      </div>
    );
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const date = parseISO(`${e.target.value}-02`);
      setSelectedMonth(date);
    }
  };

  const meta = SECTION_META[activeSection];

  return (
    <div className="flex min-h-screen bg-background">
      {/* ─── SIDEBAR ─── */}
      <aside className="w-[300px] flex-shrink-0 bg-card border-r border-border/50 flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-border/40">
          <div className="flex items-center gap-4">
            <img
              src="https://framerusercontent.com/images/AllEQNB8hDFS94G6NNnGznySgQ.png?scale-down-to=512&width=1080&height=540"
              alt="Logo EBA"
              className="h-16 w-16 object-contain rounded-2xl bg-primary/5 p-1.5 flex-shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-display font-bold text-base leading-tight text-foreground">
                Educacional
              </span>
              <span className="font-display font-bold text-base leading-tight text-foreground">
                Buenos Aires
              </span>
              <span className="text-[11px] font-body text-muted-foreground mt-1 tracking-wide">
                Analytics Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-6">
          {/* Unlocked sections */}
          <div>
            <p className="text-[10px] font-body font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 mb-2">
              Panel
            </p>
            <div className="flex flex-col gap-1">
              {UNLOCKED_SECTIONS.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-150 cursor-pointer text-left ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? "text-primary" : "text-muted-foreground/70"
                      }`}
                    />
                    <span>{label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Locked / expansion sections */}
          <div>
            <p className="text-[10px] font-body font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 mb-2">
              Expansión
            </p>
            <div className="flex flex-col gap-1">
              {LOCKED_SECTIONS.map(({ id, label, icon: Icon }) => (
                <div key={id} className="group flex flex-col rounded-xl overflow-hidden">
                  {/* Row */}
                  <div className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body font-medium opacity-40 cursor-not-allowed select-none">
                    <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{label}</span>
                    <Lock className="ml-auto w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  {/* Inline message — expands below on hover */}
                  <div className="max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-20">
                    <p className="text-[10px] font-body text-muted-foreground/70 leading-snug px-3 pb-2.5 pt-0">
                      Esta sección está planificada como una posible expansión futura de tu centro de métricas.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="px-5 pb-6 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <img
            src={logoGapfixers}
            alt="Gapfixers"
            className="h-5 object-contain"
          />
          <span className="text-xs text-muted-foreground font-body text-center">
            Desarrollado por Gapfixers
          </span>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar */}
        <header className="bg-card border-b border-border/50 sticky top-0 z-40">
          <div className="px-8 h-16 flex items-center justify-between gap-8">
            <div>
              <h1 className="font-display font-bold text-xl tracking-tight text-foreground">
                {meta.title}
              </h1>
              <p className="text-xs text-muted-foreground font-body">
                {meta.description}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-body text-muted-foreground">
              {!isLoading && data?.totalHistorico !== undefined && (
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                  Histórico: {data.totalHistorico} pagos
                </div>
              )}
              <span className="text-xs">Periodo</span>
              <input
                type="month"
                className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={format(selectedMonth, "yyyy-MM")}
                onChange={handleMonthChange}
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-8">
          {activeSection === "pagos" ? (
            <>
              {/* Top Section */}
              <div className="flex flex-row justify-center items-start gap-6 mb-8 w-full max-w-6xl mx-auto overflow-x-auto pb-4">
                <div className="w-[320px] flex-shrink-0 flex flex-col gap-6">
                  {isLoading ? (
                    <Skeleton className="h-[500px] w-full rounded-2xl" />
                  ) : (
                    <SummaryCard
                      totalRegistrados={data?.totalRegistrados || 0}
                      pagosConfirmados={data?.pagosConfirmados || 0}
                      pagosConfirmadosManual={
                        data?.pagosConfirmadosManual || 0
                      }
                      pagosSinConfirmar={data?.pagosSinConfirmar || 0}
                      porcentajeConfirmados={
                        data?.porcentajeConfirmados || 0
                      }
                      porcentajeConfirmadosManual={
                        data?.porcentajeConfirmadosManual || 0
                      }
                      porcentajeSinConfirmar={
                        data?.porcentajeSinConfirmar || 0
                      }
                      pagosWhatsapp={data?.pagosWhatsapp || 0}
                      mesActual={format(selectedMonth, "MMMM", {
                        locale: es,
                      })}
                    />
                  )}
                </div>

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

              {/* Bottom Section */}
              <div className="w-full max-w-6xl mx-auto mb-8">
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full rounded-2xl" />
                ) : (
                  <DaysVolumeCard diasVolumen={data?.diasVolumen || []} />
                )}
              </div>
            </>
          ) : (
            <ChatMetricsGrid data={chatData} isLoading={isChatLoading} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
