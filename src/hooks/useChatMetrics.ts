import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface ChatInteraction {
  id: number;
  phone: string;
  conversation_id: string;
  started_at: string;
  ended_at: string | null;
  is_client: boolean | null;
  resolved_by: 'ai' | 'human' | null;
  transfer_category: 'scope' | 'error' | 'protocol' | null;
  transfer_reason: string | null;
  department_transfer: string | null;
  payment_status: 'intent' | 'success' | 'failed' | 'cancelled' | null;
  pay_consult: boolean | null;
  topic: string | null;
  created_at: string;
}

export interface TopicRankingItem {
  topic: string;
  count: number;
  percentage: number;
}

export interface TransferReasonRankingItem {
  reason: string;
  count: number;
  category: string;
  topic: string;
}

export interface DepartmentMetricItem {
  departamento: string;
  count: number; // Cantidad de personas recibidas
  avgResponseTime: number | null; // Tiempo promedio en minutos (null si no hay respuestas)
}

export interface ChatMetrics {
  totalConsultas: number;
  
  // Clientes vs Leads
  clientesCount: number;
  leadsCount: number;
  noDefinidoCount: number;
  porcentajeClientes: number;
  porcentajeLeads: number;
  porcentajeNoDefinido: number;
  clientesLeadsDistribucion: { name: string; value: number }[];

  // Resolución (Mateo vs Humano)
  aiCount: number;
  humanCount: number;
  porcentajeAi: number;
  porcentajeHuman: number;
  resolucionDistribucion: { name: string; value: number }[];

  // Intención vs Pago Efectivo
  intencionPagoCount: number;
  pagoEfectivoCount: number;
  porcentajePagoEfectivo: number;

  // Derivaciones a Humano
  derivacionesTotal: number;
  scopeCount: number;
  errorCount: number;
  protocolCount: number;
  noCategoryCount: number;
  porcentajeScope: number;
  porcentajeError: number;
  porcentajeProtocol: number;
  transferCategoryDistribucion: { name: string; value: number }[];
  transferReasonRanking: TransferReasonRankingItem[];

  // Ranking de Temas
  topicRanking: TopicRankingItem[];

  // Métricas por Departamento
  departamentosMetrics: DepartmentMetricItem[];
}

