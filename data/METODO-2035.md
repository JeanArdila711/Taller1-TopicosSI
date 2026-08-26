# Cómo se llega a 2035 sin inventar datos

## El malentendido

«Datos reales y verificables» no significa «solo cifras observadas». Significa
**que todo número diga de dónde salió**. Hay tres clases y las tres son legítimas
si van etiquetadas:

| Clase | Qué es | Cómo se defiende |
|---|---|---|
| **Observado** | Alguien lo midió. La demanda del SIN en 2025 | Fuente, documento, fecha de consulta |
| **Proyectado por un tercero** | Un organismo lo modeló y lo publicó. Los 1.200 TWh de la AIE para 2035 | Se cita igual que un dato, declarando que es proyección y de qué caso |
| **Derivado por nosotros** | Aritmética sobre los dos anteriores | Se muestran las entradas y la fórmula, marcado como derivado |

Lo prohibido es la cuarta clase: **un número sin procedencia**. Eso es lo que
el taller castiga con «Fuente: internet».

El propio cuaderno del curso lo hace así y lo dice en su colofón: *«Los cálculos
que hacen los aparatos se muestran con sus entradas a la vista y están marcados
como derivados.»*

## No hay que modelar 2035: ya está publicado

La AIE proyecta a 2035 con **cuatro casos de sensibilidad**, y publica el rango
como rango. Es literalmente lo que pide el taller — «entreguen un rango, con el
escenario alto y el bajo declarados».

| Caso | 2035 (TWh) | Qué supone |
|---|---:|---|
| Headwinds | ~700 | Vientos macro en contra, límites de adopción e infraestructura |
| High Efficiency | ~960 | Ganancias fuertes en eficiencia de hardware y modelos (20 % bajo el Base) |
| **Base** | **~1.200** | Trayectoria central |
| Lift-Off | ~1.700 | Más adopción de IA y menos cuellos de botella de red |

> «By 2035, the range of data centre electricity demand across our cases spans
> from 700 to 1 700 TWh.» — IEA, *Energy and AI*, resumen ejecutivo

**El rango publicado es de 2,4× entre el piso y el techo.** Esa incertidumbre no
es un defecto del tablero: es el hallazgo. Nadie sabe, y quien presente una línea
sola está ocultando eso.

## Qué hace entonces nuestro tablero

No predice. **Interpola entre anclas publicadas y deja mover los supuestos
entre los casos que la AIE ya declaró.**

Anclas verificadas que tenemos:

```
2020  269 TWh        IEA/PNUD Table 2, panel total
2023  361 TWh        idem
2024  416 TWh        idem   (415 en el titular de la AIE — declarar cuál se usa)
2030  946 TWh        idem
2035  700 / 960 / 1.200 / 1.700 TWh   IEA, cuatro casos
```

Entre esos puntos hay que trazar algo. Ese algo es una **interpolación
declarada**, no un pronóstico. Las opciones honestas:

1. **Interpolación geométrica entre anclas** — supone crecimiento a tasa constante
   por tramo. Es la más simple de explicar y de auditar: un revisor puede
   reproducirla con una calculadora.
2. **Tasa compuesta declarada** — la AIE publica que el consumo creció **12 %
   anual en los últimos cinco años**. Es un ancla real para la perilla de
   crecimiento, no un número inventado.

Las dos se declaran igual: *«línea interpolada entre anclas publicadas; no es
una serie observada».*

## Las perillas y su ancla

Ninguna perilla puede existir sin una cifra publicada que fije su rango. Así
queda cada una del enunciado:

| Perilla | Rango anclado en | Registro |
|---|---|---|
| Tasa de crecimiento | 12 % anual histórico (AIE) | `iea_crecimiento_historico_12pct` |
| PUE del parque | 1,53 (2020) → 1,29 (2030) mundial, derivado de Table 2 | `pue_implicito_parque_mundial` |
| Participación de la IA | Servidores acelerados ≈ mitad del aumento neto a 2030 | `iea_servidores_acelerados_crecimiento` |
| Eficiencia por consulta | 0,24 vs 0,10 Wh — las dos fronteras de Google | `google_energia_por_consulta` |
| Escenario | Los 4 casos de la AIE a 2035 | `iea_escenarios_2035` |

## La regla que hay que escribir en el tablero

> Toda línea posterior a 2030 está interpolada entre el punto de 2030 de la
> AIE y el caso de 2035 que el usuario elija. No es una serie observada ni un
> pronóstico propio: es el rango que la AIE publica, recorrido.

Eso es lo que separa un tablero de una bola de cristal, y es exactamente lo que
un agente verificador puede confirmar: abre la fuente, ve los cuatro casos, y
comprueba que nuestro rango no se sale de ellos.
