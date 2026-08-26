"use client";

import { useId } from "react";

type Acento = "amarillo" | "azul" | "ink";
const ACENTO: Record<Acento, string> = {
  amarillo: "var(--amarillo)",
  azul: "var(--azul)",
  ink: "var(--ink)",
};

/* ─────────────── Perilla continua ─────────────── */

export function Perilla({
  etiqueta, valor, min, max, paso, onChange, formato,
  fuente, acento = "ink", anclas,
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
}) {
  const id = useId();
  const pct = ((valor - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1" style={{ ["--acento" as string]: ACENTO[acento] }}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[.13em] text-ink-3">
          {etiqueta}
        </label>
        <output htmlFor={id} className="font-sans text-xl font-semibold tabular-nums">
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
          style={{ width: `${pct}%`, background: ACENTO[acento] }}
        />
        {/* marcas de anclas publicadas */}
        {anclas?.map((a) => (
          <div
            key={a.et}
            aria-hidden
            title={a.et}
            className="pointer-events-none absolute top-1/2 h-3 w-[1px] -translate-y-1/2 bg-ink-3"
            style={{ left: `${((a.v - min) / (max - min)) * 100}%` }}
          />
        ))}
      </div>

      {anclas && anclas.length > 0 && (
        <div className="flex flex-wrap gap-x-3 font-mono text-[10px] text-ink-3">
          {anclas.map((a) => (
            <span key={a.et}>| {a.et}</span>
          ))}
        </div>
      )}
      {fuente && (
        <p id={`${id}-f`} className="font-mono text-[10px] leading-snug text-ink-3">
          {fuente}
        </p>
      )}
    </div>
  );
}

/* ─────────────── Perilla discreta ─────────────── */

export function Segmentado<T extends string>({
  etiqueta, valor, opciones, onChange, fuente, acento = "ink", columnas,
}: {
  etiqueta: string;
  valor: T;
  opciones: { id: T; et: string; desc?: string }[];
  onChange: (v: T) => void;
  fuente?: string;
  acento?: Acento;
  columnas?: number;
}) {
  const activa = opciones.find((o) => o.id === valor);
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[.13em] text-ink-3">{etiqueta}</span>
      <div
        role="radiogroup"
        aria-label={etiqueta}
        className="grid gap-[1px] border border-linea bg-linea"
        style={{ gridTemplateColumns: `repeat(${columnas ?? opciones.length}, minmax(0,1fr))` }}
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
              className="min-h-[44px] cursor-pointer px-2 py-2 font-sans text-[13px] font-medium leading-tight transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              style={{
                background: on ? ACENTO[acento] : "var(--paper)",
                color: on ? (acento === "amarillo" ? "#0a0a0a" : "var(--paper)") : "var(--ink-2)",
                outlineColor: ACENTO[acento],
              }}
            >
              {o.et}
            </button>
          );
        })}
      </div>
      {activa?.desc && <p className="text-[12.5px] leading-snug text-ink-2">{activa.desc}</p>}
      {fuente && <p className="font-mono text-[10px] leading-snug text-ink-3">{fuente}</p>}
    </div>
  );
}

/* ─────────────── Salidas ─────────────── */

export function Cifra({
  valor, unidad, acento, derivado,
}: {
  valor: string;
  unidad: string;
  acento?: Acento;
  derivado?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-l-2 pl-3" style={{ borderColor: acento ? ACENTO[acento] : "var(--linea)" }}>
      <span className="font-sans text-[26px] font-semibold leading-none tabular-nums">{valor}</span>
      <span className="text-[12px] leading-tight text-ink-3">
        {unidad}
        {derivado && <span className="ml-1 font-mono text-[10px] uppercase text-ink-3">· derivado</span>}
      </span>
    </div>
  );
}

export function Hueco({ texto }: { texto: string }) {
  return (
    <div
      className="flex gap-2.5 border p-3"
      style={{ borderColor: "var(--rojo)", background: "color-mix(in srgb, var(--rojo) 7%, transparent)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rojo)" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden>
        <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" strokeLinecap="round" />
      </svg>
      <p className="text-[12.5px] leading-snug" style={{ color: "var(--rojo)" }}>
        <strong className="font-semibold">Hueco declarado. </strong>{texto}
      </p>
    </div>
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
