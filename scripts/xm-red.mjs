/* Factor de emisión del SIN (horario) y energía firme ENFICC (diaria), año completo.
   API pública de XM, sin llave. Ventanas de 31 días (MaxDays de la API). */
import { writeFileSync } from "node:fs";

const ANIO = Number(process.argv[2] ?? 2025);
const iso = (d) => d.toISOString().slice(0, 10);

async function pedir(url, MetricId, Entity, desde, hasta) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ MetricId, StartDate: iso(desde), EndDate: iso(hasta), Entity }),
  });
  if (!r.ok) throw new Error(`${r.status} ${MetricId} ${iso(desde)}`);
  return r.json();
}

async function anio(url, MetricId, Entity, extraer) {
  const out = [];
  let cursor = new Date(Date.UTC(ANIO, 0, 1));
  const fin = new Date(Date.UTC(ANIO, 11, 31));
  while (cursor <= fin) {
    const hasta = new Date(Math.min(cursor.getTime() + 30 * 864e5, fin.getTime()));
    const j = await pedir(url, MetricId, Entity, cursor, hasta);
    out.push(...(j.Items ?? []).flatMap(extraer));
    cursor = new Date(hasta.getTime() + 864e5);
  }
  // idempotente: una entrada por fecha, ordenada
  return [...new Map(out.map((d) => [d.fecha, d])).values()].sort((a, b) =>
    a.fecha.localeCompare(b.fecha),
  );
}

const num = (v) => (v === "" || v == null ? null : Number(v));

// factor de emisión: horario, gCO2e/kWh -> promedio simple del día
const fe = await anio(
  "https://servapibi.xm.com.co/hourly",
  "factorEmisionCO2e",
  "Sistema",
  (it) => {
    const v = it.HourlyEntities?.[0]?.Values ?? {};
    const horas = Object.entries(v)
      .filter(([k]) => /^Hour\d\d$/.test(k))
      .map(([, x]) => num(x))
      .filter((x) => x != null && !Number.isNaN(x));
    return horas.length
      ? [{ fecha: it.Date, gCO2ekWh: horas.reduce((a, b) => a + b, 0) / horas.length, horas: horas.length }]
      : [];
  },
);

// ENFICC: diaria, kWh
const enficc = await anio(
  "https://servapibi.xm.com.co/daily",
  "ENFICC",
  "Sistema",
  (it) => {
    const v = num(it.DailyEntities?.[0]?.Value);
    return v == null || Number.isNaN(v) ? [] : [{ fecha: it.Date, kWh: v }];
  },
);

const prom = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const feVals = fe.map((d) => d.gCO2ekWh);
const enVals = enficc.map((d) => d.kWh);

const resumen = {
  anio: ANIO,
  fuente: "XM, API pública servapibi.xm.com.co",
  factorEmision: {
    metrica: "factorEmisionCO2e por Sistema (Margen de Operación Simple)",
    unidad: "gCO2e/kWh",
    diasConDato: fe.length,
    promedioAnual: +prom(feVals).toFixed(1),
    minimo: { fecha: fe[feVals.indexOf(Math.min(...feVals))]?.fecha, valor: +Math.min(...feVals).toFixed(1) },
    maximo: { fecha: fe[feVals.indexOf(Math.max(...feVals))]?.fecha, valor: +Math.max(...feVals).toFixed(1) },
  },
  energiaFirme: {
    metrica: "ENFICC por Sistema",
    unidad: "kWh/día",
    diasConDato: enficc.length,
    promedioDiarioGWh: enVals.length ? +(prom(enVals) / 1e6).toFixed(1) : null,
    totalAnualTWh: enVals.length ? +(enVals.reduce((a, b) => a + b, 0) / 1e9).toFixed(2) : null,
  },
  descargado: new Date().toISOString().slice(0, 10),
};

writeFileSync(`data/xm-red-${ANIO}.json`, JSON.stringify({ resumen, factorEmision: fe, enficc }, null, 2));
console.log(JSON.stringify(resumen, null, 2));

console.assert(fe.length > 350, "faltan días de factor de emisión");
