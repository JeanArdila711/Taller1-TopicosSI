/* Constantes verificadas. Cada una lleva el id de su ficha en data/verificado.json.
   Ninguna cifra sin id: si no está verificada, no entra. */

export const FUENTE = {
  demandaSIN_TWh: { v: 84.049, id: "xm_demanda_sin_2025", n: "XM · DemaSIN 2025" },
  demandaSIN_GWhDia: { v: 230.3, id: "xm_demanda_sin_2025", n: "XM · DemaSIN 2025" },
  enficc_TWh: { v: 89.38, id: "xm_enficc_2025", n: "XM · ENFICC 2025" },
  capacidadSIN_MW: { v: 21287, id: "xm_capacidad_sin_2026", n: "XM · capacidad efectiva neta" },
  subsistencia_kWhMes: { v: 130, id: "upme_consumo_subsistencia", n: "Resolución UPME 355/2004" },
  poblacion: { v: 53e6, id: "dane_poblacion_2025", n: "DANE 2025" },
  rackIA_kW: { v: 120, id: "nvidia_nvl72_rack", n: "NVIDIA GB200 NVL72" },
  moduloUPS_kW: { v: 1500, id: "uptime_niveles", n: "supuesto del cuaderno" },
} as const;

/** Margen de energía firme sobre la demanda. DERIVADO por nosotros. */
export const MARGEN_FIRME_GWh = (FUENTE.enficc_TWh.v - FUENTE.demandaSIN_TWh.v) * 1000;

/** Calibración del hardware: reposo y carga como % de la placa. */
export const CALIBRACION = {
  medido: { reposo: 18, carga: 74, et: "Medición", id: "lbnl_gpu_reposo",
    nota: "8 GPU H100 medidos por Brookhaven (reposo) y Newkirk 2024 (carga)." },
  modelo: { reposo: 20, carga: 70, et: "Modelo LBNL", id: "lbnl_gpu_reposo",
    nota: "Lo que el LBNL usa en su propio modelo. Varía la carga entre 60 % y 80 %." },
} as const;
export type CalibId = keyof typeof CALIBRACION;

/** Sitio: carga clima + mezcla de generación en una sola perilla. */
export const SITIO = {
  medellin: {
    et: "Medellín", pais: "Colombia",
    factorEmision: 96.3, feId: "xm_factor_emision_2025",
    feRango: [53.1, 228.7] as [number, number],
    clima: "Tropical de altura, ~1.495 m. Temperatura estable todo el año.",
    agua: "Clase ASHRAE W27–W32 alcanzable; compresor la mayor parte del año.",
    climaId: "ashrae_clases_agua",
  },
  virginia: {
    et: "Virginia", pais: "Estados Unidos",
    factorEmision: 270.5, feId: "egrid_virginia_2023",
    feRango: null,
    clima: "Zona climática IECC 4A (mixto-húmedo). Diseño −10,6 °C / 32,8 °C.",
    agua: "Free cooling disponible en invierno, no en verano.",
    climaId: "clima_virginia_4a",
  },
} as const;
export type SitioId = keyof typeof SITIO;

/** Redundancia: cuántos módulos hay que comprar para sostener la carga. */
export const REDUNDANCIA = {
  N:      { et: "N",        desc: "Justo lo necesario",              mult: (n: number) => n },
  N1:     { et: "N+1",      desc: "Un módulo de repuesto",           mult: (n: number) => n + 1 },
  DOSN:   { et: "2N",       desc: "Dos sistemas completos",          mult: (n: number) => n * 2 },
  DOSN1:  { et: "2(N+1)",   desc: "Dos sistemas, cada uno con repuesto", mult: (n: number) => (n + 1) * 2 },
} as const;
export type RedundanciaId = keyof typeof REDUNDANCIA;

/** Frontera del sistema. Elegir más allá del edificio abre un hueco declarado. */
export const FRONTERA = {
  edificio: { et: "El edificio", hueco: null,
    desc: "Equipo informático + refrigeración + distribución eléctrica." },
  red: { et: "+ red y dispositivo",
    desc: "Sumaría la red que trae la consulta y el aparato que la pide.",
    hueco: "No tenemos cifra de nivel A para el consumo de red y dispositivo por carga de centro de datos. Se declara el hueco en vez de rellenarlo." },
  fabricacion: { et: "+ fabricación del chip",
    desc: "Sumaría la energía de fabricar el hardware.",
    hueco: "Sabemos que una planta avanzada de semiconductores consume como una ciudad media (PNUD, cap. 1), pero no hay reparto por chip ni por centro de datos. Hueco declarado." },
} as const;
export type FronteraId = keyof typeof FRONTERA;

/* ─────────────── Agua ───────────────
   OJO: el WUE se define sobre el kWh del EQUIPO INFORMÁTICO, no sobre el del
   medidor. LBNL 2024, pág. 39: «total water consumption of the data center
   divided by the electricity demand of the IT equipment». Dividir por el
   medidor sobreestima el agua en un factor igual al PUE. */

