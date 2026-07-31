import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface BankDistribution {
  name: string;
  count: number;
  percentage: number;
}

interface BankMetricsProps {
  data: BankDistribution[];
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
  "#64748b",
];

export function BankMetrics({ data }: BankMetricsProps) {
  const totalRegistros = data.reduce((acc, curr) => acc + curr.count, 0);
  const listMaxHeight = 5 * 38 + 4 * 8;

  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-5 w-full min-w-0 overflow-hidden">
      {data.length === 0 ? (
        <div className="flex h-[160px] items-center justify-center">
          <span className="text-muted-foreground text-sm font-body">No hay datos.</span>
        </div>
      ) : (
        <div className="w-full flex justify-center min-w-0">
          <div className="flex flex-col min-[480px]:flex-row items-center min-[480px]:items-start gap-6 w-full min-w-0 min-[1000px]:w-fit min-[1000px]:gap-6">
            <div className="flex flex-col gap-3 w-[200px] max-w-full flex-shrink-0">
              <div className="flex flex-col items-start gap-1 text-left">
                <h3 className="text-base font-display font-semibold text-foreground">Distribuci&oacute;n por Banco</h3>
                <span className="text-xs text-muted-foreground font-body">M&eacute;todos de pago</span>
              </div>

              <div className="relative h-[160px] w-[160px] self-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
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
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <span className="text-xl font-display font-bold text-foreground">{totalRegistros}</span>
                  <span className="text-[9px] text-muted-foreground font-body">total</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full min-w-0 sm:max-w-[220px] min-[1000px]:w-[220px] min-[1000px]:flex-none">
              <div
                className="flex h-[222px] min-h-0 flex-col gap-2 overflow-y-scroll overflow-x-hidden pr-2 thin-scrollbar"
                style={{
                  maxHeight: `${listMaxHeight}px`,
                  scrollbarGutter: "stable",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(100, 116, 139, 0.65) transparent",
                }}
              >
                {data.map((bank, index) => (
                  <div
                    key={bank.name}
                    className="flex h-[38px] min-h-[38px] items-center justify-between gap-2 text-xs font-body p-2 rounded-lg bg-secondary/20 min-w-0"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground font-medium truncate">{bank.name}</span>
                    </div>
                    <div className="flex flex-shrink-0 gap-1.5 font-semibold">
                      <span className="text-foreground">{bank.count}</span>
                      <span style={{ color: COLORS[index % COLORS.length] }}>
                        ({bank.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
