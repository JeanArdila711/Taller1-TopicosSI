/* Chequeo del modelo. Falla si alguna perilla deja de reproducir la fuente.
   Correr con: pnpm check */
import { modelarEdificio, modelarProspectiva, traducir } from "./modelo";
import { ESCENARIO } from "./datos";

let fallos = 0;
function ok(nombre: string, real: number, esperado: number, tol = 0.005) {
  const dif = Math.abs(real - esperado) / (esperado || 1);
  const bien = dif <= tol;
  if (!bien) fallos++;
  console.log(
    `${bien ? "  ok  " : "FALLA "} ${nombre.padEnd(46)} ${real.toFixed(3).padStart(12)}  esperado ${esperado}`,
  );
}

console.log("\n— El caso base del cuaderno del curso: 20 MW · PUE 1,40 · 40 % —");
const a = modelarEdificio({
  placaMW: 20, pue: 1.4, utilPct: 40, sitio: "medellin",
  redundancia: "N", frontera: "edificio", calibracion: "medido", wue: 0.5,
});
ok("consumo anual (GWh)", a.anualGWh, 99.1);
ok("hogares de subsistencia", a.hogares, 63521);
ok("% de la demanda del país", a.pctDemandaPais, 0.118);
ok("calor a remover (MW)", a.calorMW, 8.08);
ok("horas de Colombia entera", a.diasPais * 24, 10.3, 0.01);

console.log("\n— La captura del profe: 116 MW · PUE 1,30 · 22 % —");
const b = modelarEdificio({
  placaMW: 116, pue: 1.3, utilPct: 22, sitio: "medellin",
  redundancia: "N", frontera: "edificio", calibracion: "medido", wue: 0.5,
});
ok("consumo anual (GWh)", b.anualGWh, 401, 0.002);
ok("hogares de subsistencia", b.hogares, 256750, 0.002);
ok("% de la demanda del país", b.pctDemandaPais, 0.48, 0.01);
ok("calor a remover (MW)", b.calorMW, 35, 0.01);
ok("días de Colombia entera", b.diasPais, 1.7, 0.03);

console.log("\n— Emisiones: la trampa de gramos a toneladas —");
const c = modelarEdificio({
  placaMW: 100 / (1 / 1.2) / 1.2, pue: 1.2, utilPct: 100, sitio: "medellin",
  redundancia: "N", frontera: "edificio", calibracion: "medido", wue: 0.5,
});
const ref = modelarEdificio({
  placaMW: 135.14, pue: 1.2, utilPct: 100, sitio: "medellin",
  redundancia: "N", frontera: "edificio", calibracion: "medido", wue: 0.5,
});
ok("100 MW de TI → 1.051 GWh/año", ref.anualGWh, 1051, 0.01);
ok("→ tCO2e/año en Medellín", ref.tCO2e, 101211, 0.01);
const refVA = modelarEdificio({ ...{
  placaMW: 135.14, pue: 1.2, utilPct: 100, redundancia: "N",
  frontera: "edificio", calibracion: "medido", wue: 0.5 }, sitio: "virginia" });
ok("→ tCO2e/año en Virginia", refVA.tCO2e, 284296, 0.01);
ok("→ % del margen de energía firme", ref.pctMargenFirme, 19.7, 0.02);

console.log("\n— Agua —");
// WUE se define sobre el kWh de TI, no del medidor. 8,08 MW de TI × 8.760 h × 0,5 L/kWh
ok("agua directa del caso base (m³/año)", a.aguaM3, 35390, 0.001);
ok("→ hogares al consumo básico CRA", a.aguaHogares, 226.9, 0.01);
const aguaAP = modelarEdificio({
  placaMW: 20, pue: 1.4, utilPct: 40, sitio: "medellin",
  redundancia: "N", frontera: "edificio", calibracion: "medido", wue: 1.65,
});
ok("con el WUE de Asia-Pacífico (1,65)", aguaAP.aguaM3, 35390 * 3.3, 0.001);
// el denominador correcto: si se usara el medidor daría PUE veces más
if (Math.abs(a.aguaM3 - a.anualGWh * 1e6 * 0.5 / 1000) < 1) {
  fallos++; console.log("FALLA  el WUE se está aplicando al medidor, no al equipo de TI");
} else console.log("  ok   el WUE se aplica al kWh de TI, no al del medidor");

console.log("\n— Redundancia —");
const r = modelarEdificio({
  placaMW: 40, pue: 1.0, utilPct: 100, sitio: "medellin",
  redundancia: "DOSN", frontera: "edificio", calibracion: "medido", wue: 0.5,
});
ok("2N duplica los módulos instalados", r.modulosInstalados, r.modulosNecesarios * 2, 0);
if (r.factorCargaUPS > 51) { fallos++; console.log("FALLA  2N debería dejar el UPS al 50 % o menos"); }
else console.log(`  ok   2N deja cada módulo al ${r.factorCargaUPS.toFixed(1)} %`);

console.log("\n— Reparto de cada 100 vatios (PUE 1,30 · 22 %) —");
const suma = b.reparto.trabajo + b.reparto.ocio + b.reparto.infraestructura;
ok("las tres partes suman 100", suma, 100, 0.0001);
ok("ocio con calibración medida", b.reparto.ocio, 45.7, 0.01);

console.log("\n— Prospectiva mundial —");
const p = modelarProspectiva({
  escenario: "base", usarTasaPropia: false, tasaPct: 12,
  pueParque: null, participacionIAPct: 50, consulta: "amplia",
});
ok("ancla 2024", p.serie.find((x) => x.anio === 2024)!.twh, 416, 0.0001);
ok("ancla 2030", p.serie.find((x) => x.anio === 2030)!.twh, 946, 0.0001);
ok("caso Base a 2035", p.v2035, ESCENARIO.base.twh2035, 0.0001);
ok("Colombias-año en 2035", p.colombias2035, 1200 / 84.049, 0.001);

const tasa = modelarProspectiva({
  escenario: "base", usarTasaPropia: true, tasaPct: 12,
  pueParque: null, participacionIAPct: 50, consulta: "amplia",
});
ok("12 % anual desde 2024 llega a", tasa.v2035, 1447, 0.01);
if (!tasa.dentroDeBanda) { fallos++; console.log("FALLA  la tasa histórica debería caer dentro de la banda de la AIE"); }
else console.log("  ok   la tasa histórica cae dentro de la banda publicada (700–1.700)");

console.log("\n— El puente —");
const t = traducir(b.anualGWh, p.v2035);
ok("el mundo 2035 son X edificios como este", t.edificios, (1200 * 1000) / b.anualGWh, 0.0001);

console.log(
  fallos === 0
    ? "\n✓ el modelo reproduce todas las fuentes\n"
    : `\n✗ ${fallos} chequeo(s) fallando\n`,
);
process.exit(fallos === 0 ? 0 : 1);
