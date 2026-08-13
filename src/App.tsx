import { useEffect, useState } from "react";
import { usePagos } from "@/hooks/usePagos";
import { useChatMetrics } from "@/hooks/useChatMetrics";
import { WeeklyChart } from "@/components/WeeklyChart";
import { BankMetrics } from "@/components/BankMetrics";
import { SummaryCard } from "@/components/SummaryCard";
import { DaysVolumeCard } from "@/components/DaysVolumeCard";
import { IntencionPagoCard } from "@/components/IntencionPagoCard";
import { ChatMetricsGrid } from "@/components/ChatMetricsGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getPeriodRange, type PeriodFilter } from "@/lib/period";
import logoGapfixers from "@/assets/logo_gapfixers.png";
import {
  Wallet,
  MessageSquare,
  Lock,
  Settings,
  TrendingUp,
  Receipt,
  Moon,
  Sun,
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

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const date = new Date(2020, index, 1);
  return {
    value: String(index + 1).padStart(2, "0"),
    label: format(date, "MMMM", { locale: es }),
  };
});

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
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");
  const [activeSection, setActiveSection] = useState<ActiveSection>("pagos");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("eba-theme") === "dark";
  });

  const { data, isLoading, error } = usePagos(selectedMonth, periodFilter);
  const {
    data: chatData,
    isLoading: isChatLoading,
    error: chatError,
  } = useChatMetrics(selectedMonth, periodFilter);

  useEffect(() => {
    const syncSidebarState = () => {
      if (window.innerWidth > 900) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    syncSidebarState();
    window.addEventListener("resize", syncSidebarState);

    return () => window.removeEventListener("resize", syncSidebarState);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("eba-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const fetchError = error || chatError;

  const handleToday = () => {
    setSelectedMonth(new Date());
    setPeriodFilter("day");
  };

  const handleThisWeek = () => {
    setSelectedMonth(new Date());
    setPeriodFilter("week");
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = selectedMonth.getFullYear();
    setSelectedMonth(parseISO(`${year}-${e.target.value}-01`));
    setPeriodFilter("month");
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(new Date(Number(e.target.value), selectedMonth.getMonth(), 1));
    setPeriodFilter("year");
  };

  // Kept for the hidden compatibility controls used by older layouts.
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriodFilter(e.target.value as PeriodFilter);
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setSelectedMonth(parseISO(e.target.value));
  };
  const dateInputValue = format(selectedMonth, "yyyy-MM-dd");

  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section);
    if (window.innerWidth <= 900) {
      setIsSidebarOpen(false);
    }
  };

  const meta = SECTION_META[activeSection];
  const selectedMonthLabel = format(selectedMonth, "MMMM yyyy", {
    locale: es,
  });
  const selectedPeriodRange = getPeriodRange(selectedMonth, periodFilter);
  const selectedPeriodLabel = periodFilter === "day"
    ? format(selectedPeriodRange.start, "dd 'de' MMMM yyyy", { locale: es })
    : periodFilter === "week"
      ? `Del ${format(selectedPeriodRange.start, "dd MMM", { locale: es })} al ${format(selectedPeriodRange.end, "dd MMM yyyy", { locale: es })}`
      : periodFilter === "year"
        ? format(selectedMonth, "yyyy")
        : selectedMonthLabel;

  if (fetchError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="bg-destructive/10 text-destructive p-6 rounded-2xl">
          Error al cargar datos: {fetchError.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 hidden bg-black/25 backdrop-blur-[1px] max-[900px]:block"
          aria-label="Cerrar navegación lateral"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`bg-card border-r border-border/50 flex flex-col sticky top-0 h-screen overflow-y-auto transition-all duration-300 z-50 max-[900px]:fixed max-[900px]:left-0 max-[900px]:top-0 ${
          isSidebarOpen
            ? "w-[300px] max-[900px]:w-[300px]"
            : "w-[300px] max-[900px]:w-[84px]"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="hidden max-[900px]:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-7 w-7 items-center justify-center rounded-full border border-border bg-card shadow-md text-foreground"
          aria-label={isSidebarOpen ? "Colapsar navegación" : "Expandir navegación"}
        >
          <span
            className={`text-sm transition-transform duration-300 ${
              isSidebarOpen ? "rotate-180" : ""
            }`}
          >
            ›
          </span>
        </button>

        <div className="px-5 pt-6 pb-5 border-b border-border/40 max-[900px]:px-3 max-[900px]:pt-4 max-[900px]:pb-4">
          <div
            className={`flex items-center gap-1 w-full ${
              isSidebarOpen ? "max-[900px]:justify-start" : "max-[900px]:justify-center"
            }`}
          >
            <img
              src="https://framerusercontent.com/images/AllEQNB8hDFS94G6NNnGznySgQ.png?scale-down-to=512&width=1080&height=540"
              alt="Logo EBA"
              className="h-24 w-24 object-contain rounded-2xl bg-primary/5 p-2 flex-shrink-0 max-[900px]:h-20 max-[900px]:w-20"
            />
            <div className={`flex flex-col flex-1 ${isSidebarOpen ? "" : "hidden"}`}>
              <span className="font-display font-bold text-[22px] leading-none text-foreground text-center">
                Educacional
              </span>
              <span className="font-display font-bold text-[22px] leading-none text-foreground text-center">
                Buenos Aires
              </span>
              <span className="text-[11px] font-body text-muted-foreground mt-1 tracking-wide text-center">
                Analytics Dashboard
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-6 max-[900px]:px-2 max-[900px]:py-4">
          <div>
            <p
              className={`text-[10px] font-body font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 mb-2 ${
                isSidebarOpen ? "" : "hidden"
              }`}
            >
              Panel
            </p>
            <div className="flex flex-col gap-1">
              {UNLOCKED_SECTIONS.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSectionChange(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-150 cursor-pointer text-left ${
                      isSidebarOpen ? "max-[900px]:justify-start max-[900px]:px-3" : "max-[900px]:justify-center max-[900px]:px-2"
                    } ${
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
                    <span className={`${isSidebarOpen ? "" : "hidden"}`}>
                      {label}
                    </span>
                    {isActive && (
                      <span className={`ml-auto w-1.5 h-1.5 rounded-full bg-primary ${isSidebarOpen ? "" : "hidden"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p
              className={`text-[10px] font-body font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 mb-2 ${
                isSidebarOpen ? "" : "hidden"
              }`}
            >
              Expansión
            </p>
            <div className="flex flex-col gap-1">
              {LOCKED_SECTIONS.map(({ id, label, icon: Icon }) => (
                <div key={id} className="group flex flex-col rounded-xl overflow-hidden">
                  <div
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body font-medium opacity-40 cursor-not-allowed select-none ${
                      isSidebarOpen ? "max-[900px]:justify-start max-[900px]:px-3" : "max-[900px]:justify-center max-[900px]:px-2"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    <span
                      className={`text-muted-foreground ${isSidebarOpen ? "" : "hidden"}`}
                    >
                      {label}
                    </span>
                    <Lock className={`ml-auto w-3.5 h-3.5 text-muted-foreground ${isSidebarOpen ? "" : "hidden"}`} />
                  </div>
                  <div
                    className={`max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-20 ${
                      isSidebarOpen ? "" : "hidden"
                    }`}
                  >
                    <p className="text-[10px] font-body text-muted-foreground/70 leading-snug px-3 pb-2.5 pt-0">
                      Esta sección está planificada como una posible expansión futura de tu centro de métricas.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="px-5 pb-6 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity max-[900px]:px-2">
          <img
            src={logoGapfixers}
            alt="Gapfixers"
            className="h-5 object-contain max-[900px]:h-4"
          />
          <span
            className={`text-xs text-muted-foreground font-body text-center ${
              isSidebarOpen ? "" : "hidden"
            }`}
          >
            Desarrollado por Gapfixers
          </span>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden max-[900px]:pl-[84px]">
        <header className="bg-card border-b border-border/50 sticky top-0 z-40">
          <div className="px-8 min-h-16 py-2 flex items-center justify-between gap-8 max-[900px]:flex-wrap max-[900px]:px-4 max-[900px]:gap-2">
            <div className="min-w-0 flex-1 max-[900px]:w-full max-[900px]:flex-none">
              <h1 className="font-display font-bold text-xl leading-tight tracking-tight text-foreground max-[900px]:text-base">
                {meta.title}
              </h1>
              <p className="text-xs text-muted-foreground font-body max-[900px]:hidden">
                {meta.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-sm font-body text-muted-foreground max-[900px]:w-full max-[900px]:justify-end max-[900px]:gap-2">
              <button
                type="button"
                onClick={() => setIsDarkMode(prev => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/50 text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                title={isDarkMode ? "Modo claro" : "Modo oscuro"}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              {activeSection === "pagos" && !isLoading && data?.totalHistorico !== undefined && (
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20 max-[900px]:hidden">
                  Histórico: {data.totalHistorico} pagos
                </div>
              )}
              {activeSection === "conversaciones" && !isChatLoading && chatData?.historicoLeadsAtendidos !== undefined && (
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20 max-[900px]:hidden">
                  Histórico: {chatData.historicoLeadsAtendidos} leads atendidos
                </div>
              )}
              <span className="text-xs max-[900px]:hidden">Filtrar por</span>
              <div className="flex items-center overflow-hidden rounded-full border border-border bg-secondary/50 p-0.5 max-[900px]:order-last max-[900px]:w-full max-[900px]:justify-end">
                <button
                  type="button"
                  onClick={handleToday}
                  className={`rounded-full px-4 py-1.5 text-xs transition-colors max-[900px]:px-2.5 ${periodFilter === "day" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
                >Hoy</button>
                <button
                  type="button"
                  onClick={handleThisWeek}
                  className={`rounded-full px-4 py-1.5 text-xs transition-colors max-[900px]:px-2.5 ${periodFilter === "week" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
                >Esta semana</button>
                <select
                  value={format(selectedMonth, "MM")}
                  onChange={handleMonthChange}
                  aria-label="Mes del periodo"
                  className={`rounded-full border-0 px-3 py-1.5 text-xs capitalize focus:outline-none focus:ring-2 focus:ring-primary/50 max-[900px]:px-2 ${periodFilter === "month" ? "bg-primary text-primary-foreground" : "bg-transparent text-foreground"}`}
                >
                  {MONTH_OPTIONS.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                <select
                  value={format(selectedMonth, "yyyy")}
                  onChange={handleYearChange}
                  aria-label="Año del periodo"
                  className={`rounded-full border-0 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 max-[900px]:px-2 ${periodFilter === "year" ? "bg-primary text-primary-foreground" : "bg-transparent text-foreground"}`}
                >
                  {Array.from({ length: 7 }, (_, index) => new Date().getFullYear() - 3 + index).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <select
                value={periodFilter}
                onChange={handlePeriodChange}
                aria-label="Tipo de periodo"
                className="hidden"
              >
                <option value="day">Día</option>
                <option value="week">Semana</option>
                <option value="month">Mes</option>
              </select>
              <input
                type={periodFilter === "month" ? "month" : "date"}
                className="hidden"
                value={dateInputValue}
                onChange={handleDateChange}
                aria-label="Fecha del periodo"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8 max-[900px]:px-4">
          {activeSection === "pagos" ? (
            <>
              <div className="grid grid-cols-1 min-[1100px]:grid-cols-2 items-stretch gap-6 mb-8 w-full max-w-6xl mx-auto pb-4">
                <div className="w-full min-w-0 flex flex-col">
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
                      mesActual={selectedPeriodLabel}
                    />
                  )}
                </div>

                <div className="w-full min-w-0 flex flex-col">
                  {isChatLoading || !chatData ? (
                    <Skeleton className="h-full min-h-[300px] w-full rounded-2xl" />
                  ) : (
                    <IntencionPagoCard
                      intencionPagoCount={chatData.intencionPagoCount}
                      pagoEfectivoCount={chatData.pagoEfectivoCount}
                      porcentajePagoEfectivo={chatData.porcentajePagoEfectivo}
                    />
                  )}
                </div>

                <div className="w-full min-w-0 flex flex-col">
                  {isLoading ? <Skeleton className="h-full min-h-[400px] w-full rounded-2xl" /> : <WeeklyChart data={data?.datosSemanales || []} />}
                </div>

                <div className="w-full min-w-0 flex flex-col">
                  {isLoading ? <Skeleton className="h-full min-h-[400px] w-full rounded-2xl" /> : <BankMetrics data={data?.metodosDistribucion || []} />}
                </div>
              </div>

              <div className="w-full max-w-6xl mx-auto mb-8">
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full rounded-2xl" />
                ) : (
                  <DaysVolumeCard diasVolumen={data?.diasVolumen || []} />
                )}
              </div>

            </>
          ) : (
            <ChatMetricsGrid
              data={chatData}
              isLoading={isChatLoading}
              mesActual={selectedPeriodLabel}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
