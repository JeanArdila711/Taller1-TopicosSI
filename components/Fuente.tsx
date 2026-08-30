"use client";

/* Aparato de fuentes.
   Toda cifra de la pantalla lleva un marcador numerado que abre su ficha.
   El marcador es un <button> real y la ficha un <dialog> nativo: foco atrapado,
   Escape para cerrar y cero dependencias. */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FICHAS, NUMERO, ETIQUETA_FAMILIA, familia, ficha, type Ficha, type Familia } from "@/lib/fuentes";

const COLOR_FAMILIA: Record<Familia, string> = {
  verificado: "var(--ink)",
  derivado: "var(--azul)",
  hueco: "var(--rojo)",
};

const Abrir = createContext<(id: string) => void>(() => {});

/* ─────────────── Marcador de cita ─────────────── */

export function Cita({ ids }: { ids: string[] }) {
  const abrir = useContext(Abrir);
  const validos = ids.filter((id) => ficha(id));
  if (validos.length === 0) return null;

  return (
    <span className="ml-1 inline-flex align-super">
      {validos.map((id, i) => {
        const f = ficha(id)!;
        const fam = familia(f);
        return (
          <button
            key={id}
            type="button"
            onClick={() => abrir(id)}
            title={`${f.fuente} — ver ficha`}
            aria-label={`Ver ficha de la fuente ${NUMERO.get(id)}: ${f.queMide}`}
            className="cursor-pointer px-[1px] font-mono text-[10px] font-medium leading-none underline decoration-dotted underline-offset-2 transition-colors duration-150 hover:decoration-solid focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: COLOR_FAMILIA[fam], outlineColor: COLOR_FAMILIA[fam] }}
          >
            {i > 0 && <span aria-hidden>,</span>}
            {NUMERO.get(id)}
          </button>
        );
      })}
    </span>
  );
}

/* ─────────────── Sello de familia ─────────────── */

export function Sello({ f }: { f: Ficha }) {
  const fam = familia(f);
  return (
    <span
      className="inline-flex items-center gap-1.5 border px-2 py-[3px] font-mono text-[10.5px] uppercase tracking-[.1em]"
      style={{ borderColor: COLOR_FAMILIA[fam], color: COLOR_FAMILIA[fam] }}
    >
      <span aria-hidden className="inline-block h-[6px] w-[6px]" style={{ background: COLOR_FAMILIA[fam] }} />
      {ETIQUETA_FAMILIA[fam]}
    </span>
  );
}

/* ─────────────── Proveedor + panel ─────────────── */

export function ProveedorFuentes({ children }: { children: React.ReactNode }) {
  const [id, setId] = useState<string | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  const abrir = useCallback((x: string) => setId(x), []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (id && !d.open) d.showModal();
    if (!id && d.open) d.close();
  }, [id]);

  const f = id ? ficha(id) : undefined;

  return (
    <Abrir.Provider value={abrir}>
      {children}
      <dialog
        ref={ref}
        onClose={() => setId(null)}
        onClick={(e) => {
          // clic en el backdrop: el target es el propio <dialog>
          if (e.target === ref.current) setId(null);
        }}
        aria-label="Ficha de verificación de la fuente"
        className="ficha m-0 w-full max-w-[560px] border border-ink bg-paper p-0 text-ink"
      >
        {f && <CuerpoFicha f={f} onCerrar={() => setId(null)} />}
      </dialog>
    </Abrir.Provider>
  );
}

function CuerpoFicha({ f, onCerrar }: { f: Ficha; onCerrar: () => void }) {
  return (
    <div className="flex max-h-[85vh] flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-linea px-5 py-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-ink-3">Ficha {NUMERO.get(f.id)} de {FICHAS.length}</span>
            <Sello f={f} />
          </div>
          <h2 className="text-balance text-[17px] font-semibold leading-tight">{f.queMide}</h2>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar ficha"
          className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:outline-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto px-5 py-4">
        <p className="mb-4 font-mono text-[13px] leading-relaxed">
          <strong className="text-[15px] font-semibold">{String(f.valor)}</strong>{" "}
          <span className="text-ink-2">{f.unidad}</span>
        </p>

        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px] leading-snug">
          <Fila k="Estado">{f.estado}</Fila>
          <Fila k="Nivel">{f.nivel}</Fila>
          <Fila k="Fuente">{f.fuente}</Fila>
          <Fila k="Documento">{f.documento}</Fila>
          <Fila k="Cobertura">{f.cobertura}</Fila>
          <Fila k="Periodo">{f.periodo}</Fila>
          <Fila k="Dónde aparece">{f.dondeAparece}</Fila>
          <Fila k="Verificó">{f.verificadoPor} · {f.verificadoEl}</Fila>
        </dl>

        {f.nota && (
          <p className="mt-4 border-l-2 border-linea pl-3 text-[13px] leading-relaxed text-ink-2">{f.nota}</p>
        )}
      </div>

      <div className="border-t border-linea px-5 py-3">
        <a
          href={f.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[36px] items-center gap-2 font-mono text-[12px] underline underline-offset-4 transition-colors duration-150 hover:text-ink-2 focus-visible:outline-2"
        >
          Abrir la fuente original
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function Fila({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">{k}</dt>
      <dd className="text-ink-2">{children}</dd>
    </>
  );
}

/* ─────────────── Listado completo ─────────────── */

export function TablaFuentes() {
  const abrir = useContext(Abrir);
  return (
    <ul className="divide-y divide-linea border-y border-linea">
      {FICHAS.map((f) => (
        <li key={f.id}>
          <button
            type="button"
            onClick={() => abrir(f.id)}
            className="grid w-full cursor-pointer grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-3 gap-y-1 px-1 py-3 text-left transition-colors duration-150 hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] sm:grid-cols-[2rem_minmax(0,1fr)_auto]"
          >
            <span className="font-mono text-[12px] tabular-nums text-ink-3">{NUMERO.get(f.id)}</span>
            <span className="flex flex-col gap-1">
              <span className="text-[14px] font-medium leading-snug">{f.queMide}</span>
              <span className="font-mono text-[11.5px] leading-snug text-ink-3">
                {f.fuente} · {f.periodo}
              </span>
            </span>
            <span className="col-start-2 sm:col-start-3 sm:justify-self-end sm:pl-4">
              <Sello f={f} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
