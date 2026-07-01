import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format, parseISO, nextFriday, previousSaturday, isSaturday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WeeklyData } from './usePagos';

export function useSemanas() {
  return useQuery({
    queryKey: ['todas_las_semanas'],
    queryFn: async (): Promise<WeeklyData[]> => {
      // Obtenemos solo los campos necesarios para agrupar por semana
      const { data, error } = await supabase
        .from('pagos')
        .select('fecha, estado_conciliacion')
        .order('fecha', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const pagos = data || [];
      const semanasMap = new Map<string, WeeklyData>();

      pagos.forEach((pago: any) => {
        const estado = pago.estado_conciliacion?.toLowerCase() || '';
        
        let normalizedState = 'Sin Confirmar';
        if (estado === 'confirmado') {
          normalizedState = 'Confirmado';
        } else if (estado === 'confirmado_manualmente') {
          normalizedState = 'Confirmado Manualmente';
        }

        if (pago.fecha) {
          const pagoDate = parseISO(pago.fecha);
          
          let cutoffDate = pagoDate.getDay() === 5 ? pagoDate : nextFriday(pagoDate);
          let startDate = isSaturday(pagoDate) ? pagoDate : previousSaturday(cutoffDate);
          
          const weekId = format(cutoffDate, 'yyyy-MM-dd');
          // Incluimos el año en el nombre para cuando se vean todos los del año
          const weekName = `Del ${format(startDate, 'dd MMM', { locale: es })} al ${format(cutoffDate, 'dd MMM yyyy', { locale: es })}`;
          
          if (!semanasMap.has(weekId)) {
            semanasMap.set(weekId, {
              id: weekId,
              name: weekName,
              total: 0,
              confirmados: 0,
              confirmadosManual: 0,
              sinConfirmar: 0
            });
          }
          const weekData = semanasMap.get(weekId)!;
          weekData.total++;
          if (normalizedState === 'Confirmado') weekData.confirmados++;
          else if (normalizedState === 'Confirmado Manualmente') weekData.confirmadosManual++;
          else weekData.sinConfirmar++;
        }
      });

      // Ordenar cronológicamente descendente (más reciente primero)
      return Array.from(semanasMap.values()).sort((a, b) => b.id.localeCompare(a.id));
    },
  });
}
