
import { MetricInfoTooltip } from "./MetricInfoTooltip";

interface TopicRankingItem {
  topic: string;
  count: number;
  percentage: number;
}

interface TopicRankingCardProps {
  topicRanking: TopicRankingItem[];
}

export function TopicRankingCard({ topicRanking }: TopicRankingCardProps) {
  // Colores alternados para las barras de temas para hacer el diseño visualmente atractivo
  const getProgressBarColor = (index: number) => {
    const colors = [
      'bg-primary',
      'bg-[#4DD0E1]', // IA cian
      'bg-green-500',
      'bg-orange-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-gray-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-6 w-full h-full">
      {/* Header */}
      <div className="relative">
        <div className="absolute right-0 top-0">
          <MetricInfoTooltip content="Ranking de los temas consultados con mayor frecuencia durante el periodo seleccionado." />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-1">Tópicos Más Consultados</h3>
        <p className="text-sm text-muted-foreground font-body">Ranking de temas de consulta a Mateo</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 flex flex-col gap-4 thin-scrollbar">
        {topicRanking.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground font-body">No hay consultas registradas en este periodo</p>
          </div>
        ) : (
          topicRanking.map((item, idx) => (
            <div key={item.topic} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-body">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-muted-foreground w-4">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-foreground">{item.topic}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="bg-secondary px-2 py-0.5 rounded-md font-medium text-[10px]">
                    {item.count} {item.count === 1 ? 'consulta' : 'consultas'}
                  </span>
                  <span className="font-bold text-foreground">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(idx)}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
