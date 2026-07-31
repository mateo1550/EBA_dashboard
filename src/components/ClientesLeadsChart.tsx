import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ClientesLeadsChartProps {
  data: { name: string; value: number }[];
  total: number;
}

const getColor = (name: string) => {
  switch (name) {
    case "Clientes":
      return "hsl(214, 100%, 55%)";
    case "Leads":
      return "hsl(25, 95%, 50%)";
    default:
      return "hsl(215, 14%, 70%)";
  }
};

export function ClientesLeadsChart({ data, total }: ClientesLeadsChartProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-5 w-full min-w-0 overflow-x-auto">
      <div className="flex min-w-[430px] flex-row items-center justify-between gap-5 w-full">
        <div className="flex flex-col gap-3 w-[220px] flex-shrink-0">
          <div className="flex flex-col items-start gap-1 text-left">
            <h3 className="text-base font-display font-semibold text-foreground">P&uacute;blico (Clientes vs. Leads)</h3>
          </div>
          <div className="w-[180px] h-[180px] relative self-center">
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
                    backgroundColor: "white",
                    fontFamily: "Manrope, sans-serif",
                  }}
                  itemStyle={{ color: "#000" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-display font-bold text-foreground">{total}</span>
              <span className="text-xs text-muted-foreground font-body">Consultas</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-[220px] flex-shrink-0 self-center">
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
  );
}
