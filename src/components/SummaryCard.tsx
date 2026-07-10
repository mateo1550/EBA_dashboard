import { Info, Cpu, UserCheck, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SummaryCardProps {
  totalRegistrados: number;
  pagosConfirmados: number;
  pagosConfirmadosManual: number;
  pagosSinConfirmar: number;
  porcentajeConfirmados: number;
  porcentajeConfirmadosManual: number;
  porcentajeSinConfirmar: number;
  pagosWhatsapp?: number;
  mesActual: string;
}

export function SummaryCard({
  totalRegistrados,
  pagosConfirmados,
  pagosConfirmadosManual,
  pagosSinConfirmar,
  porcentajeConfirmados,
  porcentajeConfirmadosManual,
  porcentajeSinConfirmar,
  pagosWhatsapp,
  mesActual
}: SummaryCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-display font-bold text-foreground">Resumen de Pagos</h2>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help inline-flex">
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="font-body text-xs bg-popover border-border text-popover-foreground z-50">
                  <p>Resumen de el mes {mesActual}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground font-body">Análisis detallado de conciliación</p>
        </div>
        <div className="bg-primary/10 text-primary rounded-xl px-6 py-4 flex items-center justify-between gap-4">
          <span className="text-base font-body font-medium">Pagos<br/>Totales</span>
          <span className="text-5xl font-display font-bold">{totalRegistrados}</span>
        </div>

        {pagosWhatsapp !== undefined && (
          <div className="bg-[#25D366]/10 text-[#25D366] rounded-xl px-6 py-4 flex items-center justify-between gap-4">
            <span className="text-base font-body font-medium">Reportados por<br/>WhatsApp</span>
            <span className="text-4xl font-display font-bold">{pagosWhatsapp}</span>
          </div>
        )}
      </div>

      {/* Grid Vertical */}
      <div className="grid grid-cols-1 gap-3">
        {/* Automático */}
        <div className="bg-secondary/30 rounded-xl p-4 relative overflow-hidden group flex flex-col justify-center">
          <Cpu className="absolute -right-4 -top-4 w-24 h-24 text-[#3b82f6] opacity-5 group-hover:opacity-10 transition-opacity" />
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-xs font-display font-bold tracking-wider text-foreground uppercase">Automático</span>
          </div>
          <p className="text-5xl font-display font-bold text-[#3b82f6] mb-1">
            {porcentajeConfirmados.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground font-body">
            {pagosConfirmados} pagos conciliados
          </p>
        </div>

        {/* Manual */}
        <div className="bg-secondary/30 rounded-xl p-4 relative overflow-hidden group flex flex-col justify-center">
          <UserCheck className="absolute -right-4 -top-4 w-24 h-24 text-[#64748b] opacity-5 group-hover:opacity-10 transition-opacity" />
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-[#64748b]" />
            <span className="text-xs font-display font-bold tracking-wider text-foreground uppercase">Manual</span>
          </div>
          <p className="text-5xl font-display font-bold text-[#64748b] mb-1">
            {porcentajeConfirmadosManual.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground font-body">
            {pagosConfirmadosManual} pagos verificados
          </p>
        </div>

        {/* Sin Confirmar */}
        <div className="bg-secondary/30 rounded-xl p-4 relative overflow-hidden group flex flex-col justify-center">
          <Clock className="absolute -right-4 -top-4 w-24 h-24 text-[#ef4444] opacity-5 group-hover:opacity-10 transition-opacity" />
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#ef4444]" />
            <span className="text-xs font-display font-bold tracking-wider text-foreground uppercase">Pendiente</span>
          </div>
          <p className="text-5xl font-display font-bold text-[#ef4444] mb-1">
            {porcentajeSinConfirmar.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground font-body">
            {pagosSinConfirmar} pagos sin confirmar
          </p>
        </div>
      </div>
    </div>
  );
}
