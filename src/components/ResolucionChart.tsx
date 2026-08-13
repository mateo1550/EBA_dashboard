import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { MetricInfoTooltip } from "./MetricInfoTooltip";

interface ResolucionChartProps {
  data: { name: string; value: number }[];
  total: number;
}

const getColor = (name: string) => {
  switch (name) {
    case "Mateo (AI)":
      return "#4DD0E1";
    case "Equipo (Humano)":
      return "#64B5F6";
    default:
      return "hsl(215, 14%, 70%)";
  }
};

export function ResolucionChart({ data, total }: ResolucionChartProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-6 w-full min-w-0">
      <div className="flex flex-col items-center text-center gap-1">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-base font-display font-semibold text-foreground">Resoluci&oacute;n de Consultas</h3>
          <MetricInfoTooltip content="Muestra cuántas consultas fueron resueltas por Mateo (IA) y cuántas requirieron intervención del equipo humano." />
        </div>
      </div>

      <div className="w-full flex justify-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full min-[1000px]:w-fit min-[1000px]:gap-10">
          <div className="w-[180px] h-[180px] relative flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={78} paddingAngle={3} dataKey="value" stroke="none">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    backgroundColor: "var(--color-popover)",
                    fontFamily: "Manrope, sans-serif",
                  }}
                  itemStyle={{ color: "var(--color-popover-foreground)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-display font-bold text-foreground">{total}</span>
              <span className="text-xs text-muted-foreground font-body">Resueltas</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full sm:max-w-[220px] min-[1000px]:w-[220px] min-[1000px]:flex-none">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between gap-2 text-xs font-body p-2 rounded-lg bg-secondary/20 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getColor(entry.name) }} />
                  <span className="text-muted-foreground font-medium truncate">{entry.name}</span>
                </div>
                <span className="font-semibold text-foreground flex-shrink-0 whitespace-nowrap">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
