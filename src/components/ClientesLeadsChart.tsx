import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ClientesLeadsChartProps {
  data: { name: string; value: number }[];
  total: number;
}

const getColor = (name: string) => {
  switch (name) {
    case 'Clientes':
      return 'hsl(214, 100%, 55%)'; // Azul vibrante
    case 'Leads':
      return 'hsl(25, 95%, 50%)'; // Naranja
    default:
      return 'hsl(215, 14%, 70%)'; // Gris suave para Sin Clasificar
  }
};

export function ClientesLeadsChart({ data, total }: ClientesLeadsChartProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-5 h-full">
      <h3 className="text-sm text-muted-foreground font-body font-medium">Público (Clientes vs. Leads)</h3>

      {/* Donut */}
      <div className="w-full h-[230px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                backgroundColor: 'white',
                fontFamily: 'Manrope, sans-serif'
              }}
              itemStyle={{ color: '#000' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-display font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground font-body">Consultas</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 flex-wrap pb-1">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getColor(entry.name) }} />
            <span className="text-xs font-body text-muted-foreground">
              {entry.name} <span className="font-semibold text-foreground">({entry.value})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
