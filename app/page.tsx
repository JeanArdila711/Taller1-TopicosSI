"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, ReferenceArea,
} from "recharts";
import { TITULO, SUBTITULO, INTEGRANTES, CURSO } from "./site";
import { Perilla, Segmentado, Cifra, Nota, Bandera } from "@/components/Controles";
import { ProveedorFuentes, Cita } from "@/components/Fuente";
import { FICHAS } from "@/lib/fuentes";
import {
  CALIBRACION, SITIO, REDUNDANCIA, FRONTERA, PRESET_UTIL, ESCENARIO, CONSULTA,
  CRECIMIENTO_HISTORICO, VARA, FUENTE, WUE_ANCLA, AGUA_VARA, AGUA_INDIRECTA_EEUU,
  type CalibId, type SitioId, type RedundanciaId, type FronteraId,
  type EscenarioId, type ConsultaId, type VaraId,
} from "@/lib/datos";
import { modelarEdificio, modelarProspectiva, traducir, tiempoPais } from "@/lib/modelo";

const n0 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const n1 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const n2 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

/** Tres cifras significativas, pase lo que pase con la magnitud. */
function nSig(v: number) {
  if (!Number.isFinite(v) || v === 0) return "0";
  const dec = Math.min(6, Math.max(0, 2 - Math.floor(Math.log10(Math.abs(v)))));
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: dec }).format(v);
}

const SECCIONES = [
  { id: "edificio", et: "El edificio" },
  { id: "mundo", et: "El mundo" },
  { id: "puente", et: "El puente" },
];

