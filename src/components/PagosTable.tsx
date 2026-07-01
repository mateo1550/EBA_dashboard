import type { Pago } from "@/hooks/usePagos";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface PagosTableProps {
  data: Pago[];
}

export function PagosTable({ data }: PagosTableProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-display font-semibold text-foreground">Últimos Pagos Registrados</h3>
      </div>
      <div className="overflow-x-auto thin-scrollbar max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm text-left text-muted-foreground font-body">
          <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-6 py-4 font-medium">Fecha</th>
              <th className="px-6 py-4 font-medium">Alumno</th>
              <th className="px-6 py-4 font-medium">Tutor</th>
              <th className="px-6 py-4 font-medium">Banco</th>
              <th className="px-6 py-4 font-medium text-right">Monto</th>
              <th className="px-6 py-4 font-medium text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((pago) => (
              <tr key={pago.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  {pago.fecha ? format(parseISO(pago.fecha), "dd MMM yyyy", { locale: es }) : '-'}
                </td>
                <td className="px-6 py-4 text-foreground font-medium">
                  {pago.nombre_alumno || 'Desconocido'}
                </td>
                <td className="px-6 py-4">
                  {pago.nombre_pagador || '-'}
                </td>
                <td className="px-6 py-4">
                  {pago.metodo || 'MP'}
                </td>
                <td className="px-6 py-4 text-right text-foreground font-medium">
                  ${Number(pago.monto).toLocaleString('es-AR')}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block
                    ${pago.estado_conciliacion?.toLowerCase() === 'confirmado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                    ${pago.estado_conciliacion?.toLowerCase() === 'confirmado_manualmente' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' : ''}
                    ${(pago.estado_conciliacion?.toLowerCase() !== 'confirmado' && pago.estado_conciliacion?.toLowerCase() !== 'confirmado_manualmente') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                  `}>
                    {pago.estado_conciliacion ? pago.estado_conciliacion.replace('_', ' ').toUpperCase() : 'SIN CONFIRMAR'}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No hay pagos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
