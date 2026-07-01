import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, format, parseISO, nextFriday, previousSaturday, isSaturday, getDaysInMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export interface Pago {
  id: number;
  monto: number;
  fecha: string;
  estado_conciliacion: string;
  nombre_alumno: string;
  nombre_pagador: string; // Tutor
  metodo: string; // Banco
  comprobante_numerico: string;
}

export interface WeeklyData {
  id: string;
  name: string;
  total: number;
  confirmados: number;
  confirmadosManual: number;
  sinConfirmar: number;
}

export interface PagosMetrics {
  totalRegistrados: number;
  totalHistorico: number;
  pagosWhatsapp: number;
  pagosConfirmados: number;
  pagosConfirmadosManual: number;
  pagosSinConfirmar: number;
  porcentajeConfirmados: number;
  porcentajeConfirmadosManual: number;
  porcentajeSinConfirmar: number;
  distribucionEstados: { name: string; value: number }[];
  pagosRecientes: Pago[];
  datosSemanales: WeeklyData[];
  metodosDistribucion: { name: string; count: number; percentage: number }[];
  diasVolumen: { dia: string; count: number }[];
}

export function usePagos(selectedMonth: Date = new Date()) {
  return useQuery({
    queryKey: ['pagos', format(selectedMonth, 'yyyy-MM')],
    queryFn: async (): Promise<PagosMetrics> => {
      const inicio = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const fin = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

      const [
        { data, error },
        { count: totalHistorico, error: errorHistorico },
        { count: pagosWhatsapp, error: errorWhatsapp }
      ] = await Promise.all([
        supabase
          .from('pagos')
          .select('*')
          .gte('fecha', inicio)
          .lte('fecha', fin)
          .order('fecha', { ascending: false }),
        supabase
          .from('pagos')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('pagos_whatsapp')
          .select('*', { count: 'exact', head: true })
          .gte('fecha', inicio)
          .lte('fecha', fin)
      ]);

      if (error) {
        throw new Error(error.message);
      }
      if (errorHistorico) {
        throw new Error(errorHistorico.message);
      }
      if (errorWhatsapp) {
        throw new Error(errorWhatsapp.message);
      }

      const pagos = (data || []) as Pago[];

      let pagosConfirmados = 0;
      let pagosConfirmadosManual = 0;
      let pagosSinConfirmar = 0;

      const semanasMap = new Map<string, WeeklyData>();

      pagos.forEach(pago => {
        const estado = pago.estado_conciliacion?.toLowerCase() || '';
        
        let normalizedState = 'Sin Confirmar';
        if (estado === 'confirmado') {
          normalizedState = 'Confirmado';
          pagosConfirmados++;
        } else if (estado === 'confirmado_manualmente') {
          normalizedState = 'Confirmado Manualmente';
          pagosConfirmadosManual++;
        } else {
          pagosSinConfirmar++;
        }

        if (pago.fecha) {
          const pagoDate = parseISO(pago.fecha);
          
          let cutoffDate = pagoDate.getDay() === 5 ? pagoDate : nextFriday(pagoDate);
          let startDate = isSaturday(pagoDate) ? pagoDate : previousSaturday(cutoffDate);
          
          const weekId = format(cutoffDate, 'yyyy-MM-dd');
          const weekName = `Del ${format(startDate, 'dd MMM', { locale: es })} al ${format(cutoffDate, 'dd MMM', { locale: es })}`;
          
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

      const totalRegistrados = pagos.length;
      
      const porcentajeConfirmados = totalRegistrados > 0 ? (pagosConfirmados / totalRegistrados) * 100 : 0;
      const porcentajeConfirmadosManual = totalRegistrados > 0 ? (pagosConfirmadosManual / totalRegistrados) * 100 : 0;
      const porcentajeSinConfirmar = totalRegistrados > 0 ? (pagosSinConfirmar / totalRegistrados) * 100 : 0;

      const distribucionEstados = [
        { name: 'Confirmado', value: pagosConfirmados },
        { name: 'Confirmado Manualmente', value: pagosConfirmadosManual },
        { name: 'Sin Confirmar', value: pagosSinConfirmar },
      ].filter(d => d.value > 0);

      // Calcular distribución de métodos (bancos)
      const metodosMap = new Map<string, number>();
      pagos.forEach(pago => {
        let metodo = (pago.metodo || 'no definido').trim().toLowerCase();
        if (metodo === 'no_definido' || metodo === '') {
          metodo = 'no definido';
        }
        metodosMap.set(metodo, (metodosMap.get(metodo) || 0) + 1);
      });

      const metodosDistribucion = Array.from(metodosMap.entries())
        .map(([name, count]) => ({
          name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Capitalizar
          count,
          percentage: totalRegistrados > 0 ? (count / totalRegistrados) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count); // Ordenar de mayor a menor

      // Ordenar cronológicamente ascendente por id (fecha de corte)
      const datosSemanales = Array.from(semanasMap.values()).sort((a, b) => a.id.localeCompare(b.id));

      // Calcular volumen por día del mes
      const daysInMonth = getDaysInMonth(selectedMonth);
      const diasMesMap = new Map<number, number>();
      for (let i = 1; i <= daysInMonth; i++) {
        diasMesMap.set(i, 0);
      }
      
      pagos.forEach(pago => {
        if (pago.fecha) {
          // parseISO interpreta la fecha correctamente
          const pagoDate = parseISO(pago.fecha);
          const dia = pagoDate.getDate(); // 1 a 31
          if (diasMesMap.has(dia)) {
            diasMesMap.set(dia, diasMesMap.get(dia)! + 1);
          }
        }
      });
      
      const diasVolumen = Array.from(diasMesMap.entries()).map(([dia, count]) => ({
        dia: dia.toString(),
        count
      }));

      return {
        totalRegistrados,
        totalHistorico: totalHistorico || 0,
        pagosWhatsapp: pagosWhatsapp || 0,
        pagosConfirmados,
        pagosConfirmadosManual,
        pagosSinConfirmar,
        porcentajeConfirmados,
        porcentajeConfirmadosManual,
        porcentajeSinConfirmar,
        distribucionEstados,
        pagosRecientes: pagos,
        datosSemanales,
        metodosDistribucion,
        diasVolumen,
      };
    },
  });
}
