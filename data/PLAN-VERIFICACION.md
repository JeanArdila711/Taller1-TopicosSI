# Plan de verificación

Grupo: Jean Carlo Ardila · Juan Pablo Posso · David Cossio
Entrega: 2026-08-30

Regla: **ninguna cifra entra al tablero sin que alguien haya abierto el documento
y encontrado el número adentro.** Si no está donde la ficha dice, es un hallazgo,
no un fracaso — el método del taller premia declarar el hueco.

---

## TIER 1 — Estructurales (12)

Sin estas no hay tablero. Si una falla, hay que rediseñar una mitad.

### Mitad A · Prospectiva

| id | Qué sostiene | Nivel | Quién |
|---|---|:--:|---|
| `iea_dc_tabla_regional` | La tabla regional 2020/2023/2024/2030. **Es el esqueleto entero de la mitad A** | A | Todos |
| `iea_servidores_acelerados_crecimiento` | Perilla «participación de la IA» | A | Jean |
| `lbnl_pue_eeuu` | Perilla «PUE del parque» (1,6→1,4→1,15-1,35) | A | Juan Pablo |
| `google_energia_por_consulta` | Perilla «eficiencia por consulta» + **la lección de frontera** | B | Juan Pablo |

### Mitad B · El edificio

| id | Qué sostiene | Nivel | Quién |
|---|---|:--:|---|
| `lbnl_gpu_reposo` | `TI = placa × (18 + 56 × util)`. **La fórmula base** | A | Juan Pablo |
| `lbnl_utilizacion_servidores` | Rango realista de la perilla de utilización (11-50 %) | A | Juan Pablo |
| `nvidia_nvl72_rack` | 120 kW por rack de IA | B | David |
| `undp_todo_es_calor` | Que el calor a remover = la potencia TI | A | David |

### Varas de traducción

| id | Qué sostiene | Nivel | Quién |
|---|---|:--:|---|
| `xm_demanda_sin_2025` | 84,05 TWh. **La vara de todo el tablero** | A | Jean |
| `xm_capacidad_sin_2026` | 21.287 MW instalados | A | Jean |
| `upme_consumo_subsistencia` | 130/173 kWh-mes → «X hogares» | A | David |
| `dane_poblacion_2025` | 53 M → kWh por persona | A | David |

---

## TIER 2 — Dan profundidad (12)

Se citan, se muestran, pero el tablero sobrevive sin ellas.

| id | Para qué | Nivel |
|---|---|:--:|
| `hueco_entrenamiento_vs_inferencia` | **El hueco declarado.** Barato de reproducir y vale nota | A |
| `lbnl_cola_interconexion_2025` | 2.061 GW en fila | A |
| `lbnl_espera_interconexion` | 61 meses de mediana | A |
| `lbnl_gas_en_cola_2025` | Gas +86 % vs solar −19 % | A |
| `iea_gas_en_sitio_2030` | 15-27 GW de gas en el predio | A |
| `undp_empleo_dc_100mw` | ≈50 empleos permanentes | A |
| `acoldc_colombia_dc_2026` | 25 centros en Colombia | **B** |
| `dch_latam_capacidad_dc` | 1.227 MW en LatAm | **B** |
| `ilkari_rack_colombia` | 5 kW por rack colombiano → la brecha 24× | **B** |
| `undp_acceso_electrico_2030` | 730 M sin electricidad | A |
| `iea_wue_regional` | 1,65 vs 0,5 L/kWh → el trópico paga doble | A |
| `estar_ups_perfil_carga` | 0 % del tiempo a plena carga → redundancia | A |

---

## TIER 3 — Contexto citable

