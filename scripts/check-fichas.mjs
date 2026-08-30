/* Toda constante del modelo tiene ficha, o está declarada como pendiente.
   Ninguna de las dos cosas se cae en silencio: este check falla si alguien
   agrega una cifra sin ficha, o si deja un pendiente que ya se resolvió. */

import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const raiz = new URL("..", import.meta.url);
const leer = (p) => readFileSync(new URL(p, raiz), "utf8");

const fichas = new Set(JSON.parse(leer("data/verificado.json")).map((f) => f.id));
const usados = new Set(
  [...leer("lib/datos.ts").matchAll(/(?:^|\s)(?:id|feId|climaId)\s*:\s*"([a-z0-9_]+)"/gm)].map((m) => m[1]),
);
const pendientes = new Set(
  [...leer("lib/fuentes.ts").matchAll(/\{\s*id:\s*"([a-z0-9_]+)",\s*queMide:/g)].map((m) => m[1]),
);

const huerfanos = [...usados].filter((id) => !fichas.has(id) && !pendientes.has(id));
assert.deepEqual(huerfanos, [], `constantes sin ficha y sin declarar como pendientes: ${huerfanos}`);

const resueltos = [...pendientes].filter((id) => fichas.has(id));
assert.deepEqual(resueltos, [], `ya tienen ficha, sacalos de SIN_FICHA: ${resueltos}`);

const inventados = [...pendientes].filter((id) => !usados.has(id));
assert.deepEqual(inventados, [], `pendientes que el modelo ya no usa: ${inventados}`);

// Las citas de la pantalla apuntan a fichas que existen.
const citados = new Set(
  [...leer("app/page.tsx").matchAll(/citas=\{\[([^\]]*)\]\}/g)]
    .flatMap((m) => [...m[1].matchAll(/"([a-z0-9_]+)"/g)].map((x) => x[1])),
);
const rotas = [...citados].filter((id) => !fichas.has(id));
assert.deepEqual(rotas, [], `citas a fichas inexistentes: ${rotas}`);

console.log(
  `fichas ok — ${fichas.size} verificadas, ${usados.size} constantes usadas, ` +
  `${pendientes.size} pendientes declaradas, ${citados.size} ids citados en pantalla`,
);
