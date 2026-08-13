import { Cell, Pie, PieChart } from "recharts";
import { useState, useEffect } from "react";
import { MetricInfoTooltip } from "./MetricInfoTooltip";
import type { WeeklyData } from "@/hooks/usePagos";

const COLORS = {
  confirmados: '#3b82f6', // hsl(214, 100%, 55%)
  confirmadosManual: '#64748b', // hsl(215, 14%, 46%)
  sinConfirmar: '#ef4444' // hsl(0, 84.2%, 60.2%)
};

interface WeeklyChartProps {
  data: WeeklyData[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');

  useEffect(() => {
    // Si cargan las semanas y no hay una seleccionada, seleccionar la más reciente
    if (data.length > 0 && (!selectedWeekId || !data.some(week => week.id === selectedWeekId))) {
      setSelectedWeekId(data[0].id);
    }
  }, [data, selectedWeekId]);

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col items-center justify-center min-h-[250px] mb-8 w-full">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">Rendimiento Semanal</h3>
        <p className="text-muted-foreground">No hay datos semanales registrados.</p>
      </div>
    );
  }

  const week = data.find(w => w.id === selectedWeekId) || data[0];

  const pieData = [
    { name: 'Confirmados', value: week.confirmados, color: COLORS.confirmados },
    { name: 'Manuales', value: week.confirmadosManual, color: COLORS.confirmadosManual },
    { name: 'Sin Confirmar', value: week.sinConfirmar, color: COLORS.sinConfirmar },
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-6 w-full h-full">
        
        {/* Título y Selector de la semana */}
        <div className="w-full flex justify-center">
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-center min-[1000px]:w-fit min-[1000px]:gap-8">
            <div className="flex flex-col text-center sm:text-left min-[1000px]:text-center">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-display font-semibold text-foreground">Corte Semanal</h3>
                <MetricInfoTooltip content="Rendimiento y distribución de los pagos registrados durante la semana seleccionada." />
              </div>
              <span className="text-xs text-muted-foreground font-body">Rendimiento por semana</span>
            </div>
            <select 
              value={selectedWeekId} 
              onChange={(e) => setSelectedWeekId(e.target.value)}
              className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-[220px] min-[1000px]:w-[220px]"
            >
              {data.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Contenedor Inferior: Gráfica y Detalles */}
        <div className="w-full flex justify-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full min-[1000px]:w-fit min-[1000px]:gap-10">
            {/* Gráfico circular */}
            <div className="relative h-[140px] w-[140px] flex-shrink-0">
              <PieChart width={140} height={140}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-display font-bold text-foreground">{week.total}</span>
                <span className="text-[9px] text-muted-foreground font-body">registros</span>
              </div>
            </div>

            {/* Leyenda de datos */}
            <div className="flex flex-col gap-3 w-full sm:max-w-[220px] min-[1000px]:w-[220px] min-[1000px]:flex-none">
              <div className="flex items-center justify-between text-xs font-body p-2 rounded-lg bg-secondary/20">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.confirmados }} />
                  <span className="text-muted-foreground font-medium">Confirmados</span>
                </div>
                <div className="flex gap-1.5 font-semibold">
                  <span className="text-foreground">{week.confirmados}</span>
                  <span style={{ color: COLORS.confirmados }}>({week.total > 0 ? ((week.confirmados / week.total) * 100).toFixed(1) : '0'}%)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs font-body p-2 rounded-lg bg-secondary/20">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.confirmadosManual }} />
                  <span className="text-muted-foreground font-medium">Manuales</span>
                </div>
                <div className="flex gap-1.5 font-semibold">
                  <span className="text-foreground">{week.confirmadosManual}</span>
                  <span style={{ color: COLORS.confirmadosManual }}>({week.total > 0 ? ((week.confirmadosManual / week.total) * 100).toFixed(1) : '0'}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-body p-2 rounded-lg bg-secondary/20">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.sinConfirmar }} />
                  <span className="text-muted-foreground font-medium">Pendientes</span>
                </div>
                <div className="flex gap-1.5 font-semibold">
                  <span className="text-foreground">{week.sinConfirmar}</span>
                  <span style={{ color: COLORS.sinConfirmar }}>({week.total > 0 ? ((week.sinConfirmar / week.total) * 100).toFixed(1) : '0'}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
