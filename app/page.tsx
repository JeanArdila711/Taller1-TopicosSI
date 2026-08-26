"use client";

import { useMemo, useState } from "react";
import { TITULO, SUBTITULO, INTEGRANTES, CURSO } from "./site";
import { Perilla, Segmentado, Cifra, Hueco, Bandera } from "@/components/Controles";
import {
  CALIBRACION, SITIO, REDUNDANCIA, FRONTERA, PRESET_UTIL, ESCENARIO, CONSULTA,
  CRECIMIENTO_HISTORICO, VARA, FUENTE,
  type CalibId, type SitioId, type RedundanciaId, type FronteraId,
  type EscenarioId, type ConsultaId, type VaraId,
} from "@/lib/datos";
import { modelarEdificio, modelarProspectiva, traducir, tiempoPais } from "@/lib/modelo";

const n0 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const n1 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const n2 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export default function Home() {
  /* ── Mitad B ── */
  const [placaMW, setPlaca] = useState(20);
  const [pue, setPue] = useState(1.4);
  const [utilPct, setUtil] = useState(40);
  const [sitio, setSitio] = useState<SitioId>("medellin");
  const [redundancia, setRed] = useState<RedundanciaId>("N");
  const [frontera, setFrontera] = useState<FronteraId>("edificio");
  const [calibracion, setCalib] = useState<CalibId>("medido");

  /* ── Mitad A ── */
  const [escenario, setEsc] = useState<EscenarioId>("base");
  const [usarTasaPropia, setUsarTasa] = useState(false);
  const [tasaPct, setTasa] = useState(CRECIMIENTO_HISTORICO);
  const [pueParqueOn, setPueParqueOn] = useState(false);
  const [pueParque, setPueParque] = useState(1.29);
  const [participacionIAPct, setIA] = useState(50);
  const [consulta, setConsulta] = useState<ConsultaId>("amplia");

  /* ── Puente ── */
  const [vara, setVara] = useState<VaraId>("colombias");

  const b = useMemo(
    () => modelarEdificio({ placaMW, pue, utilPct, sitio, redundancia, frontera, calibracion }),
    [placaMW, pue, utilPct, sitio, redundancia, frontera, calibracion],
  );
  const a = useMemo(
    () => modelarProspectiva({
      escenario, usarTasaPropia, tasaPct,
      pueParque: pueParqueOn ? pueParque : null,
      participacionIAPct, consulta,
    }),
    [escenario, usarTasaPropia, tasaPct, pueParqueOn, pueParque, participacionIAPct, consulta],
  );
  const puente = useMemo(() => traducir(b.anualGWh, a.v2035), [b.anualGWh, a.v2035]);
  const t = tiempoPais(b.diasPais);
  const s = SITIO[sitio];

  const varaValor: Record<VaraId, string> = {
    colombias: `${n2.format(puente.colombias)} Colombias-año`,
    hogares: `${n0.format(puente.hogares)} hogares`,
    personas: `${n0.format(puente.personas)} personas`,
    edificios: `${n0.format(puente.edificios)} edificios`,
  };

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-10 sm:px-8">

      {/* ── cabecera ── */}
      <header className="mb-10 border-b-2 border-ink pb-5">
        <p className="font-mono text-[10.5px] uppercase tracking-[.18em] text-ink-3">{CURSO}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{TITULO}</h1>
        <p className="mt-2 text-ink-2">{SUBTITULO}</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-ink-3">
          {INTEGRANTES.map((x) => <li key={x}>{x}</li>)}
        </ul>
      </header>

      {/* ══════════ MITAD B ══════════ */}
      <section className="mb-16">
        <div className="mb-5 flex items-baseline gap-3 border-b border-linea pb-2">
          <span className="font-mono text-[11px] uppercase tracking-[.15em]" style={{ color: "var(--amarillo)" }}>Mitad B</span>
          <h2 className="text-xl font-semibold tracking-tight">El edificio</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">

          {/* perillas */}
          <div className="flex flex-col gap-6">
            <Perilla
              etiqueta="Potencia informática instalada" acento="amarillo"
              valor={placaMW} min={1} max={500} paso={1} onChange={setPlaca}
              formato={(v) => `${n0.format(v)} MW`}
              anclas={[{ v: 100, et: "100 MW · referencia PNUD" }]}
              fuente="Placa del equipo. La referencia del PNUD para empleo y consumo es 100 MW."
            />

            <div className="flex flex-col gap-2">
              <Perilla
                etiqueta="Utilización del equipo" acento="amarillo"
                valor={utilPct} min={0} max={100} paso={1} onChange={setUtil}
                formato={(v) => `${n0.format(v)} %`}
                anclas={PRESET_UTIL.map((p) => ({ v: p.v, et: `${p.et} ${p.v} %` }))}
                fuente="LBNL 2024, pág. 27 · EE. UU. Es la perilla que más mueve el resultado: 1,90× contra 1,39× del PUE."
              />
              <div className="flex flex-wrap gap-2">
                {PRESET_UTIL.map((p) => (
                  <button key={p.et} type="button" onClick={() => setUtil(p.v)}
                    className="cursor-pointer border border-linea px-2.5 py-1.5 font-mono text-[10.5px] text-ink-2 transition-colors duration-200 hover:border-ink hover:text-ink focus-visible:outline-2"
                    style={{ outlineColor: "var(--amarillo)" }}>
                    {p.et} · {p.rango}
                  </button>
                ))}
              </div>
            </div>

            <Perilla
              etiqueta="PUE del edificio" acento="amarillo"
              valor={pue} min={1.05} max={1.9} paso={0.01} onChange={setPue}
              formato={(v) => n2.format(v)}
              anclas={[{ v: 1.15, et: "1,15 piso 2028" }, { v: 1.4, et: "1,40 parque 2023" }, { v: 1.6, et: "1,60 parque 2014" }]}
              fuente="LBNL 2024, pág. 47 · EE. UU. Proyecta entre 1,15 y 1,35 para 2028."
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Bandera activa={sitio === "medellin"} />
                <span className="font-mono text-[10.5px] text-ink-3">{s.pais}</span>
              </div>
              <Segmentado<SitioId>
                etiqueta="Sitio · clima y mezcla de generación" acento="amarillo"
                valor={sitio} onChange={setSitio}
                opciones={[
                  { id: "medellin", et: "Medellín", desc: `${SITIO.medellin.clima} ${SITIO.medellin.agua}` },
                  { id: "virginia", et: "Virginia", desc: `${SITIO.virginia.clima} ${SITIO.virginia.agua}` },
                ]}
                fuente={`Factor de emisión ${n1.format(s.factorEmision)} gCO₂e/kWh · ${sitio === "medellin" ? "XM 2025, promedio de 365 días" : "EPA eGRID2023, subregión SRVC"}`}
              />
            </div>

            <Segmentado<RedundanciaId>
              etiqueta="Nivel de redundancia" acento="amarillo" columnas={4}
              valor={redundancia} onChange={setRed}
              opciones={(Object.keys(REDUNDANCIA) as RedundanciaId[]).map((k) => ({
                id: k, et: REDUNDANCIA[k].et, desc: REDUNDANCIA[k].desc,
              }))}
              fuente="Uptime Institute. Módulo de UPS supuesto: 1.500 kW."
            />

            <Segmentado<FronteraId>
              etiqueta="Frontera declarada del sistema" acento="amarillo" columnas={3}
              valor={frontera} onChange={setFrontera}
              opciones={(Object.keys(FRONTERA) as FronteraId[]).map((k) => ({
                id: k, et: FRONTERA[k].et, desc: FRONTERA[k].desc,
              }))}
            />
            {b.hueco && <Hueco texto={b.hueco} />}
          </div>

          {/* salidas */}
          <div className="flex flex-col gap-5 border border-linea bg-paper-2 p-5">
            <div className="grid grid-cols-2 gap-5">
              <Cifra valor={n1.format(b.anualGWh)} unidad="GWh al año en el medidor" acento="amarillo" />
              <Cifra valor={n1.format(b.calorMW)} unidad="MW de calor a sacar de la sala" acento="amarillo" />
              <Cifra valor={n0.format(b.hogares)} unidad="hogares de subsistencia" />
              <Cifra valor={`${n2.format(b.pctDemandaPais)} %`} unidad="de la demanda eléctrica del país" />
              <Cifra valor={n0.format(b.tCO2e)} unidad={`tCO₂e al año en ${s.et}`} acento={sitio === "medellin" ? "amarillo" : "ink"} />
              <Cifra valor={`${n1.format(b.pctMargenFirme)} %`} unidad="del margen de energía firme del SIN" derivado />
            </div>

            <p className="border-t border-linea pt-4 text-[13.5px] leading-relaxed text-ink-2">
              <strong className="font-semibold text-ink">{n0.format(placaMW)} MW</strong> de placa a PUE{" "}
              <strong className="font-semibold text-ink">{n2.format(pue)}</strong> con{" "}
              <strong className="font-semibold text-ink">{n0.format(utilPct)} %</strong> de utilización piden{" "}
              <strong className="font-semibold text-ink">{n1.format(b.anualGWh)} GWh al año</strong>. Es lo que el
              sistema eléctrico colombiano entero entrega en{" "}
              <strong className="font-semibold text-ink">{n1.format(t.valor)} {t.unidad}</strong>, y lo que necesitarían{" "}
              <strong className="font-semibold text-ink">{n0.format(b.hogares)} hogares</strong> para vivir un año.
              Son <strong className="font-semibold text-ink">{n0.format(b.racks)} racks</strong> de IA de 120 kW.
            </p>

            {/* redundancia */}
            <div className="border-t border-linea pt-4">
              <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[.13em] text-ink-3">Lo que hay que comprar</p>
              <p className="text-[13px] leading-relaxed text-ink-2">
                Para sostener {n1.format(b.medidorMW)} MW hacen falta{" "}
                <strong className="text-ink">{b.modulosNecesarios} módulos</strong>, pero en{" "}
                {REDUNDANCIA[redundancia].et} hay que instalar{" "}
                <strong className="text-ink">{b.modulosInstalados}</strong> —{" "}
                <strong className="text-ink">{n1.format(b.upsCompradaMW)} MW de UPS</strong>, cada uno al{" "}
                <strong className="text-ink">{n0.format(b.factorCargaUPS)} %</strong> de carga.
              </p>
            </div>

            {/* reparto */}
            <div className="border-t border-linea pt-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[10.5px] uppercase tracking-[.13em] text-ink-3">De cada 100 vatios que entran</p>
                <Segmentado<CalibId>
                  etiqueta="" acento="ink" valor={calibracion} onChange={setCalib}
                  opciones={(Object.keys(CALIBRACION) as CalibId[]).map((k) => ({ id: k, et: CALIBRACION[k].et }))}
                />
              </div>
              <div className="flex h-7 w-full overflow-hidden border border-linea" role="img"
                aria-label={`Trabajo útil ${n1.format(b.reparto.trabajo)} %, ocio ${n1.format(b.reparto.ocio)} %, infraestructura ${n1.format(b.reparto.infraestructura)} %`}>
                <div style={{ width: `${b.reparto.trabajo}%`, background: "var(--amarillo)" }} />
                <div style={{ width: `${b.reparto.ocio}%`, background: "var(--rojo)" }} />
                <div style={{ width: `${b.reparto.infraestructura}%`, background: "var(--ink-3)" }} />
              </div>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-ink-2">
                <li><span aria-hidden style={{ color: "var(--amarillo)" }}>■</span> trabajo útil {n1.format(b.reparto.trabajo)} %</li>
                <li><span aria-hidden style={{ color: "var(--rojo)" }}>■</span> encendido sin trabajar {n1.format(b.reparto.ocio)} %</li>
                <li><span aria-hidden className="text-ink-3">■</span> refrigeración y distribución {n1.format(b.reparto.infraestructura)} %</li>
              </ul>
              <p className="mt-2 font-mono text-[10px] leading-snug text-ink-3">{CALIBRACION[calibracion].nota}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ MITAD A ══════════ */}
      <section className="mb-16">
        <div className="mb-5 flex items-baseline gap-3 border-b border-linea pb-2">
          <span className="font-mono text-[11px] uppercase tracking-[.15em]" style={{ color: "var(--azul)" }}>Mitad A</span>
          <h2 className="text-xl font-semibold tracking-tight">La prospectiva mundial</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col gap-6">
            <Segmentado<EscenarioId>
              etiqueta="Escenario de la AIE a 2035" acento="azul" columnas={2}
              valor={escenario} onChange={(v) => { setEsc(v); setUsarTasa(false); }}
              opciones={(Object.keys(ESCENARIO) as EscenarioId[]).map((k) => ({
                id: k, et: `${ESCENARIO[k].et} · ${ESCENARIO[k].twh2035}`, desc: ESCENARIO[k].desc,
              }))}
              fuente="IEA, Energy and AI. El rango publicado va de 700 a 1.700 TWh."
            />

            <div className="flex flex-col gap-2 border border-linea p-4">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={usarTasaPropia}
                  onChange={(e) => setUsarTasa(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-[var(--azul)]" />
                <span className="text-[13px] font-medium">Usar trayectoria propia en vez del escenario</span>
              </label>
              <Perilla
                etiqueta="Tasa de crecimiento anual" acento="azul"
                valor={tasaPct} min={0} max={25} paso={0.5} onChange={(v) => { setTasa(v); setUsarTasa(true); }}
                formato={(v) => `${n1.format(v)} %`}
                anclas={[{ v: CRECIMIENTO_HISTORICO, et: "12 % histórico AIE" }]}
                fuente="Compuesta desde los 415 TWh de 2024. El 12 % histórico llega a 1.447 TWh en 2035."
              />
              <p className="font-mono text-[10.5px]" style={{ color: a.dentroDeBanda ? "var(--ink-3)" : "var(--rojo)" }}>
                {a.dentroDeBanda
                  ? `Dentro de la banda publicada (${a.banda[0]}–${a.banda[1]} TWh)`
                  : `FUERA de la banda publicada (${a.banda[0]}–${a.banda[1]} TWh). Hay que justificarlo.`}
              </p>
            </div>

            <div className="flex flex-col gap-2 border border-linea p-4">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={pueParqueOn}
                  onChange={(e) => setPueParqueOn(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-[var(--azul)]" />
                <span className="text-[13px] font-medium">Reescalar por PUE del parque mundial</span>
              </label>
              <Perilla
                etiqueta="PUE del parque" acento="azul"
                valor={pueParque} min={1.05} max={1.6} paso={0.01}
                onChange={(v) => { setPueParque(v); setPueParqueOn(true); }}
                formato={(v) => n2.format(v)}
                anclas={[{ v: 1.29, et: "1,29 en 2030" }, { v: 1.41, et: "1,41 en 2024" }, { v: 1.53, et: "1,53 en 2020" }]}
                fuente="DERIVADO por nosotros: panel total ÷ panel IT de la Table 2 del PNUD."
              />
            </div>

            <Perilla
              etiqueta="Participación de la IA en el total" acento="azul"
              valor={participacionIAPct} min={0} max={100} paso={1} onChange={setIA}
              formato={(v) => `${n0.format(v)} %`}
              anclas={[{ v: 50, et: "≈ mitad del aumento neto a 2030" }]}
              fuente="La AIE publica que los servidores acelerados explican casi la mitad del AUMENTO NETO a 2030 — no del total. Esta perilla es un supuesto nuestro."
            />

            <Segmentado<ConsultaId>
              etiqueta="Frontera por consulta" acento="azul" columnas={2}
              valor={consulta} onChange={setConsulta}
              opciones={(Object.keys(CONSULTA) as ConsultaId[]).map((k) => ({
                id: k, et: `${CONSULTA[k].et} · ${n2.format(CONSULTA[k].wh)} Wh`, desc: CONSULTA[k].desc,
              }))}
              fuente="Google, arXiv:2508.15734. El factor de 2,4 entre las dos es textual del paper."
            />
          </div>

          <div className="flex flex-col gap-5 border border-linea bg-paper-2 p-5">
            <div className="grid grid-cols-2 gap-5">
              <Cifra valor={n0.format(a.v2035)} unidad="TWh mundiales en 2035" acento="azul" />
              <Cifra valor={n1.format(a.colombias2035)} unidad="Colombias-año" acento="azul" derivado />
              <Cifra valor={n0.format(a.ia2035)} unidad="TWh atribuibles a IA" derivado />
              <Cifra valor={`${n1.format(a.consultasIA / 1e12)} B`} unidad="billones de consultas equivalentes" derivado />
            </div>

            {/* serie */}
            <div className="border-t border-linea pt-4">
              <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[.13em] text-ink-3">
                Trayectoria 2020 – 2035
              </p>
              <Serie serie={a.serie} banda={a.banda} />
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-ink-3">
                <li>■ ancla publicada</li>
                <li>□ interpolado por nosotros</li>
                <li>▨ banda de la AIE a 2035</li>
              </ul>
            </div>

            <p className="border-t border-linea pt-4 text-[13px] leading-relaxed text-ink-2">
              Toda línea posterior a 2030 está interpolada entre el punto de 2030 de la AIE y el caso de 2035
              que elijas. <strong className="text-ink">No es una serie observada ni un pronóstico propio</strong>:
              es el rango que la AIE publica, recorrido.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ EL PUENTE ══════════ */}
      <section>
        <div className="mb-5 flex items-baseline gap-3 border-b border-linea pb-2">
          <span className="font-mono text-[11px] uppercase tracking-[.15em]">El puente</span>
          <h2 className="text-xl font-semibold tracking-tight">Las dos mitades, en la misma vara</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-start">
          <Segmentado<VaraId>
            etiqueta="Traducir a" columnas={2}
            valor={vara} onChange={setVara}
            opciones={(Object.keys(VARA) as VaraId[]).map((k) => ({ id: k, et: VARA[k].et }))}
            fuente="Cada vara responde una pregunta distinta. Declarar cuál se usó es parte del método."
          />
          <div className="border border-linea bg-paper-2 p-5">
            <p className="text-[15px] leading-relaxed text-ink-2">
              Tu edificio de <strong className="text-ink">{n0.format(placaMW)} MW</strong> en{" "}
              <strong className="text-ink">{s.et}</strong> consume{" "}
              <strong className="text-ink">{varaValor[vara]}</strong>.
              {vara === "edificios" ? (
                <> Es decir: los <strong className="text-ink">{n0.format(a.v2035)} TWh</strong> que el mundo
                  consumiría en 2035 son <strong className="text-ink">{n0.format(puente.edificios)}</strong> edificios como el tuyo.</>
              ) : (
                <> Y el mundo entero en 2035 sería{" "}
                  <strong className="text-ink">{n0.format(puente.edificios)}</strong> edificios como ese.</>
              )}
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-16 border-t border-linea pt-5 font-mono text-[10.5px] leading-relaxed text-ink-3">
        <p>
          Vara de medir: {n2.format(FUENTE.demandaSIN_TWh.v)} TWh de demanda del SIN en 2025 y{" "}
          {n0.format(FUENTE.capacidadSIN_MW.v)} MW de capacidad instalada, ambos de XM, sumados día por día por nosotros.
          Las cifras marcadas «derivado» son aritmética propia sobre fuentes verificadas.
        </p>
      </footer>
    </main>
  );
}

/* Serie en SVG. Sin librerías: es una polilínea y una banda. */
function Serie({ serie, banda }: { serie: { anio: number; twh: number; tipo: string }[]; banda: [number, number] }) {
  const W = 560, H = 170, P = { t: 10, r: 10, b: 22, l: 40 };
  const maxY = Math.max(banda[1], ...serie.map((s) => s.twh)) * 1.05;
  const x = (anio: number) => P.l + ((anio - 2020) / (2035 - 2020)) * (W - P.l - P.r);
  const y = (twh: number) => H - P.b - (twh / maxY) * (H - P.t - P.b);
  const d = serie.map((s, i) => `${i === 0 ? "M" : "L"}${x(s.anio).toFixed(1)},${y(s.twh).toFixed(1)}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[420px]" role="img"
        aria-label={`Consumo mundial de centros de datos de 2020 a 2035, terminando en ${Math.round(serie[serie.length - 1].twh)} TWh`}>
        <rect x={x(2035) - 6} y={y(banda[1])} width={12} height={Math.max(0, y(banda[0]) - y(banda[1]))}
          fill="var(--azul)" opacity={0.18} />
        {[0, maxY / 2, maxY].map((v) => (
          <g key={v}>
            <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="var(--linea)" strokeWidth={1} />
            <text x={P.l - 6} y={y(v) + 3} textAnchor="end" fontSize={9} fill="var(--ink-3)" fontFamily="var(--font-mono)">
              {Math.round(v)}
            </text>
          </g>
        ))}
        <path d={d} fill="none" stroke="var(--azul)" strokeWidth={2} />
        {serie.filter((s) => [2020, 2023, 2024, 2030, 2035].includes(s.anio)).map((s) => (
          <g key={s.anio}>
            <rect x={x(s.anio) - 3} y={y(s.twh) - 3} width={6} height={6}
              fill={s.anio === 2035 ? "var(--paper)" : "var(--azul)"} stroke="var(--azul)" strokeWidth={1.5} />
            <text x={x(s.anio)} y={H - 8} textAnchor="middle" fontSize={9} fill="var(--ink-3)" fontFamily="var(--font-mono)">
              {s.anio}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