`iea_refrigeracion_share` · `lbnl_infraestructura_share` · `lbnl_dgx_potencia_nominal` ·
`ashrae_clases_agua` · `ashrae_pue_liquido` · `ashrae_ventiladores_servidor` ·
`ashrae_ventiladores_ups` · `estar_ups_eficiencia_vfi` · `doe_transformadores_eficiencia` ·
`80plus_fuentes_servidor` · `uptime_niveles` · `nvidia_refrigeracion_reparto` ·
`ashrae_clase_h1` · `cra_consumo_basico_agua` · `undp_agua_dc_2030` · `epoch_abilene_potencia` ·
`iea_ia_reduccion_emisiones_2035` · `undp_valor_ia_reparto_2030` · `undp_chile_plan_datacenters` ·
`undp_startups_green_ai` · `undp_rdc_cobalto` · `undp_fab_mombasa` · `undp_computo_300000x` ·
`undp_calor_residual` · `undp_malasia_agua_dc` · `meta_llama405b_entrenamiento` ·
`iea_dc_tipico_hogares` · `lbnl_throughput_cola`

---

## Prioridad de riesgo

Verificar en este orden, no en el orden de la tabla:

1. 🔴 `iea_dc_tabla_regional` — de ella cuelga la mitad A entera, y **ya sabemos que las filas no suman el total declarado** (residual 1,2-1,5 %). Hay que ver la tabla original y entender qué región falta.
2. 🔴 `upme_consumo_subsistencia` — cita de segunda mano (paper de la U. Distrital citando estudios del 97 y 2003). Buscar el acto administrativo vigente.
3. 🔴 `acoldc_colombia_dc_2026` — gremio citando informe comercial, y sostiene el argumento sobre Colombia.
4. 🟡 `google_energia_por_consulta` — nivel B, pero es el ejemplo de método del taller. Leer la metodología, no el resumen.
5. 🟡 `xm_demanda_sin_2025` — se verifica bajando la serie y sumando. Es la única que produce **dato propio**.

---

## HUECOS — lo que el corpus no tiene y necesitamos

Confirmado por búsqueda sobre los 211 registros.

| # | Qué falta | Para qué | Dónde buscar |
|---|---|---|---|
| 1 | **Serie anual continua de consumo mundial** | La mitad A pide una trayectoria. El corpus solo trae 4 puntos (2020/2023/2024/2030) | No existe publicada por año. **Se interpola y se declara como derivado** |
| 2 | **Cualquier ancla más allá de 2030** | El taller pide llegar a **2035**. La AIE proyecta a 2030 | 🕳️ **Probablemente no exista.** De 2030 a 2035 el modelo es nuestro y hay que decirlo en la cara |
| 3 | **Factor de emisión de la red colombiana** (gCO₂/kWh) | Perilla «mezcla de generación» y comparar Medellín vs Virginia | XM publica factor de emisión del SIN. Para Virginia: EPA eGRID (región SERC/PJM) |
| 4 | **Energía firme del SIN** | La pregunta de los 5 min habla de «fracción de la energía firme» | XM / UPME — informes de oferta y demanda |
| 5 | **Cola de conexión en Colombia** | El paralelo con los 2.061 GW de EE. UU. es el mejor argumento disponible | UPME, registro de proyectos de generación. **Si no hay equivalente publicado, ese hueco vale tanto como el dato** |
| 6 | **Datos de clima Medellín / Virginia** | Perilla de clima → PUE por sitio | Bulbo húmedo de diseño ASHRAE, o serie IDEAM/NOAA. Alternativa: heurística declarada sobre clases W de ASHRAE |
| 7 | **WUE de un centro de datos en Colombia** | La mitad B pide agua | 🕳️ Probablemente no exista. Usar el rango regional y declararlo |
| 8 | **Capacidad instalada de centros de datos en Colombia, en MW** | — | 🕳️ **Hueco confirmado por el propio cuaderno.** No buscarlo: declararlo |

Los marcados 🕳️ no son tareas pendientes: son **entregables**. La regla 4 del método dice
que declarar el hueco vale más que rellenarlo, y cuatro de los ocho ya se sabe que no
tienen respuesta publicada.
