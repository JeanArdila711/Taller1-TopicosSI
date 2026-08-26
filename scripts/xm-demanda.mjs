/* Baja la serie diaria DemaSIN de XM para un año y la guarda cruda.
   API pública, sin llave. Ventanas de 30 días (límite de la API). */
import { writeFileSync } from "node:fs";

const ANIO = Number(process.argv[2] ?? 2025);
const API = "https://servapibi.xm.com.co/daily";

const iso = (d) => d.toISOString().slice(0, 10);

async function ventana(desde, hasta) {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      MetricId: "DemaSIN",
      StartDate: iso(desde),
      EndDate: iso(hasta),
      Entity: "Sistema",
    }),
  });
  if (!r.ok) throw new Error(`${r.status} en ${iso(desde)}..${iso(hasta)}`);
  const j = await r.json();
  return j.Items.map((it) => ({
    fecha: it.Date,
    kWh: Number(it.DailyEntities[0].Value),
  }));
}

const dias = [];
let cursor = new Date(Date.UTC(ANIO, 0, 1));
const fin = new Date(Date.UTC(ANIO, 11, 31));

while (cursor <= fin) {
  const hasta = new Date(Math.min(cursor.getTime() + 29 * 864e5, fin.getTime()));
  dias.push(...(await ventana(cursor, hasta)));
  cursor = new Date(hasta.getTime() + 864e5);
}

// idempotente: dedup por fecha y orden estable
const porFecha = new Map(dias.map((d) => [d.fecha, d]));
const serie = [...porFecha.values()].sort((a, b) => a.fecha.localeCompare(b.fecha));

const totalKWh = serie.reduce((s, d) => s + d.kWh, 0);
const max = serie.reduce((a, b) => (b.kWh > a.kWh ? b : a));
const min = serie.reduce((a, b) => (b.kWh < a.kWh ? b : a));

const esBisiesto = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const esperados = esBisiesto(ANIO) ? 366 : 365;

const resumen = {
  metrica: "DemaSIN por Sistema",
  fuente: "XM, API pública servapibi.xm.com.co",
  anio: ANIO,
  diasEsperados: esperados,
  diasRecibidos: serie.length,
  faltantes: esperados - serie.length,
  totalTWh: +(totalKWh / 1e9).toFixed(3),
  promedioDiarioGWh: +(totalKWh / serie.length / 1e6).toFixed(1),
  maximo: { fecha: max.fecha, GWh: +(max.kWh / 1e6).toFixed(1) },
  minimo: { fecha: min.fecha, GWh: +(min.kWh / 1e6).toFixed(1) },
  descargado: new Date().toISOString().slice(0, 10),
};

writeFileSync(`data/xm-demasin-${ANIO}.json`, JSON.stringify({ resumen, serie }, null, 2));
console.log(JSON.stringify(resumen, null, 2));

// check: la serie tiene que estar completa y sumar lo que dice el resumen
const recomputo = +(serie.reduce((s, d) => s + d.kWh, 0) / 1e9).toFixed(3);
console.assert(serie.length === esperados, `faltan ${esperados - serie.length} días`);
console.assert(recomputo === resumen.totalTWh, "el total no reproduce la serie");
console.log(serie.length === esperados ? "\n✓ serie completa, sin rellenar faltantes" : "\n⚠ SERIE INCOMPLETA");
