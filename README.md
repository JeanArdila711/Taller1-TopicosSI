# Cuántas Colombias

Tablero interactivo sobre el consumo energético del cómputo en el mundo, con un
centro de datos configurable adentro. Taller 1 de Tópicos Especiales en Sistemas
de Información — EAFIT, 2026-2.

**Jean Carlo Ardila · Juan Pablo Posso · David Cossio**

---

## Qué hace

Dos mitades que se alimentan entre sí:

- **Prospectiva mundial** — la trayectoria del consumo de centros de datos de 2020
  a 2035, recorriendo los cuatro casos de sensibilidad que publica la AIE
  (de 700 a 1.700 TWh). No es un pronóstico nuestro: es el rango publicado,
  con los supuestos manipulables.
- **El edificio** — un configurador donde se decide qué se construye y sale el
  consumo, el calor a remover, las emisiones y la equivalencia en varas
  colombianas. Se puede montar en Medellín o en Virginia y ver la diferencia.

## Cómo se llega a 2035 sin inventar datos

Hay tres clases de número y las tres son legítimas si van etiquetadas:
**observado**, **proyectado por un tercero** y **derivado por nosotros**. Lo que
no existe aquí es la cuarta: un número sin procedencia.

Los detalles están en [`data/METODO-2035.md`](data/METODO-2035.md).

## De dónde salen los datos

Tres series las bajamos y las sumamos nosotros de la API pública de XM, sin llave:

| Cifra | Valor 2025 | Métrica |
|---|---|---|
| Demanda del SIN | 84,049 TWh | `DemaSIN` |
| Factor de emisión | 96,3 gCO₂e/kWh | `factorEmisionCO2e` |
| Energía firme (ENFICC) | 89,38 TWh | `ENFICC` |

365 de 365 días en las tres, sin rellenar faltantes. Se reproducen con:

```bash
node scripts/xm-demanda.mjs 2025
node scripts/xm-red.mjs 2025
```

El resto viene de la AIE, el PNUD y el Centro TIDE de Oxford, el Lawrence
Berkeley National Laboratory, Google, la EPA, la UPME y el DANE. Cada cifra
está en [`data/verificado.json`](data/verificado.json) con quién la verificó,
cuándo, y en qué página exacta del documento aparece.

`data/corpus-profe.json` es el corpus de referencia que el cuaderno del curso
publica en `topicos-si.vercel.app/corpus.js`. Está aquí como punto de partida,
**no como dato verificado por este grupo** — ver [`data/README.md`](data/README.md).

## Correr

```bash
pnpm install
pnpm dev      # desarrollo
pnpm build    # producción
pnpm check    # 24 aserciones del modelo contra las fuentes
```

`pnpm check` es lo que garantiza que el tablero no miente: recalcula el caso base
del cuaderno del curso, las emisiones, el margen de energía firme, el reparto de
la energía y los cuatro escenarios, y falla si alguno deja de reproducir su fuente.

## Estructura

```
lib/datos.ts        constantes verificadas, cada una con el id de su ficha
lib/modelo.ts       funciones puras: toda la aritmética
lib/modelo.check.ts las aserciones
components/         los controles
app/page.tsx        las 13 perillas
data/               fuentes, verificación y series propias
scripts/            descarga reproducible de XM
```

## El agua tiene su propia frontera

El WUE se define sobre el kWh del **equipo informático**, no sobre el del medidor
(LBNL, pág. 39). Aplicarlo al medidor sobreestima el agua en un factor igual al
PUE. El tablero usa el denominador correcto.

Y hay una segunda frontera, más grande: el agua **indirecta**, la que se consume
generando la electricidad. En Estados Unidos son 4,52 L/kWh contra 0,36 de agua
directa — **unas doce veces más**. No existe factor equivalente verificado para
la red colombiana, así que el tablero calcula la directa y declara que la
indirecta, probablemente mayor, no la puede contar.

## Frontera declarada

El tablero cuenta el edificio: equipo informático, refrigeración y distribución
eléctrica. **No** cuenta la red que trae la consulta, el aparato que la pide, ni
la fabricación del chip. Elegir esos alcances en el control de frontera no
inventa un número: abre un hueco declarado, porque no existe cifra de nivel A
para repartirlos.

Tampoco existe reparto publicado de la energía de la IA entre entrenar y servir,
ni conteo oficial de la capacidad instalada de centros de datos en Colombia en
megavatios. Los dos huecos están declarados en vez de rellenados.
