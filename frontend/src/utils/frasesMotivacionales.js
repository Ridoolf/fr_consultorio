const FRASES = [
  'Hoy vas a tener un gran día.',
  'Cada sonrisa que cuidás hace la diferencia.',
  'Tu dedicación se nota en cada paciente.',
  'Un día a la vez, paso a paso.',
  'Confiá en tu trabajo: lo hacés muy bien.',
  'Hoy es una buena oportunidad para brillar.',
  'Pequeños gestos, grandes resultados.',
  'Tu consultorio crece con cada jornada.',
  'La calma y la paciencia son tu mejor herramienta.',
  'Hoy podés lograr cosas hermosas.',
  'Cada paciente es una oportunidad de ayudar.',
  'Estás construyendo algo muy valioso.',
  'Respirá, sonreí y seguí adelante.',
  'Tu esfuerzo de hoy suma para mañana.',
  'Hoy es un buen día para hacerlo con amor.',
  'La constancia es tu mayor aliada.',
  'Creá en vos: estás en el camino correcto.',
  'Un turno, un paciente, una sonrisa a la vez.',
  'Tu profesionalismo inspira confianza.',
  'Hoy también cuenta. Dale con todo.',
  'Lo que hacés importa más de lo que creés.',
  'Cada día en el consultorio es un logro.',
  'Tu trabajo transforma vidas, una sonrisa a la vez.',
  'Empezá con energía, terminá con orgullo.',
  'Hoy vas a sorprenderte con lo que podés hacer.',
  'La mejor versión de tu consultorio sos vos.',
  'Con calma y foco, todo sale bien.',
  'Hoy es ideal para avanzar un poquito más.',
  'Tu pasión por la odontología se contagia.',
  'Recordá: cada gran consultorio empezó con un primer paciente.',
];

const NOMBRES = {
  fannyruth: 'Fanny',
  consultorio: 'Consultorio',
};

export function nombreParaSaludo(username) {
  if (!username) return null;
  const key = username.toLowerCase();
  if (NOMBRES[key]) return NOMBRES[key];
  return username.charAt(0).toUpperCase() + username.slice(1);
}

export function fraseDelDia(fecha = new Date()) {
  const indice =
    (fecha.getFullYear() * 1000 + fecha.getMonth() * 100 + fecha.getDate()) %
    FRASES.length;
  return FRASES[indice];
}
