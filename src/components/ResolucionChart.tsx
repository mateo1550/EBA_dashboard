import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ResolucionChartProps {
  data: { name: string; value: number }[];
  total: number;
}

const getColor = (name: string) => {
  switch (name) {
    case 'Mateo (AI)':
      return '#4DD0E1'; // Cian para IA
    case 'Equipo (Humano)':
      return '#64B5F6'; // Azul suave para Humanos
    default:
      return 'hsl(215, 14%, 70%)';
  }
};

export function ResolucionChart({ data, total }: ResolucionChartProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col h-full">
      <h3 className="text-sm text-muted-foreground font-body font-medium mb-4">Resolución de Consultas</h3>
      <div className="flex-1 w-full h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
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
          <span className="text-xs text-muted-foreground font-body">Resueltas</span>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(entry.name) }} />
            <span className="text-xs font-body text-muted-foreground">
              {entry.name} ({entry.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
