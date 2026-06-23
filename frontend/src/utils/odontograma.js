export const PIEZAS_SUPERIOR_DERECHA = ['18', '17', '16', '15', '14', '13', '12', '11'];
export const PIEZAS_SUPERIOR_IZQUIERDA = ['21', '22', '23', '24', '25', '26', '27', '28'];
export const PIEZAS_INFERIOR_DERECHA = ['48', '47', '46', '45', '44', '43', '42', '41'];
export const PIEZAS_INFERIOR_IZQUIERDA = ['31', '32', '33', '34', '35', '36', '37', '38'];

export const PIEZAS_PRIM_SUP_DERECHA = ['55', '54', '53', '52', '51'];
export const PIEZAS_PRIM_SUP_IZQUIERDA = ['61', '62', '63', '64', '65'];
export const PIEZAS_PRIM_INF_DERECHA = ['85', '84', '83', '82', '81'];
export const PIEZAS_PRIM_INF_IZQUIERDA = ['71', '72', '73', '74', '75'];

export const PIEZAS_FDI = [
  ...PIEZAS_SUPERIOR_DERECHA,
  ...PIEZAS_SUPERIOR_IZQUIERDA,
  ...PIEZAS_INFERIOR_DERECHA,
  ...PIEZAS_INFERIOR_IZQUIERDA,
];

export const PIEZAS_PRIMARIAS = [
  ...PIEZAS_PRIM_SUP_DERECHA,
  ...PIEZAS_PRIM_SUP_IZQUIERDA,
  ...PIEZAS_PRIM_INF_DERECHA,
  ...PIEZAS_PRIM_INF_IZQUIERDA,
];

export const TODAS_LAS_PIEZAS = [...PIEZAS_FDI, ...PIEZAS_PRIMARIAS];

/** Arco superior e inferior con dentición mixta (permanente + primaria visibles) */
export const ARCOS_ODONTOGRAMA = [
  {
    id: 'superior',
    mitades: [
      {
        filas: [
          { numeros: PIEZAS_SUPERIOR_DERECHA, tipo: 'permanente', invertir: false, alinear: 'stretch' },
          { numeros: PIEZAS_PRIM_SUP_DERECHA, tipo: 'primaria', invertir: false, alinear: 'midline-end' },
        ],
      },
      {
        filas: [
          { numeros: PIEZAS_SUPERIOR_IZQUIERDA, tipo: 'permanente', invertir: false, alinear: 'stretch' },
          { numeros: PIEZAS_PRIM_SUP_IZQUIERDA, tipo: 'primaria', invertir: false, alinear: 'midline-start' },
        ],
      },
    ],
  },
  {
    id: 'inferior',
    mitades: [
      {
        filas: [
          { numeros: PIEZAS_PRIM_INF_DERECHA, tipo: 'primaria', invertir: false, alinear: 'midline-end' },
          { numeros: PIEZAS_INFERIOR_DERECHA, tipo: 'permanente', invertir: false, alinear: 'stretch' },
        ],
      },
      {
        filas: [
          { numeros: PIEZAS_PRIM_INF_IZQUIERDA, tipo: 'primaria', invertir: false, alinear: 'midline-start' },
          { numeros: PIEZAS_INFERIOR_IZQUIERDA, tipo: 'permanente', invertir: false, alinear: 'stretch' },
        ],
      },
    ],
  },
];

/** Convención odontológica: rojo = patología/indicación, azul = fisiología/tratamiento */
export const COLOR_PATOLOGIA = 'rgba(220, 53, 69, 0.5)';
export const COLOR_FISIOLOGIA = 'rgba(13, 110, 253, 0.45)';
export const COLOR_SANO = '#f8faf8';

