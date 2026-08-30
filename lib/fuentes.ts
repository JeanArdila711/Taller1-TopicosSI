/* Índice de las fichas de verificación.
   data/verificado.json es la única fuente de verdad: se lee, no se copia.
   Si una cifra no tiene ficha aquí, no debería estar en la pantalla. */

import bruto from "@/data/verificado.json";

export type Ficha = {
  id: string;
  estado: string;
  valor: string | number;
  unidad: string;
  queMide: string;
  nivel: string;
  fuente: string;
  documento: string;
  url: string;
  cobertura: string;
  periodo: string;
  verificadoPor: string;
  verificadoEl: string;
  dondeAparece: string;
  nota?: string;
};

export const FICHAS = bruto as Ficha[];

const POR_ID = new Map(FICHAS.map((f) => [f.id, f]));

export function ficha(id: string): Ficha | undefined {
  return POR_ID.get(id);
}

/** Número de referencia estable, en el orden en que están en el archivo. */
export const NUMERO = new Map(FICHAS.map((f, i) => [f.id, i + 1]));

/** Tres familias de ficha, cada una con su lectura distinta. */
export type Familia = "verificado" | "derivado" | "hueco";

export function familia(f: Ficha): Familia {
  const e = f.estado.toUpperCase();
  if (e.startsWith("HUECO")) return "hueco";
  if (e.startsWith("DERIVADO") || f.nivel.startsWith("derivado")) return "derivado";
  return "verificado";
}

export const ETIQUETA_FAMILIA: Record<Familia, string> = {
  verificado: "Verificado en la fuente",
  derivado: "Derivado por nosotros",
  hueco: "Hueco declarado",
};

/** Quién verificó qué. Para repartir el trabajo y para que se note en la defensa. */
export function porVerificador() {
  const m = new Map<string, Ficha[]>();
  for (const f of FICHAS) {
    const k = f.verificadoPor || "sin asignar";
    m.set(k, [...(m.get(k) ?? []), f]);
  }
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
}

/* ─────────────── Lo que todavía no tiene ficha ───────────────
   Constantes que el modelo usa y para las que aún no hay ficha de
   verificación. Se listan en la pantalla en vez de esconderse: mientras
   no la tengan, no son citables. La lista se compara contra
   data/verificado.json en `pnpm check`. */

export const SIN_FICHA: { id: string; queMide: string; origen: string }[] = [
  { id: "xm_capacidad_sin_2026", queMide: "21.287 MW de capacidad efectiva neta del SIN", origen: "XM · descargado, ficha pendiente" },
  { id: "dane_poblacion_2025", queMide: "53 millones de habitantes de Colombia", origen: "DANE · ficha pendiente" },
  { id: "nvidia_nvl72_rack", queMide: "120 kW por rack de IA", origen: "NVIDIA GB200 NVL72 · ficha pendiente" },
  { id: "uptime_niveles", queMide: "1.500 kW por módulo de UPS y los niveles N / N+1 / 2N", origen: "supuesto del cuaderno del curso" },
  { id: "ashrae_clases_agua", queMide: "clases de agua ASHRAE alcanzables en Medellín", origen: "ASHRAE · ficha pendiente" },
];