export const WUE_ANCLA = [
  { v: 0.36, et: "0,36 · parque EE. UU. 2023", id: "lbnl_wue_eeuu" },
  { v: 0.5,  et: "0,50 · promedio mundial",    id: "iea_wue_regional" },
  { v: 0.48, et: "0,48 · EE. UU. tras 2023",   id: "lbnl_wue_eeuu" },
  { v: 1.65, et: "1,65 · Asia-Pacífico",       id: "iea_wue_regional" },
] as const;

/** Consumo básico de agua que fija la CRA, por altitud. Resolución CRA 750/2016, art. 3. */
export const AGUA_CRA = {
  alta:  { m3mes: 11, et: "sobre 2.000 m" },
  media: { m3mes: 13, et: "entre 1.000 y 2.000 m" },
  baja:  { m3mes: 16, et: "bajo 1.000 m" },
} as const;

/** Medellín está a ~1.495 m, así que le corresponde la franja media. */
export const AGUA_VARA = AGUA_CRA.media;

/** Agua indirecta: la que se consume generando la electricidad. Solo hay cifra de EE. UU. */
export const AGUA_INDIRECTA_EEUU = {
  dc: 4.52, pais: 4.35, unidad: "L/kWh", id: "lbnl_agua_indirecta",
  hueco: "No hay cifra verificada de intensidad hídrica de la red colombiana. En EE. UU. el agua indirecta es unas 12 veces la directa, así que este hueco no es menor: es probablemente la parte más grande del consumo de agua, y no la podemos contar.",
} as const;

/** Presets de utilización del LBNL, por tipo de instalación (EE. UU., 2014 → 2027). */
export const PRESET_UTIL = [
  { et: "Internos y pequeños", v: 20, rango: "11 % → 20 %" },
  { et: "Colocación",          v: 35, rango: "21 % → 35 %" },
  { et: "Hiperescala",         v: 50, rango: "45 % → 50 %" },
] as const;

/* ─────────────── Mitad A · prospectiva mundial ─────────────── */

/** Anclas publicadas. Consumo total del parque mundial, TWh. */
export const ANCLAS: { anio: number; twh: number; fuente: string }[] = [
  { anio: 2020, twh: 269, fuente: "IEA/PNUD Table 2" },
  { anio: 2023, twh: 361, fuente: "IEA/PNUD Table 2" },
  { anio: 2024, twh: 416, fuente: "IEA/PNUD Table 2" },
  { anio: 2030, twh: 946, fuente: "IEA/PNUD Table 2" },
];

/** Consumo solo del equipo informático (panel de abajo de la misma tabla). */
export const ANCLAS_IT: { anio: number; twh: number }[] = [
  { anio: 2020, twh: 176 }, { anio: 2023, twh: 252 },
  { anio: 2024, twh: 295 }, { anio: 2030, twh: 733 },
];

/** Los cuatro casos de sensibilidad de la AIE a 2035. */
export const ESCENARIO = {
  headwinds: { et: "Headwinds", twh2035: 700,
    desc: "Vientos macro en contra y límites de adopción e infraestructura." },
  eficiencia: { et: "High Efficiency", twh2035: 960,
    desc: "Ganancias fuertes en eficiencia de hardware y modelos: 20 % bajo el Base." },
  base: { et: "Base", twh2035: 1200, desc: "Trayectoria central de la AIE." },
  liftoff: { et: "Lift-Off", twh2035: 1700,
    desc: "Más adopción de IA y menos cuellos de botella de red." },
} as const;
export type EscenarioId = keyof typeof ESCENARIO;

/** Consumo por consulta según dónde se ponga la frontera (Google, arXiv:2508.15734). */
export const CONSULTA = {
  amplia:   { et: "Metodología completa", wh: 0.24, co2: 0.03, agua: 0.26,
    desc: "Chips activos + CPU y memoria del anfitrión + máquinas en reposo + sobrecarga del edificio. Promedio de toda la flota." },
  estrecha: { et: "Solo chips activos", wh: 0.10, co2: 0.02, agua: 0.12,
    desc: "Frontera más estrecha Y muestra del 10 % de centros más eficientes. Son dos decisiones, no una." },
} as const;
export type ConsultaId = keyof typeof CONSULTA;

/** Crecimiento histórico publicado por la AIE. */
export const CRECIMIENTO_HISTORICO = 12;

/** Varas de traducción para el puente entre las dos mitades. */
export const VARA = {
  colombias: { et: "Colombias-año", id: "xm_demanda_sin_2025" },
  hogares:   { et: "Hogares de subsistencia", id: "upme_consumo_subsistencia" },
  personas:  { et: "Personas", id: "dane_poblacion_2025" },
  edificios: { et: "Edificios como el tuyo", id: null },
} as const;
export type VaraId = keyof typeof VARA;