export default function Home() {
  /* ── Mitad B ── */
  const [placaMW, setPlaca] = useState(20);
  const [pue, setPue] = useState(1.4);
  const [utilPct, setUtil] = useState(40);
  const [sitio, setSitio] = useState<SitioId>("medellin");
  const [redundancia, setRed] = useState<RedundanciaId>("N");
  const [frontera, setFrontera] = useState<FronteraId>("edificio");
  const [calibracion, setCalib] = useState<CalibId>("medido");
  const [wue, setWue] = useState(0.5);

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

  /* Qué sección está a la vista, para que el nav diga dónde estás. */
  const [seccionActiva, setSeccionActiva] = useState(SECCIONES[0].id);
  const vistas = useRef(new Map<string, number>());
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) vistas.current.set(e.target.id, e.intersectionRatio);
        const [top] = [...vistas.current].sort((a, b) => b[1] - a[1]);
        if (top && top[1] > 0) setSeccionActiva(top[0]);
      },
      { rootMargin: "-64px 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const x of SECCIONES) {
      const el = document.getElementById(x.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, []);

  const base = { placaMW, pue, utilPct, redundancia, frontera, calibracion, wue };
  const b = useMemo(
    () => modelarEdificio({ ...base, sitio }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [placaMW, pue, utilPct, sitio, redundancia, frontera, calibracion, wue],
  );
  /* El enunciado pide comparar los dos sitios, no elegir uno: el mismo edificio,
     modelado dos veces, cambiando solo la mezcla de generación. */
  const comparador = useMemo(
    () => (["medellin", "virginia"] as SitioId[]).map((s) => ({
      id: s, sitio: SITIO[s], salida: modelarEdificio({ ...base, sitio: s }),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [placaMW, pue, utilPct, redundancia, frontera, calibracion, wue],
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
  const limpio = comparador[0].salida.tCO2e <= comparador[1].salida.tCO2e ? comparador[0] : comparador[1];
  const sucio = limpio === comparador[0] ? comparador[1] : comparador[0];

  const varaValor: Record<VaraId, string> = {
    colombias: `${nSig(puente.colombias)} Colombias-año`,
    hogares: `${n0.format(puente.hogares)} hogares`,
    personas: `${n0.format(puente.personas)} personas`,
    edificios: `${n0.format(puente.edificios)} edificios`,
  };

  return (
    <ProveedorFuentes>
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">

        {/* ══════════ portada ══════════ */}
        <header className="border-b-2 border-ink pb-6 pt-10">
          <p className="font-mono text-nota uppercase tracking-[.18em] text-ink-3">{CURSO}</p>
          <h1 className="mt-3 max-w-[16ch] text-portada font-semibold tracking-tight">{TITULO}</h1>
          <p className="mt-3 max-w-[52ch] text-mayor text-ink-2">{SUBTITULO}</p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <ul className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-menor text-ink-3">
              {INTEGRANTES.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <p className="font-mono text-nota text-ink-3">
              {FICHAS.length} fichas de verificación · toca el número junto a cualquier cifra
            </p>
          </div>
        </header>

        {/* ══════════ navegación ══════════ */}
        <nav
          aria-label="Secciones del tablero"
          className="sticky top-0 z-30 -mx-5 mb-12 border-b border-linea bg-paper/95 px-5 backdrop-blur-sm sm:-mx-8 sm:px-8"
        >
          <ul className="flex gap-1 overflow-x-auto">
            {SECCIONES.map((x) => {
              const activa = x.id === seccionActiva;
              return (
                <li key={x.id}>
                  <a
                    href={`#${x.id}`}
                    aria-current={activa ? "location" : undefined}
                    className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap border-b-2 px-3 font-mono text-menor transition-colors duration-150 hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                    style={{
                      borderColor: activa ? "var(--ink)" : "transparent",
                      color: activa ? "var(--ink)" : "var(--ink-2)",
                      fontWeight: activa ? 600 : 400,
                    }}
                  >
                    {x.et}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <main id="tablero" className="pb-24">

          {/* ══════════ MITAD B ══════════ */}
          <section id="edificio" className="mb-20 scroll-mt-16">
            <Rotulo tono="amarillo" mitad="Mitad B" titulo="El edificio"
              bajada="Un centro de datos concreto. Se declara la frontera, se mueven las perillas y sale lo que pide en energía, calor y agua." />

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">

              {/* perillas, agrupadas en cuatro decisiones en vez de un muro de controles */}
              <div className="flex min-w-0 flex-col gap-9">
                <div className="flex flex-col gap-6">
                  <Rubro>01 · La carga que se monta</Rubro>
                  <Perilla
                    etiqueta="Potencia informática instalada" acento="amarillo"
                    valor={placaMW} min={1} max={500} paso={1} onChange={setPlaca}
                    formato={(v) => `${n0.format(v)} MW`}
                    anclas={[{ v: 100, et: "100 MW · referencia PNUD" }]}
                    citas={["undp_empleo_dc_100mw"]}
                    fuente="Placa del equipo. La referencia del PNUD para empleo y consumo es 100 MW."
                  />

                  <div className="flex flex-col gap-2">
                    <Perilla
                      etiqueta="Utilización del equipo" acento="amarillo"
                      valor={utilPct} min={0} max={100} paso={1} onChange={setUtil}
                      formato={(v) => `${n0.format(v)} %`}
                      anclas={PRESET_UTIL.map((p) => ({ v: p.v, et: `${p.et} ${p.v} %` }))}
                      citas={["lbnl_utilizacion_servidores"]}
                      fuente="LBNL 2024, pág. 27 · EE. UU. Es la perilla que más mueve el resultado: 1,90× contra 1,39× del PUE."
                    />
                    <div className="flex flex-wrap gap-2">
                      {PRESET_UTIL.map((p) => (
                        <button key={p.et} type="button" onClick={() => setUtil(p.v)}
                          aria-pressed={utilPct === p.v}
                          className="min-h-[36px] cursor-pointer border px-2.5 py-1.5 font-mono text-nota transition-colors duration-200 focus-visible:outline-2"
                          style={{
                            borderColor: utilPct === p.v ? "var(--ink)" : "var(--linea)",
                            color: utilPct === p.v ? "var(--ink)" : "var(--ink-2)",
                          }}>
                          {p.et} · {p.rango}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 border-t border-linea pt-7">
                  <Rubro>02 · Cómo se comporta el edificio</Rubro>
                  <Perilla
                    etiqueta="PUE del edificio" acento="amarillo"
                    valor={pue} min={1.05} max={1.9} paso={0.01} onChange={setPue}
                    formato={(v) => n2.format(v)}
                    anclas={[{ v: 1.15, et: "1,15 piso 2028" }, { v: 1.4, et: "1,40 parque 2023" }, { v: 1.6, et: "1,60 parque 2014" }]}
                    citas={["lbnl_pue_eeuu"]}
                    fuente="LBNL 2024, pág. 47 · EE. UU. Proyecta entre 1,15 y 1,35 para 2028."
                  />

                  <Perilla
                    etiqueta="WUE · agua por kWh de equipo" acento="amarillo"
                    valor={wue} min={0.05} max={2} paso={0.01} onChange={setWue}
                    formato={(v) => `${n2.format(v)} L/kWh`}
                    anclas={WUE_ANCLA.map((w) => ({ v: w.v, et: w.et }))}
                    citas={["lbnl_wue_definicion", "lbnl_wue_eeuu", "iea_wue_regional"]}
                    fuente="El WUE se define sobre el kWh del EQUIPO, no del medidor (LBNL pág. 39). Dividir por el medidor sobreestima el agua en un factor igual al PUE."
                  />
                </div>

                <div className="flex flex-col gap-6 border-t border-linea pt-7">
                  <Rubro>03 · Dónde y con qué respaldo opera</Rubro>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <Bandera activa={sitio === "medellin"} />
                      <span className="font-mono text-nota text-ink-3">{s.pais}</span>
                    </div>
                    <Segmentado<SitioId>
                      etiqueta="Sitio · clima y mezcla de generación" acento="amarillo"
                      valor={sitio} onChange={setSitio}
                      citas={["xm_factor_emision_2025", "egrid_virginia_2023", "clima_virginia_4a"]}
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
                    fuente="Niveles del Uptime Institute. Módulo de UPS supuesto: 1.500 kW. Sin ficha propia todavía — supuesto del cuaderno del curso."
                  />
                </div>

                <div className="flex flex-col gap-6 border-t border-linea pt-7">
                  <Rubro>04 · Qué declara contar</Rubro>
                  <Segmentado<FronteraId>
                    etiqueta="Frontera declarada del sistema" acento="amarillo" columnas={3} columnasMovil={1}
                    valor={frontera} onChange={setFrontera}
                    opciones={(Object.keys(FRONTERA) as FronteraId[]).map((k) => ({
                      id: k, et: FRONTERA[k].et, desc: FRONTERA[k].desc,
                    }))}
                    fuente="Mover esta perilla no agranda el número: abre un hueco. Declararlo es el método."
                  />
                  {b.hueco && <Nota>{b.hueco}</Nota>}
                </div>
              </div>

              {/* salidas */}
              <div className="flex min-w-0 flex-col gap-6 border border-linea bg-paper-2 p-5 sm:p-6 lg:sticky lg:top-16 lg:self-start">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 min-[420px]:grid-cols-2">
                  <Cifra valor={n1.format(b.anualGWh)} unidad="GWh al año en el medidor" acento="amarillo" />
                  <Cifra valor={n1.format(b.calorMW)} unidad="MW de calor a sacar de la sala" acento="amarillo" />
                  <Cifra valor={n0.format(b.hogares)} unidad="hogares de subsistencia" citas={["upme_consumo_subsistencia"]} />
                  <Cifra valor={`${n2.format(b.pctDemandaPais)} %`} unidad="de la demanda eléctrica del país" citas={["xm_demanda_sin_2025"]} />
                  <Cifra valor={n0.format(b.tCO2e)} unidad={`tCO₂e al año en ${s.et}`} citas={[s.feId]} />
                  <Cifra valor={`${n1.format(b.pctMargenFirme)} %`} unidad="del margen de energía firme del SIN" derivado citas={["margen_energia_firme_2025", "xm_enficc_2025"]} />
                  <Cifra valor={n0.format(b.aguaM3)} unidad="m³ de agua directa al año" acento="amarillo" citas={["lbnl_wue_definicion"]} />
                  <Cifra valor={n0.format(b.aguaHogares)} unidad={`hogares al consumo básico CRA · ${AGUA_VARA.et}`} citas={["cra_consumo_basico_agua"]} />
                </div>

                <p className="border-t border-linea pt-5 text-menor leading-relaxed text-ink-2">
                  <strong className="font-semibold text-ink">{n0.format(placaMW)} MW</strong> de placa a PUE{" "}
                  <strong className="font-semibold text-ink">{n2.format(pue)}</strong> con{" "}
                  <strong className="font-semibold text-ink">{n0.format(utilPct)} %</strong> de utilización piden{" "}
                  <strong className="font-semibold text-ink">{n1.format(b.anualGWh)} GWh al año</strong>. Es lo que el
                  sistema eléctrico colombiano entero entrega en{" "}
                  <strong className="font-semibold text-ink">{n1.format(t.valor)} {t.unidad}</strong>, y lo que necesitarían{" "}
                  <strong className="font-semibold text-ink">{n0.format(b.hogares)} hogares</strong> para vivir un año.
                  Son <strong className="font-semibold text-ink">{n0.format(b.racks)} racks</strong> de IA de 120 kW.
                  De agua directa se lleva{" "}
                  <strong className="font-semibold text-ink">{n0.format(b.aguaM3)} m³ al año</strong>, lo que
                  consumirían <strong className="font-semibold text-ink">{n0.format(b.aguaHogares)} hogares</strong>{" "}
                  al mínimo que la CRA define como suficiente.
                </p>

                <Nota>{AGUA_INDIRECTA_EEUU.hueco}</Nota>

                {/* redundancia */}
                <div className="border-t border-linea pt-5">
                  <Rubro>Lo que hay que comprar</Rubro>
                  <p className="text-menor leading-relaxed text-ink-2">
                    Para sostener {n1.format(b.medidorMW)} MW hacen falta{" "}
                    <strong className="text-ink">{b.modulosNecesarios} módulos</strong>, pero en{" "}
                    {REDUNDANCIA[redundancia].et} hay que instalar{" "}
                    <strong className="text-ink">{b.modulosInstalados}</strong> —{" "}
                    <strong className="text-ink">{n1.format(b.upsCompradaMW)} MW de UPS</strong>, cada uno al{" "}
                    <strong className="text-ink">{n0.format(b.factorCargaUPS)} %</strong> de carga.
                  </p>
                </div>

                {/* reparto */}
                <div className="border-t border-linea pt-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <Rubro sinMargen>
                      De cada 100 vatios que entran
                      <Cita ids={["lbnl_gpu_reposo"]} />
                    </Rubro>
                    <Segmentado<CalibId>
                      etiqueta="" acento="ink" valor={calibracion} onChange={setCalib}
                      opciones={(Object.keys(CALIBRACION) as CalibId[]).map((k) => ({ id: k, et: CALIBRACION[k].et }))}
                    />
                  </div>
                  <div className="flex h-7 w-full overflow-hidden border border-linea" role="img"
                    aria-label={`Trabajo útil ${n1.format(b.reparto.trabajo)} %, encendido sin trabajar ${n1.format(b.reparto.ocio)} %, infraestructura ${n1.format(b.reparto.infraestructura)} %`}>
                    <div style={{ width: `${b.reparto.trabajo}%`, background: "var(--amarillo)" }} />
                    <div style={{ width: `${b.reparto.ocio}%`, background: "var(--rojo)" }} />
                    <div style={{ width: `${b.reparto.infraestructura}%`, background: "var(--ink-3)" }} />
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-nota text-ink-2">
                    <li><Cuadro c="var(--amarillo)" /> trabajo útil {n1.format(b.reparto.trabajo)} %</li>
                    <li><Cuadro c="var(--rojo)" /> encendido sin trabajar {n1.format(b.reparto.ocio)} %</li>
                    <li><Cuadro c="var(--ink-3)" /> refrigeración y distribución {n1.format(b.reparto.infraestructura)} %</li>
                  </ul>
                  <p className="mt-2 max-w-[62ch] font-mono text-nota leading-snug text-ink-3">{CALIBRACION[calibracion].nota}</p>
                </div>
              </div>
            </div>

            {/* comparador de sitio */}
            <div className="mt-10 border-t border-ink pt-6">
              <Rubro>El mismo edificio, en dos redes eléctricas</Rubro>
              <div className="grid gap-px border border-linea bg-linea sm:grid-cols-2">
                {comparador.map((c) => (
                  <div key={c.id} className="flex flex-col gap-3 bg-paper p-5">
                    <div className="flex items-center gap-3">
                      <Bandera activa={c.id === "medellin"} />
                      <h3 className="text-mayor font-semibold">{c.sitio.et}</h3>
                      <span className="font-mono text-nota text-ink-3">{c.sitio.pais}</span>
                    </div>
                    <p className="tabular text-seccion font-semibold leading-none">{n0.format(c.salida.tCO2e)}</p>
                    <p className="text-nota text-ink-3">
                      tCO₂e al año, con {n1.format(c.sitio.factorEmision)} gCO₂e/kWh
                      <Cita ids={[c.sitio.feId]} />
                    </p>
                    <p className="max-w-[52ch] text-nota leading-snug text-ink-2">{c.sitio.clima}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 max-w-[68ch] text-menor leading-relaxed text-ink-2">
                Mismo hardware, misma carga, misma agua: lo único que cambia es de qué está hecha la
                electricidad. La red de {limpio.sitio.et} emite{" "}
                <strong className="text-ink">
                  {n1.format(sucio.sitio.factorEmision / limpio.sitio.factorEmision)}× menos
                </strong>{" "}
                por kWh, así que el mismo edificio deja de emitir{" "}
                <strong className="text-ink">{n0.format(sucio.salida.tCO2e - limpio.salida.tCO2e)} tCO₂e al año</strong>{" "}
                solo por dónde se enchufa. El factor colombiano varía entre{" "}
                {n1.format(SITIO.medellin.feRango![0])} y {n1.format(SITIO.medellin.feRango![1])} gCO₂e/kWh según el día,
                porque depende de cuánto llueva.
              </p>
            </div>
          </section>

          {/* ══════════ MITAD A ══════════ */}
          <section id="mundo" className="mb-20 scroll-mt-16">
            <Rotulo tono="azul" mitad="Mitad A" titulo="La prospectiva mundial"
              bajada="Nada de esto es pronóstico nuestro. Son las anclas que la AIE publica, recorridas entre punto y punto." />

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <div className="flex min-w-0 flex-col gap-9">
                <div className="flex flex-col gap-6">
                  <Rubro>01 · La trayectoria a 2035</Rubro>
                  <Segmentado<EscenarioId>
                    etiqueta="Escenario de la AIE a 2035" acento="azul" columnas={2}
                    valor={escenario} onChange={(v) => { setEsc(v); setUsarTasa(false); }}
                    citas={["iea_escenarios_2035"]}
                    opciones={(Object.keys(ESCENARIO) as EscenarioId[]).map((k) => ({
                      id: k, et: `${ESCENARIO[k].et} · ${ESCENARIO[k].twh2035}`, desc: ESCENARIO[k].desc,
                    }))}
                    fuente="IEA, Energy and AI. El rango publicado va de 700 a 1.700 TWh."
                  />

                  <div className="flex flex-col gap-2 border border-linea p-4">
                    <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
                      <input type="checkbox" checked={usarTasaPropia}
                        onChange={(e) => setUsarTasa(e.target.checked)}
                        className="h-4 w-4 cursor-pointer accent-[var(--azul)]" />
                      <span className="text-menor font-medium">Usar trayectoria propia en vez del escenario</span>
                    </label>
                    <Perilla
                      etiqueta="Tasa de crecimiento anual" acento="azul"
                      valor={tasaPct} min={0} max={25} paso={0.5} onChange={(v) => { setTasa(v); setUsarTasa(true); }}
                      formato={(v) => `${n1.format(v)} %`}
                      anclas={[{ v: CRECIMIENTO_HISTORICO, et: "12 % histórico AIE" }]}
                      citas={["iea_crecimiento_historico_12pct"]}
                      fuente="Compuesta desde los 415 TWh de 2024. El 12 % histórico llega a 1.447 TWh en 2035."
                    />
                    <p className="font-mono text-nota leading-snug" style={{ color: a.dentroDeBanda ? "var(--ink-3)" : "var(--rojo)" }}>
                      {a.dentroDeBanda
                        ? `Dentro de la banda publicada (${a.banda[0]}–${a.banda[1]} TWh)`
                        : `FUERA de la banda publicada (${a.banda[0]}–${a.banda[1]} TWh). Hay que justificarlo.`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-6 border-t border-linea pt-7">
                  <Rubro>02 · Cuánto pesa la IA en ese total</Rubro>
                  <div className="flex flex-col gap-2 border border-linea p-4">
                    <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
                      <input type="checkbox" checked={pueParqueOn}
                        onChange={(e) => setPueParqueOn(e.target.checked)}
                        className="h-4 w-4 cursor-pointer accent-[var(--azul)]" />
                      <span className="text-menor font-medium">Reescalar por PUE del parque mundial</span>
                    </label>
                    <Perilla
                      etiqueta="PUE del parque" acento="azul"
                      valor={pueParque} min={1.05} max={1.6} paso={0.01}
                      onChange={(v) => { setPueParque(v); setPueParqueOn(true); }}
                      formato={(v) => n2.format(v)}
                      anclas={[{ v: 1.29, et: "1,29 en 2030" }, { v: 1.41, et: "1,41 en 2024" }, { v: 1.53, et: "1,53 en 2020" }]}
                      citas={["pue_implicito_parque_mundial", "iea_it_electricity_by_region"]}
                      fuente="DERIVADO por nosotros: panel total ÷ panel IT de la Table 2 del PNUD."
                    />
                  </div>

                  <Perilla
                    etiqueta="Participación de la IA en el total" acento="azul"
                    valor={participacionIAPct} min={0} max={100} paso={1} onChange={setIA}
                    formato={(v) => `${n0.format(v)} %`}
                    anclas={[{ v: 50, et: "≈ mitad del aumento neto a 2030" }]}
                    citas={["iea_escenarios_2035"]}
                    fuente="La AIE publica que los servidores acelerados explican casi la mitad del AUMENTO NETO a 2030 — no del total. Esta perilla es un supuesto nuestro."
                  />

                  <Segmentado<ConsultaId>
                    etiqueta="Frontera por consulta" acento="azul" columnas={2}
                    valor={consulta} onChange={setConsulta}
                    citas={["google_energia_por_consulta"]}
                    opciones={(Object.keys(CONSULTA) as ConsultaId[]).map((k) => ({
                      id: k, et: `${CONSULTA[k].et} · ${n2.format(CONSULTA[k].wh)} Wh`, desc: CONSULTA[k].desc,
                    }))}
                    fuente="Google, arXiv:2508.15734. El factor de 2,4 entre las dos es textual del paper."
                  />
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-6 border border-linea bg-paper-2 p-5 sm:p-6 lg:sticky lg:top-16 lg:self-start">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 min-[420px]:grid-cols-2">
                  <Cifra valor={n0.format(a.v2035)} unidad="TWh mundiales en 2035" acento="azul" citas={["iea_escenarios_2035"]} />
                  <Cifra valor={n1.format(a.colombias2035)} unidad="Colombias-año" acento="azul" derivado citas={["xm_demanda_sin_2025"]} />
                  <Cifra valor={n0.format(a.ia2035)} unidad="TWh atribuibles a IA" derivado />
                  <Cifra valor={`${n1.format(a.consultasIA / 1e12)} B`} unidad="billones de consultas equivalentes" derivado citas={["google_energia_por_consulta"]} />
                </div>

                {/* serie */}
                <div className="border-t border-linea pt-5">
                  <Rubro>
                    Trayectoria 2020 – 2035
                    <Cita ids={["iea_dc_tabla_regional", "iea_escenarios_2035"]} />
                  </Rubro>
                  <Serie serie={a.serie} banda={a.banda} />
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-nota text-ink-3">
                    <li>■ ancla publicada</li>
                    <li>— sólido: observado / interpolado hasta 2030</li>
                    <li>┄ punteado: proyectado 2030–2035</li>
                    <li>▨ banda de la AIE a 2035</li>
                  </ul>
                </div>

                <p className="max-w-[68ch] border-t border-linea pt-5 text-menor leading-relaxed text-ink-2">
                  Toda línea posterior a 2030 está interpolada entre el punto de 2030 de la AIE y el caso de 2035
                  que elijas. <strong className="font-semibold text-ink">No es una serie observada ni un pronóstico propio</strong>:
                  es el rango que la AIE publica, recorrido.
                </p>
              </div>
            </div>
          </section>

          {/* ══════════ EL PUENTE ══════════ */}
          <section id="puente" className="scroll-mt-16">
            <Rotulo tono="ink" mitad="El puente" titulo="Las dos mitades, en la misma vara"
              bajada="Un edificio, un país y un planeta no caben en la misma gráfica: se llevan cuatro órdenes de magnitud. Lo que sí se puede es contar uno dentro del otro." />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-start">
              <div className="flex min-w-0 flex-col gap-5">
                <Segmentado<VaraId>
                  etiqueta="Traducir el edificio a" columnas={2}
                  valor={vara} onChange={setVara}
                  citas={VARA[vara].id ? [VARA[vara].id as string] : undefined}
                  opciones={(Object.keys(VARA) as VaraId[]).map((k) => ({ id: k, et: VARA[k].et }))}
                  fuente="Cada vara responde una pregunta distinta. Declarar cuál se usó es parte del método."
                />
                <p className="max-w-[46ch] text-menor leading-relaxed text-ink-2">
                  Los dos extremos de la escalera son perillas. Movés la utilización en la mitad B y
                  el edificio se encoge, así que caben más. Movés el escenario de la AIE en la mitad A y
                  el techo se mueve, así que caben menos. La escalera es la misma; lo que cambia es
                  quién la está midiendo.
                </p>
              </div>

              <Escalera
                edificio={{ gwh: b.anualGWh, vara: varaValor[vara], mw: placaMW, sitio: s.et }}
                pais={{ gwh: FUENTE.demandaSIN_TWh.v * 1000, edificios: puente.colombias > 0 ? 1 / puente.colombias : 0 }}
                mundo={{ twh: a.v2035, edificios: puente.edificios, colombias: a.colombias2035, escenario: usarTasaPropia ? `${n1.format(tasaPct)} % anual` : ESCENARIO[escenario].et }}
              />
            </div>
          </section>

          {/* ══════════ CIERRE ══════════ */}
          <section id="cierre" className="mt-16 border-t-2 border-ink pt-10">
            <span className="inline-block px-2 py-[3px] font-mono text-nota uppercase tracking-[.15em]"
              style={{ background: "var(--ink)", color: "var(--paper)" }}>
              Cierre
            </span>
            <p className="mt-4 max-w-[30ch] text-portada font-semibold leading-[1.05] tracking-tight">
              El mundo va a competir por energía firme antes que por cómputo.
            </p>
            <p className="mt-2 max-w-[30ch] text-portada font-semibold leading-[1.05] tracking-tight">
              Colombia tiene la ventaja — todavía no tiene el instrumento para usarla.
            </p>
            <div className="mt-6 max-w-[62ch] font-mono text-menor leading-relaxed text-ink-2">
              <p>
                Hoy hay <strong className="text-ink">25 centros de datos en operación y 9 en desarrollo</strong>
                <Cita ids={["acoldc_colombia_dc_2026"]} />, y ningún conteo oficial de cuántos megavatios ya
                están instalados: el único registro público, el de la UPME, es de inscripción voluntaria y
                mide proyectos de generación, no lo que consume un centro de datos
                <Cita ids={["upme_registro_proyectos"]} />.
              </p>
              <p className="mt-3">
                La ventaja existe de todas formas: la red colombiana emite 2,8 veces menos que la de
                Virginia por kWh<Cita ids={["xm_factor_emision_2025", "egrid_virginia_2023"]} />. Y ya
                pesa: un solo centro de 100 MW, en condiciones típicas de operación, se lleva el 9,3 % del
                margen de energía firme del país<Cita ids={["margen_energia_firme_2025", "xm_enficc_2025"]} />;
                tres centros de ese tamaño se acercan al 28 %, y nadie está sumando esa cuenta.
              </p>
              <p className="mt-3">
                La pregunta que deja este tablero no es si Colombia debería alojar esta carga. Es bajo qué
                condiciones le conviene al país recibirla, y quién debería poder ponerlas.
              </p>
            </div>
          </section>

        </main>

        <footer className="border-t border-linea py-8 font-mono text-nota leading-relaxed text-ink-3">
          <p className="max-w-[80ch]">
            Vara de medir: {n2.format(FUENTE.demandaSIN_TWh.v)} TWh de demanda del SIN en 2025 y{" "}
            {n0.format(FUENTE.capacidadSIN_MW.v)} MW de capacidad instalada, ambos de XM, sumados día por día
            por nosotros. Las cifras marcadas «derivado» son aritmética propia sobre fuentes verificadas.
          </p>
          <p className="mt-3">{CURSO} · {INTEGRANTES.join(" · ")}</p>
        </footer>
      </div>
    </ProveedorFuentes>
  );
}

/* ─────────────── piezas de la página ─────────────── */

function Rotulo({ tono, mitad, titulo, bajada }: {
  tono: "amarillo" | "azul" | "ink";
  mitad: string; titulo: string; bajada: string;
}) {
  const relleno = tono === "amarillo" ? "var(--amarillo)" : tono === "azul" ? "var(--azul)" : "var(--ink)";
  const sobre = tono === "amarillo" ? "#0a0a0a" : "var(--paper)";
  return (
    <div className="mb-8 border-b border-linea pb-4">
      <span className="inline-block px-2 py-[3px] font-mono text-nota uppercase tracking-[.15em]"
        style={{ background: relleno, color: sobre }}>
        {mitad}
      </span>
      <h2 className="mt-3 text-seccion font-semibold tracking-tight">{titulo}</h2>
      <p className="mt-2 max-w-[68ch] text-menor leading-relaxed text-ink-2">{bajada}</p>
    </div>
  );
}

function Rubro({ children, sinMargen }: { children: React.ReactNode; sinMargen?: boolean }) {
  return (
    <p className={`font-mono text-nota uppercase tracking-[.13em] text-ink-3 ${sinMargen ? "" : "mb-3"}`}>
      {children}
    </p>
  );
}

/* La escalera: un edificio dentro de un país dentro de un planeta.
   Cuatro órdenes de magnitud no caben en una barra, así que se cuentan
   en vez de dibujarse. Cada peldaño dice cuántos del anterior caben. */
function Escalera({ edificio, pais, mundo }: {
  edificio: { gwh: number; vara: string; mw: number; sitio: string };
  pais: { gwh: number; edificios: number };
  mundo: { twh: number; edificios: number; colombias: number; escenario: string };
}) {
  return (
    <ol className="relative flex flex-col gap-8 border border-linea bg-paper-2 p-5 sm:p-7">
      <div aria-hidden className="absolute bottom-9 left-[calc(1.25rem+5px)] top-9 w-px bg-linea sm:left-[calc(1.75rem+5px)]" />

      <Peldano
        marca="var(--amarillo)"
        rotulo="Tu edificio"
        cifra={`${n1.format(edificio.gwh)} GWh`}
        unidad="al año en el medidor"
        pie={`${n0.format(edificio.mw)} MW de placa en ${edificio.sitio} · ${edificio.vara}`}
      />
      <Peldano
        marca="var(--ink)"
        rotulo="Colombia entera"
        cifra={`${n0.format(pais.gwh)} GWh`}
        unidad="de demanda del SIN en 2025"
        pie={`Caben ${n0.format(pais.edificios)} edificios como el tuyo, funcionando todo el año`}
        cita="xm_demanda_sin_2025"
      />
      <Peldano
        marca="var(--azul)"
        rotulo="El mundo en 2035"
        cifra={`${n0.format(mundo.twh)} TWh`}
        unidad={`en los centros de datos del planeta · escenario ${mundo.escenario}`}
        pie={`Caben ${n0.format(mundo.edificios)} edificios como el tuyo, o ${n1.format(mundo.colombias)} Colombias enteras`}
        cita="iea_escenarios_2035"
      />
    </ol>
  );
}

function Peldano({ marca, rotulo, cifra, unidad, pie, cita }: {
  marca: string; rotulo: string; cifra: string; unidad: string; pie: string; cita?: string;
}) {
  return (
    <li className="relative flex gap-4">
      <span aria-hidden className="mt-[7px] h-[11px] w-[11px] shrink-0" style={{ background: marca }} />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-mono text-nota uppercase tracking-[.13em] text-ink-3">
          {rotulo}
          {cita && <Cita ids={[cita]} />}
        </span>
        <span className="tabular text-seccion font-semibold leading-none">{cifra}</span>
        <span className="text-nota text-ink-3">{unidad}</span>
        <span className="mt-1 max-w-[52ch] text-menor leading-snug text-ink-2">{pie}</span>
      </div>
    </li>
  );
}

function Cuadro({ c }: { c: string }) {
  return <span aria-hidden className="mr-1 inline-block h-[8px] w-[8px] align-[1px]" style={{ background: c }} />;
}

/* Anclas: años con dato publicado de la AIE, marcados con cuadrado (hueco en 2035). */
const ANIOS_ANCLA = [2020, 2023, 2024, 2030, 2035];

function MarcadorAncla(props: { cx?: number; cy?: number; payload?: { anio: number } }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload || !ANIOS_ANCLA.includes(payload.anio)) return undefined;
  const hueco = payload.anio === 2035;
  return (
    <rect key={`m${payload.anio}`} x={cx - 3} y={cy - 3} width={6} height={6}
      fill={hueco ? "var(--paper)" : "var(--azul)"} stroke="var(--azul)" strokeWidth={1.5} />
  );
}

/* Serie con Recharts: área observada/interpolada sólida hasta 2030, proyección punteada
   de 2030 a 2035, y la banda de escenarios de la AIE marcada como franja en 2035. */
function Serie({ serie, banda }: { serie: { anio: number; twh: number; tipo: string }[]; banda: [number, number] }) {
  const maxY = Math.max(banda[1], ...serie.map((s) => s.twh)) * 1.05;
  const datos = serie.map((s) => ({
    anio: s.anio,
    historico: s.anio <= 2030 ? s.twh : null,
    proyectado: s.anio >= 2030 ? s.twh : null,
  }));

  return (
    <div className="overflow-x-auto" role="img"
      aria-label={`Consumo mundial de centros de datos de 2020 a 2035, terminando en ${Math.round(serie[serie.length - 1].twh)} TWh`}>
      <div className="h-[190px] w-full min-w-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={datos} margin={{ top: 10, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--linea)" />
            <XAxis dataKey="anio" type="number" domain={[2020, 2035]} ticks={ANIOS_ANCLA}
              tickFormatter={(v) => String(v)} tick={{ fontSize: 9, fill: "var(--ink-3)", fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "var(--linea)" }} tickLine={false} />
            <YAxis domain={[0, maxY]} ticks={[0, maxY / 2, maxY]} tickFormatter={(v) => String(Math.round(v))}
              tick={{ fontSize: 9, fill: "var(--ink-3)", fontFamily: "var(--font-mono)" }} width={34}
              axisLine={false} tickLine={false} />
            <ReferenceArea x1={2034.6} x2={2035} y1={banda[0]} y2={banda[1]} fill="var(--azul)" fillOpacity={0.18} stroke="none" />
            <Line dataKey="historico" stroke="var(--azul)" strokeWidth={2} dot={MarcadorAncla} isAnimationActive={false} connectNulls={false} />
            <Line dataKey="proyectado" stroke="var(--azul)" strokeWidth={2} strokeDasharray="4 3" dot={MarcadorAncla} isAnimationActive={false} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
