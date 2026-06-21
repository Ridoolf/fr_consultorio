/**
 * Valida coherencia del odontograma frontend y escribe en debug-0ba2bd.log
 */
import { writeFileSync, appendFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  TODAS_LAS_PIEZAS,
  ARCOS_ODONTOGRAMA,
  ESTADOS_PIEZA,
  normalizarPiezas,
  esAusente,
  esAusentePatologica,
  esAusenteFisiologica,
  colorPieza,
} from '../src/utils/odontograma.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_PATH = join(__dirname, '..', '..', 'debug-0ba2bd.log');
const SESSION_ID = '0ba2bd';

function log(hypothesisId, message, data = {}, runId = 'health-check') {
  const entry = {
    sessionId: SESSION_ID,
    runId,
    hypothesisId,
    location: 'health-check-odontograma.mjs',
    message,
    data,
    timestamp: Date.now(),
  };
  appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n', 'utf8');
}

const results = { passed: [], failed: [] };
const ok = (n, d) => { results.passed.push(n); log('OK', `PASS: ${n}`, { detail: d }); };
const fail = (n, d) => { results.failed.push(n); log('FAIL', `FAIL: ${n}`, { detail: d }); };

// H5: 52 piezas
if (TODAS_LAS_PIEZAS.length === 52) ok('frontend_piezas_count', 52);
else fail('frontend_piezas_count', TODAS_LAS_PIEZAS.length);

// H6: arcos cubren todas sin duplicados
const enArcos = ARCOS_ODONTOGRAMA.flatMap((a) =>
  a.mitades.flatMap((m) => m.filas.flatMap((f) => f.numeros))
);
const unique = new Set(enArcos);
if (unique.size === 52 && enArcos.length === 52) ok('arcos_coverage');
else fail('arcos_coverage', { total: enArcos.length, unique: unique.size });

// H7: estados con tipo y color
const sinTipo = ESTADOS_PIEZA.filter((e) => e.tipo !== 'neutral' && !e.color);
if (sinTipo.length === 0) ok('estados_colores');
else fail('estados_colores', sinTipo.map((e) => e.value));

// H8: normalizar legacy ausente
const norm = normalizarPiezas({ 11: { estado: 'ausente', superficies: {}, nota: '' } });
if (norm['11'].estado === 'ausente_patologica') ok('normalizar_ausente_legacy');
else fail('normalizar_ausente_legacy', norm['11'].estado);

// H9: helpers ausente
if (esAusente('ausente') && esAusentePatologica('ausente') && esAusenteFisiologica('ausente_fisiologica')) {
  ok('helpers_ausente');
} else {
  fail('helpers_ausente');
}

// H10: colorPieza patologia vs fisiologia
const rojo = colorPieza({ estado: 'caries' });
const azul = colorPieza({ estado: 'corona' });
if (rojo.includes('220') && azul.includes('13')) ok('colores_convencion');
else fail('colores_convencion', { rojo, azul });

log('SUMMARY', 'frontend odontograma check complete', {
  passed: results.passed.length,
  failed: results.failed.length,
  failures: results.failed,
});

console.log(JSON.stringify(results, null, 2));
process.exit(results.failed.length > 0 ? 1 : 0);
