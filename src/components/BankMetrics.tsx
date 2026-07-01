import { Cell, Pie, PieChart } from "recharts";
import { Building2 } from "lucide-react";

interface BankDistribution {
  name: string;
  count: number;
  percentage: number;
}

interface BankMetricsProps {
  data: BankDistribution[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6366f1', // indigo
  '#64748b', // slate
];

export function BankMetrics({ data }: BankMetricsProps) {
  const totalRegistros = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-6 w-full">
      
      {/* Título */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <h3 className="text-base font-display font-semibold text-foreground">Distribución por Banco</h3>
          <span className="text-xs text-muted-foreground font-body">Métodos de pago</span>
        </div>
        <Building2 className="w-5 h-5 text-muted-foreground" />
      </div>

      {data.length === 0 ? (
        <div className="flex h-[140px] items-center justify-center">
          <span className="text-muted-foreground text-sm font-body">No hay datos.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Gráfico circular */}
          <div className="flex flex-row items-center justify-center w-full">
            <div className="relative h-[160px] w-[160px] flex-shrink-0">
              <PieChart width={160} height={160}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-display font-bold text-foreground">{totalRegistros}</span>
                <span className="text-[9px] text-muted-foreground font-body">total</span>
              </div>
            </div>
          </div>
          
          {/* Leyenda de datos */}
          <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
            {data.map((bank, index) => (
              <div key={index} className="flex items-center justify-between text-xs font-body p-2 rounded-lg bg-secondary/20">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-muted-foreground font-medium truncate max-w-[120px]">{bank.name}</span>
                </div>
                <div className="flex gap-1.5 font-semibold">
                  <span className="text-foreground">{bank.count}</span>
                  <span style={{ color: COLORS[index % COLORS.length] }}>({bank.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
