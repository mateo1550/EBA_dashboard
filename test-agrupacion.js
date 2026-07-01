import { parseISO, nextFriday, format } from 'date-fns';

const pagos = [
  {
    id: 3,
    monto: 70600,
    fecha: '2026-06-19',
    estado_conciliacion: 'confirmado',
    nombre_alumno: 'Sanchez, Tobias Ezequiel',
    nombre_pagador: 'Veronica Natalia Pelayo',
  }
];

const semanasMap = new Map();

pagos.forEach(pago => {
  const estado = pago.estado_conciliacion?.toLowerCase() || '';
  
  let normalizedState = 'Sin Confirmar';
  if (estado === 'confirmado') {
    normalizedState = 'Confirmado';
  } else if (estado === 'confirmado manualmente') {
    normalizedState = 'Confirmado Manualmente';
  }

  if (pago.fecha) {
    const pagoDate = parseISO(pago.fecha);
    let cutoffDate = pagoDate.getDay() === 5 ? pagoDate : nextFriday(pagoDate);
    
    const weekLabel = `Corte ${format(cutoffDate, 'dd/MM')}`;
    
    if (!semanasMap.has(weekLabel)) {
      semanasMap.set(weekLabel, {
        name: weekLabel,
        confirmados: 0,
        confirmadosManual: 0,
        sinConfirmar: 0
      });
    }
    const weekData = semanasMap.get(weekLabel);
    if (normalizedState === 'Confirmado') weekData.confirmados++;
    else if (normalizedState === 'Confirmado Manualmente') weekData.confirmadosManual++;
    else weekData.sinConfirmar++;
  }
});

console.log(Array.from(semanasMap.values()).reverse());
