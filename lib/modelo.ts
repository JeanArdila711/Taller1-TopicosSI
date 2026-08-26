/* Modelo del tablero. Funciones puras: mismas entradas, mismas salidas.
   Toda salida derivada se marca como tal en la UI, no aquí. */

import {
  FUENTE, MARGEN_FIRME_GWh, CALIBRACION, SITIO, REDUNDANCIA, FRONTERA,
  ANCLAS, ANCLAS_IT, ESCENARIO, CONSULTA,
  type CalibId, type SitioId, type RedundanciaId, type FronteraId,
  type EscenarioId, type ConsultaId,
} from "./datos";

const HORAS_ANIO = 8760;

/* ─────────────── Mitad B · el edificio ─────────────── */

export type EntradasEdificio = {
  placaMW: number;
  pue: number;
  utilPct: number;
  sitio: SitioId;
  redundancia: RedundanciaId;
  frontera: FronteraId;
  calibracion: CalibId;
};

export type SalidasEdificio = ReturnType<typeof modelarEdificio>;

export function modelarEdificio(e: EntradasEdificio) {
  const c = CALIBRACION[e.calibracion];
  const util = e.utilPct / 100;

  // TI = placa × (reposo + (carga − reposo) × utilización)
  const fraccionTI = (c.reposo + (c.carga - c.reposo) * util) / 100;
  const tiMW = e.placaMW * fraccionTI;
  const medidorMW = tiMW * e.pue;
  const anualGWh = (medidorMW * HORAS_ANIO) / 1000;
  const anualkWh = anualGWh * 1e6;

  // Equivalencias, cada una con su vara declarada
  const hogares = anualkWh / (FUENTE.subsistencia_kWhMes.v * 12);
  const pctDemandaPais = (anualGWh / (FUENTE.demandaSIN_TWh.v * 1000)) * 100;
  const pctMargenFirme = (anualGWh / MARGEN_FIRME_GWh) * 100;
  const diasPais = anualGWh / FUENTE.demandaSIN_GWhDia.v;
  const racks = (e.placaMW * 1000) / FUENTE.rackIA_kW.v;

  // Emisiones según el sitio. gramos → toneladas es ÷1e6, no ÷1e9.
  const s = SITIO[e.sitio];
  const tCO2e = (anualkWh * s.factorEmision) / 1e6;
  const tCO2eRango = s.feRango
    ? ([(anualkWh * s.feRango[0]) / 1e6, (anualkWh * s.feRango[1]) / 1e6] as [number, number])
    : null;

  // Redundancia: módulos que hay que comprar para sostener la carga del medidor
  const modulosNecesarios = Math.ceil((medidorMW * 1000) / FUENTE.moduloUPS_kW.v);
  const modulosInstalados = REDUNDANCIA[e.redundancia].mult(modulosNecesarios);
  const upsCompradaMW = (modulosInstalados * FUENTE.moduloUPS_kW.v) / 1000;
  const factorCargaUPS = upsCompradaMW > 0 ? (medidorMW / upsCompradaMW) * 100 : 0;

  // Reparto de cada 100 vatios que entran por el medidor
  const den = c.reposo + (c.carga - c.reposo) * util;
  const inversoPUE = 1 / e.pue;
  const reparto = {
    trabajo: (((c.carga - c.reposo) * util) / den) * inversoPUE * 100,
    ocio: (c.reposo / den) * inversoPUE * 100,
    infraestructura: (1 - inversoPUE) * 100,
  };

  return {
    tiMW, medidorMW, anualGWh, calorMW: tiMW,
    hogares, pctDemandaPais, pctMargenFirme, diasPais, racks,
    tCO2e, tCO2eRango,
    modulosNecesarios, modulosInstalados, upsCompradaMW, factorCargaUPS,
    reparto,
    hueco: FRONTERA[e.frontera].hueco,
  };
}

/* ─────────────── Mitad A · prospectiva mundial ─────────────── */

export type EntradasProspectiva = {
  escenario: EscenarioId;
  usarTasaPropia: boolean;
  tasaPct: number;
  pueParque: number | null; // null = el implícito de la tabla
  participacionIAPct: number;
  consulta: ConsultaId;
};

