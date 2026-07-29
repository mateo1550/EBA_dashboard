import { ShieldAlert, RefreshCw, EyeOff, ClipboardList } from "lucide-react";

interface TransferReasonRankingItem {
  reason: string;
  count: number;
  category: string;
  topic: string;
}

interface TransferRankingCardProps {
  derivacionesTotal: number;
  scopeCount: number;
  errorCount: number;
  protocolCount: number;
  porcentajeScope: number;
  porcentajeError: number;
  porcentajeProtocol: number;
  transferReasonRanking: TransferReasonRankingItem[];
}

export function TransferRankingCard({
  derivacionesTotal,
  scopeCount,
  errorCount,
  protocolCount,
  porcentajeScope,
  porcentajeError,
  porcentajeProtocol,
  transferReasonRanking,
}: TransferRankingCardProps) {
  
  const getCategoryLabel = (category: string) => {
    switch (category.toLowerCase()) {
      case 'scope': return 'Alcance';
      case 'error': return 'Error';
      case 'protocol': return 'Protocolo';
      default: return 'Sin clasificar';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'scope': return 'text-orange-500 bg-orange-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      case 'protocol': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-6 w-full h-full">
      {/* Header */}
      <div>
        <h3 className="text-xl font-display font-bold text-foreground mb-1">Derivaciones a Humanos</h3>
        <p className="text-sm text-muted-foreground font-body">Análisis de transferencias ({derivacionesTotal} en total)</p>
      </div>

      {/* Grid de Categorías */}
      <div className="grid grid-cols-3 gap-3">
        {/* Alcance */}
        <div className="bg-secondary/20 rounded-xl p-3 flex flex-col justify-between group relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1">
            <EyeOff className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider">Alcance</span>
          </div>
          <span className="text-2xl font-display font-bold text-orange-600 mt-2">{scopeCount}</span>
          <span className="text-[10px] text-muted-foreground font-body">{porcentajeScope.toFixed(0)}% del total</span>
        </div>

        {/* Error */}
        <div className="bg-secondary/20 rounded-xl p-3 flex flex-col justify-between group relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider">Error</span>
          </div>
          <span className="text-2xl font-display font-bold text-red-600 mt-2">{errorCount}</span>
          <span className="text-[10px] text-muted-foreground font-body">{porcentajeError.toFixed(0)}% del total</span>
        </div>

        {/* Protocolo */}
        <div className="bg-secondary/20 rounded-xl p-3 flex flex-col justify-between group relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1">
            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider">Protocolo</span>
          </div>
          <span className="text-2xl font-display font-bold text-blue-600 mt-2">{protocolCount}</span>
          <span className="text-[10px] text-muted-foreground font-body">{porcentajeProtocol.toFixed(0)}% del total</span>
        </div>
      </div>

      {/* Lista Ranking de Motivos */}
      <div className="flex flex-col flex-1">
        <h4 className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4 text-muted-foreground" />
          Ranking de motivos específicos
        </h4>
        
        {transferReasonRanking.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground font-body">No se registran derivaciones en este periodo</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 flex flex-col gap-2 thin-scrollbar">
            {transferReasonRanking.map((item, idx) => (
              <div 
                key={`${item.reason}-${idx}`} 
                className="flex items-center justify-between p-3 bg-secondary/10 rounded-xl border border-border/30 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex flex-col gap-0.5 max-w-[70%]">
                  <span className="text-xs font-body font-semibold text-foreground truncate">
                    {item.reason}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-medium font-body px-1.5 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-body">
                      Tema: {item.topic}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-body text-muted-foreground font-medium">Top {idx + 1}</span>
                  <span className="bg-primary/10 text-primary font-display font-bold text-xs px-2.5 py-1 rounded-lg">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