export function useChatMetrics(selectedMonth: Date = new Date()) {
  return useQuery({
    queryKey: ['chatMetrics', format(selectedMonth, 'yyyy-MM')],
    queryFn: async (): Promise<ChatMetrics> => {
      const inicio = startOfMonth(selectedMonth).toISOString();
      const fin = endOfMonth(selectedMonth).toISOString();

      const [
        { data: chatData, error: chatError },
        { data: responseTimesData, error: responseTimesError }
      ] = await Promise.all([
        supabase
          .from('data_dashboard')
          .select('*')
          .gte('started_at', inicio)
          .lte('started_at', fin),
        supabase
          .from('seguimiento_tiempos_respuesta')
          .select('*')
          .gte('derivado_en', inicio)
          .lte('derivado_en', fin)
      ]);

      if (chatError) {
        throw new Error(chatError.message);
      }
      if (responseTimesError) {
        throw new Error(responseTimesError.message);
      }

      const interactions = (chatData || []) as ChatInteraction[];
      const responseTimes = (responseTimesData || []) as any[];
      const totalConsultas = interactions.length;

      // 1. Clientes vs Leads
      let clientesCount = 0;
      let leadsCount = 0;
      let noDefinidoCount = 0;

      interactions.forEach(item => {
        if (item.is_client === true) {
          clientesCount++;
        } else if (item.is_client === false) {
          leadsCount++;
        } else {
          noDefinidoCount++;
        }
      });

      const porcentajeClientes = totalConsultas > 0 ? (clientesCount / totalConsultas) * 100 : 0;
      const porcentajeLeads = totalConsultas > 0 ? (leadsCount / totalConsultas) * 100 : 0;
      const porcentajeNoDefinido = totalConsultas > 0 ? (noDefinidoCount / totalConsultas) * 100 : 0;

      const clientesLeadsDistribucion = [
        { name: 'Clientes', value: clientesCount },
        { name: 'Leads', value: leadsCount },
        { name: 'Sin Clasificar', value: noDefinidoCount }
      ].filter(d => d.value > 0);

      // 2. Resolución (Mateo vs Humano)
      let aiCount = 0;
      let humanCount = 0;

      interactions.forEach(item => {
        if (item.resolved_by === 'ai') {
          aiCount++;
        } else if (item.resolved_by === 'human') {
          humanCount++;
        }
      });

      const totalResueltas = aiCount + humanCount;
      const porcentajeAi = totalResueltas > 0 ? (aiCount / totalResueltas) * 100 : 0;
      const porcentajeHuman = totalResueltas > 0 ? (humanCount / totalResueltas) * 100 : 0;

      const resolucionDistribucion = [
        { name: 'Mateo (AI)', value: aiCount },
        { name: 'Equipo (Humano)', value: humanCount }
      ].filter(d => d.value > 0);

      // 3. Intención vs Pago Efectivo
      let intencionPagoCount = 0;
      let pagoEfectivoCount = 0;

      interactions.forEach(item => {
        if (item.pay_consult === true) {
          intencionPagoCount++;
          // Si el cliente consultó por pagos y el estado del pago fue exitoso
          if (item.payment_status === 'success') {
            pagoEfectivoCount++;
          }
        }
      });

      const porcentajePagoEfectivo = intencionPagoCount > 0 ? (pagoEfectivoCount / intencionPagoCount) * 100 : 0;

      // 4. Derivaciones a Humano (resolved_by === 'human')
      let scopeCount = 0;
      let errorCount = 0;
      let protocolCount = 0;
      let noCategoryCount = 0;

      const humanInteractions = interactions.filter(item => item.resolved_by === 'human');
      const derivacionesTotal = humanInteractions.length;

      humanInteractions.forEach(item => {
        if (item.transfer_category === 'scope') {
          scopeCount++;
        } else if (item.transfer_category === 'error') {
          errorCount++;
        } else if (item.transfer_category === 'protocol') {
          protocolCount++;
        } else {
          noCategoryCount++;
        }
      });

      const porcentajeScope = derivacionesTotal > 0 ? (scopeCount / derivacionesTotal) * 100 : 0;
      const porcentajeError = derivacionesTotal > 0 ? (errorCount / derivacionesTotal) * 100 : 0;
      const porcentajeProtocol = derivacionesTotal > 0 ? (protocolCount / derivacionesTotal) * 100 : 0;

      const transferCategoryDistribucion = [
        { name: 'Alcance (Scope)', value: scopeCount },
        { name: 'Error', value: errorCount },
        { name: 'Protocolo', value: protocolCount }
      ].filter(d => d.value > 0);

      // Ranking de motivos específicos
      const reasonMap = new Map<string, { count: number; category: string; topic: string }>();
      humanInteractions.forEach(item => {
        const reason = (item.transfer_reason || 'Sin especificar').trim();
        const category = item.transfer_category || 'Sin clasificar';
        const topic = item.topic || 'Sin clasificar';
        
        const key = `${reason.toLowerCase()}::${category}::${topic}`;
        const existing = reasonMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          reasonMap.set(key, { count: 1, category, topic });
        }
      });

      const transferReasonRanking: TransferReasonRankingItem[] = Array.from(reasonMap.entries())
        .map(([key, value]) => {
          const parts = key.split('::');
          return {
            reason: parts[0].replace(/\b\w/g, l => l.toUpperCase()),
            count: value.count,
            category: value.category,
            topic: value.topic
          };
        })
        .sort((a, b) => b.count - a.count);

      // 5. Ranking de Temas Consultados
      const topicMap = new Map<string, number>();
      interactions.forEach(item => {
        let topic = (item.topic || 'otro').trim().toLowerCase();
        topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
      });

      const capitalizeTopic = (top: string): string => {
        const mapping: Record<string, string> = {
          pagos: 'Pagos',
          horarios: 'Horarios',
          uniformes: 'Uniformes',
          descuentos: 'Descuentos',
          inscripciones: 'Inscripciones',
          deuda: 'Deuda',
          cuota: 'Cuotas',
          otro: 'Otros'
        };
        return mapping[top] || top.replace(/\b\w/g, l => l.toUpperCase());
      };

      const topicRanking: TopicRankingItem[] = Array.from(topicMap.entries())
        .map(([topic, count]) => ({
          topic: capitalizeTopic(topic),
          count,
          percentage: totalConsultas > 0 ? (count / totalConsultas) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      // 6. Tiempos de Respuesta y Volumen por Departamento
      const depts = ['Dirección', 'Secretaría', 'Administración', 'Preceptoría', 'Reclamos y Quejas', 'Ventas'];
      const deptTotalsMap = new Map<string, { count: number; sumTime: number; countWithTime: number }>();
      
      depts.forEach(d => {
        deptTotalsMap.set(d.toLowerCase(), { count: 0, sumTime: 0, countWithTime: 0 });
      });

      responseTimes.forEach(item => {
        const dept = (item.departamento || '').trim();
        const deptKey = dept.toLowerCase();
        
        if (deptTotalsMap.has(deptKey)) {
          const stats = deptTotalsMap.get(deptKey)!;
          stats.count++;
          
          if (item.tiempo_respuesta_minutos !== null && item.tiempo_respuesta_minutos !== undefined) {
            const val = Math.max(0, Number(item.tiempo_respuesta_minutos));
            stats.sumTime += val;
            stats.countWithTime++;
          }
        }
      });

      const departamentosMetrics: DepartmentMetricItem[] = depts.map(d => {
        const stats = deptTotalsMap.get(d.toLowerCase())!;
        return {
          departamento: d,
          count: stats.count,
          avgResponseTime: stats.countWithTime > 0 ? (stats.sumTime / stats.countWithTime) : null
        };
      });

      return {
        totalConsultas,
        clientesCount,
        leadsCount,
        noDefinidoCount,
        porcentajeClientes,
        porcentajeLeads,
        porcentajeNoDefinido,
        clientesLeadsDistribucion,
        aiCount,
        humanCount,
        porcentajeAi,
        porcentajeHuman,
        resolucionDistribucion,
        intencionPagoCount,
        pagoEfectivoCount,
        porcentajePagoEfectivo,
        derivacionesTotal,
        scopeCount,
        errorCount,
        protocolCount,
        noCategoryCount,
        porcentajeScope,
        porcentajeError,
        porcentajeProtocol,
        transferCategoryDistribucion,
        transferReasonRanking,
        topicRanking,
        departamentosMetrics
      };
    },
  });
}
