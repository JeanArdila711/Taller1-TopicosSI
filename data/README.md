# data/

## `corpus-profe.json`

211 registros de fuente extraídos de `https://topicos-si.vercel.app/corpus.js`
(archivo estático público del cuaderno del curso), descargado el 2026-08-25.

**Procedencia: es el corpus del profesor, no el nuestro.** Está aquí como punto
de partida y como referencia de esquema, no como dato verificado por este grupo.

Esquema por registro:

```
id  tema  valor  unidad  cobertura  periodo
fuente  documento  url  fechaConsulta  nivel  nota
```

`nivel: "A"` = organismo oficial o publicación técnica revisada.
`nivel: "B"` = industria o consultora; se lee con su sesgo declarado.

Reparto por tema relevante: `energia` 52 · `colombia` 13 · `computo` 13.
Global: 158 nivel A, 53 nivel B.

## Regla de trabajo

Ninguna cifra pasa a `data/verificado.json` sin que alguien del grupo haya
abierto el documento y encontrado el número adentro. Cada registro verificado
agrega:

```
verificadoPor   quién abrió el documento
verificadoEl    fecha
paginaOEtiqueta dónde exactamente aparece (página, tabla, sección)
```

Si el número no está donde la ficha dice, eso es un hallazgo y se anota: el
método del taller premia declarar el hueco.
