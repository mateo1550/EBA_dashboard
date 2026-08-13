import { CreditCard, CheckCircle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IntencionPagoCardProps {
  intencionPagoCount: number;
  pagoEfectivoCount: number;
  porcentajePagoEfectivo: number;
}

export function IntencionPagoCard({
  intencionPagoCount,
  pagoEfectivoCount,
  porcentajePagoEfectivo,
}: IntencionPagoCardProps) {
  const noConcretados = Math.max(0, intencionPagoCount - pagoEfectivoCount);
  const porcentajeNoConcretados = intencionPagoCount > 0 ? (noConcretados / intencionPagoCount) * 100 : 0;

  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-6 w-full h-full min-w-0 overflow-hidden">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-display font-bold text-foreground">Intención vs. Pago Efectivo</h2>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help inline-flex">
                  <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-body text-xs bg-popover border-border text-popover-foreground z-50">
                <p>Compara cuántas personas consultaron por deudas/pagos (pay_consult = true) vs. cuántas finalizaron con un pago exitoso (payment_status = success).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground font-body">Conversión de consultas en pagos reales</p>
      </div>

      {/* Grid horizontal para números */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
        <div className="bg-secondary/20 rounded-xl p-4 flex min-w-0 flex-col">
          <span className="text-xs font-body font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
            <CreditCard className="w-3.5 h-3.5 text-primary" />
            Intención de Pago
          </span>
          <span className="text-3xl font-display font-bold text-foreground">{intencionPagoCount}</span>
          <span className="text-[10px] text-muted-foreground font-body mt-1">Consultaron sobre deudas/cuotas</span>
        </div>

        <div className="bg-secondary/20 rounded-xl p-4 flex min-w-0 flex-col">
          <span className="text-xs font-body font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            Pagos Efectivos
          </span>
          <span className="text-3xl font-display font-bold text-green-600">{pagoEfectivoCount}</span>
          <span className="text-[10px] text-muted-foreground font-body mt-1">Confirmaron el pago en chat</span>
        </div>
      </div>

      {/* Barra de progreso de Conversión */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-body">
          <span className="text-muted-foreground">Tasa de Conversión</span>
          <span className="font-bold text-green-600">{porcentajePagoEfectivo.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-secondary h-3 rounded-full overflow-hidden flex">
          <div 
            className="bg-green-500 h-full transition-all duration-500"
            style={{ width: `${porcentajePagoEfectivo}%` }}
          />
          <div 
            className="bg-orange-400 h-full transition-all duration-500"
            style={{ width: `${porcentajeNoConcretados}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-body">
          <span>{porcentajePagoEfectivo.toFixed(0)}% concretó el pago</span>
          <span>{porcentajeNoConcretados.toFixed(0)}% no concretó</span>
        </div>
      </div>
    </div>
  );
}
