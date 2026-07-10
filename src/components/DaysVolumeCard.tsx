import { Bar, BarChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface DaysVolumeCardProps {
  diasVolumen: { dia: string; count: number }[];
}

export function DaysVolumeCard({ diasVolumen }: DaysVolumeCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-5 w-full mt-6">
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-display font-bold text-foreground">Volumen por Día del Mes</h2>
          </div>
          <p className="text-sm text-muted-foreground font-body">Cantidad de pagos registrados cada día del mes actual</p>
        </div>
      </div>
      
      <div className="h-[300px] w-full mt-2">
        {(!diasVolumen || diasVolumen.length === 0) ? (
          <p className="text-sm text-muted-foreground font-body">No hay datos suficientes</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diasVolumen} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="dia" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                allowDecimals={false}
              />
              <RechartsTooltip 
                cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: 'hsl(var(--foreground))'
                }}
                itemStyle={{ color: '#000000' }}
                labelFormatter={(label) => `Día ${label}`}
                formatter={(value: any) => [value, 'Pagos']}
              />
              <Bar 
                dataKey="count" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
