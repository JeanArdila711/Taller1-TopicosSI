"use client";

import { useId } from "react";
import { Cita } from "@/components/Fuente";

type Acento = "amarillo" | "azul" | "ink";

/** Relleno (barras, pulgares, fondos) vs. texto: el amarillo de bandera
    es ilegible sobre papel blanco, así que tiene un par distinto. */
const RELLENO: Record<Acento, string> = {
  amarillo: "var(--amarillo)",
  azul: "var(--azul)",
  ink: "var(--ink)",
};
const TEXTO: Record<Acento, string> = {
  amarillo: "var(--amarillo-txt)",
  azul: "var(--azul)",
  ink: "var(--ink)",
};
/** Texto que va ENCIMA del relleno. */
const SOBRE_RELLENO: Record<Acento, string> = {
  amarillo: "#0a0a0a",
  azul: "var(--paper)",
  ink: "var(--paper)",
};

function vars(acento: Acento) {
  return {
    ["--acento" as string]: RELLENO[acento],
    ["--acento-txt" as string]: TEXTO[acento],
  };
}

/* ─────────────── Etiqueta común ─────────────── */

function Etiqueta({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  const clase = "font-mono text-nota uppercase tracking-[.13em] text-ink-3";
  return htmlFor
    ? <label htmlFor={htmlFor} className={clase}>{children}</label>
    : <span className={clase}>{children}</span>;
}

/* ─────────────── Perilla continua ─────────────── */

export function Perilla({
  etiqueta, valor, min, max, paso, onChange, formato,
  fuente, acento = "ink", anclas, citas,
}: {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  paso: number;
  onChange: (v: number) => void;
  formato: (v: number) => string;
  fuente?: string;
  acento?: Acento;
  anclas?: { v: number; et: string }[];
  citas?: string[];
}) {
  const id = useId();
  const pct = ((valor - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1" style={vars(acento)}>
      <div className="flex items-baseline justify-between gap-3">
        <Etiqueta htmlFor={id}>
          {etiqueta}
          {citas && <Cita ids={citas} />}
        </Etiqueta>
        <output htmlFor={id} className="text-mayor font-semibold leading-none">
          {formato(valor)}
        </output>
      </div>

      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={paso}
          value={valor}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10"
          aria-describedby={fuente ? `${id}-f` : undefined}
        />
        {/* pista recorrida */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 h-[2px] -translate-y-1/2"
          style={{ width: `${pct}%`, background: RELLENO[acento] }}
        />
        {/* marcas de anclas publicadas */}
        {anclas?.map((a) => (
          <div
            key={a.et}
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-3 w-[1px] -translate-y-1/2 bg-ink-3"
            style={{ left: `${((a.v - min) / (max - min)) * 100}%` }}
          />
        ))}
      </div>

      {anclas && anclas.length > 0 && (
        <ul className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-nota text-ink-3">
          {anclas.map((a) => (
            <li key={a.et} className="before:mr-1 before:content-['|']">{a.et}</li>
          ))}
        </ul>
      )}
      {fuente && (
        <p id={`${id}-f`} className="max-w-[62ch] font-mono text-nota leading-snug text-ink-3">
          {fuente}
        </p>
      )}
    </div>
  );
}

/* ─────────────── Perilla discreta ─────────────── */

export function Segmentado<T extends string>({
  etiqueta, valor, opciones, onChange, fuente, acento = "ink", columnas, columnasMovil, citas,
}: {
  etiqueta: string;
  valor: T;
  opciones: { id: T; et: string; desc?: string }[];
  onChange: (v: T) => void;
  fuente?: string;
  acento?: Acento;
  columnas?: number;
  columnasMovil?: number;
  citas?: string[];
}) {
  const activa = opciones.find((o) => o.id === valor);
  const cols = columnas ?? opciones.length;
  const colsM = columnasMovil ?? Math.min(cols, 2);

  return (
    <div className="flex flex-col gap-2" style={vars(acento)}>
      {etiqueta && (
        <Etiqueta>
          {etiqueta}
          {citas && <Cita ids={citas} />}
        </Etiqueta>
      )}
      <div
        role="radiogroup"
        aria-label={etiqueta || undefined}
        className="segmentado grid gap-[1px] border border-linea bg-linea"
        style={{ ["--cols" as string]: cols, ["--cols-m" as string]: colsM }}
      >
        {opciones.map((o) => {
          const on = o.id === valor;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.id)}
              className="min-h-[44px] cursor-pointer px-2 py-2 text-menor font-medium leading-tight transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              style={{
                background: on ? RELLENO[acento] : "var(--paper)",
                color: on ? SOBRE_RELLENO[acento] : "var(--ink-2)",
              }}
            >
              {o.et}
            </button>
          );
        })}
      </div>
      {activa?.desc && <p className="max-w-[62ch] text-menor leading-snug text-ink-2">{activa.desc}</p>}
      {fuente && <p className="max-w-[62ch] font-mono text-nota leading-snug text-ink-3">{fuente}</p>}
    </div>
  );
}

/* ─────────────── Salidas ─────────────── */

export function Cifra({
  valor, unidad, acento, derivado, citas,
}: {
  valor: string;
  unidad: string;
  acento?: Acento;
  derivado?: boolean;
  citas?: string[];
}) {
  return (
    <div
      className="flex flex-col gap-1 pt-2"
      style={{
        borderTop: acento ? `2px solid ${RELLENO[acento]}` : "1px solid var(--linea)",
      }}
    >
      <span
        className="tabular text-titulo font-semibold leading-none"
        style={derivado ? { textDecoration: "underline dotted", textUnderlineOffset: "5px", textDecorationColor: "var(--ink-3)" } : undefined}
      >
        {valor}
      </span>
      <span className="text-nota leading-snug text-ink-3">
        {unidad}
        {derivado && <span className="ml-1 font-mono uppercase tracking-[.08em]">· derivado</span>}
        {citas && <Cita ids={citas} />}
      </span>
    </div>
  );
}

/** Lo que el tablero decide NO contar. Va en letra chica al lado de la fuente:
    la advertencia importa, el cuadro rojo gritando no. */
export function Nota({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-[62ch] border-t border-linea pt-2 font-mono text-nota leading-snug text-ink-3">
      <strong className="font-medium text-ink-2">No contamos: </strong>{children}
    </p>
  );
}

export function Bandera({ activa }: { activa: boolean }) {
  if (!activa) return <div className="h-1 w-10 bg-ink-3/40" aria-hidden />;
  return (
    <div className="flex h-1 w-10 overflow-hidden" aria-label="Colombia" role="img">
      <div className="h-full flex-[2]" style={{ background: "var(--amarillo)" }} />
      <div className="h-full flex-1" style={{ background: "#003893" }} />
      <div className="h-full flex-1" style={{ background: "#CE1126" }} />
    </div>
  );
}
