import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  data: { name: string; value: number }[];
  totalLabel?: string;
  totalValue?: string | number;
}

// Colores específicos para los nuevos estados:
// Confirmado: Azul primary (hsl(214, 100%, 55%))
// Confirmado Manualmente: Muted (hsl(215, 14%, 46%))
// Sin Confirmar: Naranja/Rojo (hsl(0, 84.2%, 60.2%))
const getStatusColor = (name: string) => {
  switch (name) {
    case 'Confirmado': return 'hsl(214, 100%, 55%)';
    case 'Confirmado Manualmente': return 'hsl(215, 14%, 46%)';
    case 'Sin Confirmar': return 'hsl(0, 84.2%, 60.2%)';
    default: return 'hsl(215, 14%, 46%)';
  }
};

export function DonutChart({ data, totalLabel, totalValue }: DonutChartProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col h-full">
      <h3 className="text-sm text-muted-foreground font-body font-medium mb-4">Estado de Pagos</h3>
      <div className="flex-1 w-full h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontFamily: 'Manrope, sans-serif' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {totalValue !== undefined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-display font-bold text-foreground">{totalValue}</span>
            <span className="text-xs text-muted-foreground font-body">{totalLabel}</span>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(entry.name) }} />
            <span className="text-xs font-body text-muted-foreground">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