export const ESTADOS_PIEZA = [
  { value: 'sano', label: 'Sano', color: COLOR_SANO, tipo: 'neutral' },
  { value: 'caries', label: 'Caries', color: COLOR_PATOLOGIA, tipo: 'patologia' },
  { value: 'fractura', label: 'Fractura', color: COLOR_PATOLOGIA, tipo: 'patologia' },
  { value: 'otro', label: 'Otro', color: COLOR_PATOLOGIA, tipo: 'patologia' },
  { value: 'corona', label: 'Corona', color: COLOR_FISIOLOGIA, tipo: 'fisiologia' },
  { value: 'endodoncia', label: 'Endodoncia', color: COLOR_FISIOLOGIA, tipo: 'fisiologia' },
  { value: 'implante', label: 'Implante', color: COLOR_FISIOLOGIA, tipo: 'fisiologia' },
  { value: 'ausente_fisiologica', label: 'Ausente (fisiológica)', color: COLOR_FISIOLOGIA, tipo: 'fisiologia' },
  { value: 'ausente_patologica', label: 'Ausente (patológica)', color: COLOR_PATOLOGIA, tipo: 'patologia' },
];

export const SUPERFICIES = [
  { key: 'V', label: 'Vestibular' },
  { key: 'M', label: 'Mesial' },
  { key: 'O', label: 'Oclusal' },
  { key: 'D', label: 'Distal' },
  { key: 'L', label: 'Lingual' },
];

export const COLOR_CARA_AFECTADA = 'rgba(220, 53, 69, 0.75)';

export function piezaVacia() {
  return {
    estado: 'sano',
    superficies: { V: false, M: false, O: false, D: false, L: false },
    nota: '',
  };
}

export function odontogramaVacio() {
  return Object.fromEntries(TODAS_LAS_PIEZAS.map((num) => [num, piezaVacia()]));
}

const ESTADO_LEGACY_AUSENTE = 'ausente';

export function esAusente(estado) {
  return estado === ESTADO_LEGACY_AUSENTE
    || estado === 'ausente_fisiologica'
    || estado === 'ausente_patologica';
}

export function esAusentePatologica(estado) {
  const normalizado = normalizarEstado(estado);
  return normalizado === 'ausente_patologica';
}

export function esAusenteFisiologica(estado) {
  return normalizarEstado(estado) === 'ausente_fisiologica';
}

export function normalizarEstado(estado) {
  if (estado === ESTADO_LEGACY_AUSENTE) return 'ausente_patologica';
  return estado;
}

export function colorEstado(estado) {
  const normalizado = normalizarEstado(estado);
  return ESTADOS_PIEZA.find((e) => e.value === normalizado)?.color || COLOR_SANO;
}

export function colorPieza(pieza) {
  return colorEstado(pieza?.estado);
}

export function labelEstado(estado) {
  const normalizado = normalizarEstado(estado);
  return ESTADOS_PIEZA.find((e) => e.value === normalizado)?.label || estado;
}

export function esCuadranteDerecho(numero) {
  const n = Number(numero);
  const primerDigito = Math.floor(n / 10);
  return primerDigito === 1 || primerDigito === 4 || primerDigito === 5 || primerDigito === 8;
}

export function normalizarPiezas(piezas) {
  const base = odontogramaVacio();
  if (!piezas || typeof piezas !== 'object') return base;
  TODAS_LAS_PIEZAS.forEach((num) => {
    if (piezas[num]) {
      const estado = normalizarEstado(piezas[num].estado);
      base[num] = {
        ...piezaVacia(),
        ...piezas[num],
        estado,
        superficies: { ...piezaVacia().superficies, ...(piezas[num].superficies || {}) },
      };
    }
  });
  return base;
}

export function piezaConNumero(numero, piezas) {
  return { numero, ...(piezas[numero] || piezaVacia()) };
}

export function piezaTieneHallazgos(pieza) {
  const datos = pieza || piezaVacia();
  if (datos.estado && datos.estado !== 'sano') return true;
  if (datos.nota?.trim()) return true;
  return Object.values(datos.superficies || {}).some(Boolean);
}

export function indicePieza(numero) {
  return TODAS_LAS_PIEZAS.indexOf(String(numero));
}

export function piezaAnterior(numero) {
  const idx = indicePieza(numero);
  if (idx <= 0) return null;
  return TODAS_LAS_PIEZAS[idx - 1];
}

export function piezaSiguiente(numero) {
  const idx = indicePieza(numero);
  if (idx < 0 || idx >= TODAS_LAS_PIEZAS.length - 1) return null;
  return TODAS_LAS_PIEZAS[idx + 1];
}