/** Interpolación geométrica entre dos anclas. No es pronóstico: es recorrer el tramo. */
function interpolar(a: { anio: number; twh: number }, b: { anio: number; twh: number }, anio: number) {
  if (b.anio === a.anio) return a.twh;
  const t = (anio - a.anio) / (b.anio - a.anio);
  return a.twh * Math.pow(b.twh / a.twh, t);
}

/** PUE implícito del parque: panel total ÷ panel IT de la misma tabla. DERIVADO. */
export function pueImplicito(anio: number) {
  const tot = serieAnclas(ANCLAS, anio);
  const it = serieAnclas(ANCLAS_IT, anio);
  return it > 0 ? tot / it : 1;
}

function serieAnclas(anclas: { anio: number; twh: number }[], anio: number) {
  if (anio <= anclas[0].anio) return anclas[0].twh;
  for (let i = 0; i < anclas.length - 1; i++) {
    if (anio <= anclas[i + 1].anio) return interpolar(anclas[i], anclas[i + 1], anio);
  }
  return anclas[anclas.length - 1].twh;
}

export type PuntoSerie = { anio: number; twh: number; tipo: "observado" | "interpolado" | "proyectado" };

export function modelarProspectiva(e: EntradasProspectiva) {
  const fin2035 = e.usarTasaPropia
    ? 416 * Math.pow(1 + e.tasaPct / 100, 2035 - 2024)
    : ESCENARIO[e.escenario].twh2035;

  const ancla2030 = ANCLAS[ANCLAS.length - 1];
  const serie: PuntoSerie[] = [];

  for (let anio = 2020; anio <= 2035; anio++) {
    let twh: number;
    let tipo: PuntoSerie["tipo"];

    if (anio <= 2030) {
      twh = serieAnclas(ANCLAS, anio);
      const esAncla = ANCLAS.some((a) => a.anio === anio);
      tipo = esAncla ? "observado" : "interpolado";
      if (anio === 2030) tipo = "proyectado";
    } else {
      twh = interpolar(ancla2030, { anio: 2035, twh: fin2035 }, anio);
      tipo = "proyectado";
    }

    // El PUE del parque reescala el total: si el usuario lo mueve, mueve el edificio, no el equipo
    if (e.pueParque !== null) {
      const it = anio <= 2030 ? serieAnclas(ANCLAS_IT, anio) : (twh / pueImplicito(2030));
      twh = it * e.pueParque;
    }
    serie.push({ anio, twh, tipo });
  }

  const v2035 = serie[serie.length - 1].twh;
  const ia2035 = v2035 * (e.participacionIAPct / 100);
  const c = CONSULTA[e.consulta];

  // Cuántas consultas caben en la porción de IA, a la frontera elegida
  const consultasIA = (ia2035 * 1e9) / (c.wh / 1000); // TWh → kWh → consultas
  const colombias2035 = v2035 / FUENTE.demandaSIN_TWh.v;

  // La banda publicada por la AIE, para saber si la trayectoria propia se sale
  const banda: [number, number] = [ESCENARIO.headwinds.twh2035, ESCENARIO.liftoff.twh2035];
  const dentroDeBanda = v2035 >= banda[0] && v2035 <= banda[1];

  return { serie, v2035, ia2035, consultasIA, colombias2035, banda, dentroDeBanda };
}

/* ─────────────── El puente ─────────────── */

/** Días o horas de Colombia entera, en la unidad que el lector aguanta. */
export function tiempoPais(dias: number) {
  return dias < 1
    ? { valor: dias * 24, unidad: "horas" as const }
    : { valor: dias, unidad: "días" as const };
}

export function traducir(anualGWh: number, prospectiva2035TWh: number) {
  const anualkWh = anualGWh * 1e6;
  return {
    colombias: anualGWh / (FUENTE.demandaSIN_TWh.v * 1000),
    hogares: anualkWh / (FUENTE.subsistencia_kWhMes.v * 12),
    personas: anualkWh / ((FUENTE.demandaSIN_TWh.v * 1e9) / FUENTE.poblacion.v),
    /** Cuántos edificios como el configurado caben en la proyección mundial de 2035. */
    edificios: anualGWh > 0 ? (prospectiva2035TWh * 1000) / anualGWh : 0,
  };
}
