// NextVault — primitivas criptográficas sobre WebCrypto (AES-256-GCM, PBKDF2-SHA-256, SHA-256).
// Todo ocurre en el navegador: ni la contraseña ni las claves salen del dispositivo.

const te = new TextEncoder();
const td = new TextDecoder();

export const aleatorio = (n) => crypto.getRandomValues(new Uint8Array(n));

export const aHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function sha256(datos) {
  return aHex(await crypto.subtle.digest('SHA-256', datos));
}

/** Deriva una clave AES-GCM de 256 bits a partir de un secreto (contraseña o clave de recuperación). */
export async function derivarClave(secreto, sal, iteraciones) {
  const base = await crypto.subtle.importKey('raw', te.encode(secreto), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: sal, iterations: iteraciones, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/** Clave de datos (DEK): cifra archivos y credenciales. Se guarda siempre envuelta. */
export function generarClaveDatos() {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function cifrar(clave, datos) {
  const iv = aleatorio(12);
  const cifrado = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, clave, datos);
  return { iv, cifrado: new Uint8Array(cifrado) };
}

export async function descifrar(clave, iv, cifrado) {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, clave, cifrado));
}

export async function envolverClave(claveEnvoltura, claveDatos) {
  const cruda = await crypto.subtle.exportKey('raw', claveDatos);
  return cifrar(claveEnvoltura, cruda);
}

export async function desenvolverClave(claveEnvoltura, iv, envuelta) {
  const cruda = await descifrar(claveEnvoltura, iv, envuelta); // lanza si la contraseña no es correcta
  return crypto.subtle.importKey('raw', cruda, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export const cifrarJson = (clave, objeto) => cifrar(clave, te.encode(JSON.stringify(objeto)));
export const descifrarJson = async (clave, iv, cifrado) => JSON.parse(td.decode(await descifrar(clave, iv, cifrado)));

/** Clave de recuperación legible: 20 bytes aleatorios en base32, en grupos de cuatro. */
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export function generarClaveRecuperacion() {
  const bytes = aleatorio(20);
  let bits = '';
  bytes.forEach((b) => { bits += b.toString(2).padStart(8, '0'); });
  let salida = '';
  for (let i = 0; i < bits.length; i += 5) salida += B32[parseInt(bits.slice(i, i + 5), 2)];
  return salida.match(/.{4}/g).join('-');
}
export const normalizarRecuperacion = (t) => t.toUpperCase().replace(/[^A-Z0-9]/g, '').match(/.{1,4}/g)?.join('-') ?? '';

/* ───── Generador de contraseñas ───── */
export const JUEGOS = {
  minusculas: 'abcdefghijkmnopqrstuvwxyz',
  mayusculas: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  numeros: '23456789',
  simbolos: '!@#$%&*+-=?_.:;',
};

function enteroAleatorio(max) {
  // Muestreo por rechazo para evitar sesgo de módulo.
  const limite = Math.floor(0x100000000 / max) * max;
  const b = new Uint32Array(1);
  do crypto.getRandomValues(b); while (b[0] >= limite);
  return b[0] % max;
}

export function generarContrasena(longitud, opciones) {
  const activos = Object.keys(JUEGOS).filter((k) => opciones[k]);
  if (!activos.length) return '';
  const alfabeto = activos.map((k) => JUEGOS[k]).join('');
  const chars = activos.map((k) => JUEGOS[k][enteroAleatorio(JUEGOS[k].length)]); // al menos uno de cada juego
  while (chars.length < longitud) chars.push(alfabeto[enteroAleatorio(alfabeto.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = enteroAleatorio(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, longitud).join('');
}

export function entropiaBits(longitud, opciones) {
  const n = Object.keys(JUEGOS).filter((k) => opciones[k]).reduce((a, k) => a + JUEGOS[k].length, 0);
  return n ? Math.round(longitud * Math.log2(n)) : 0;
}

/** Estimación de la entropía de una contraseña escrita por una persona (cota superior optimista). */
export function entropiaDeTexto(texto) {
  if (!texto) return 0;
  let n = 0;
  if (/[a-zñ]/.test(texto)) n += 27;
  if (/[A-ZÑ]/.test(texto)) n += 27;
  if (/\d/.test(texto)) n += 10;
  if (/[^A-Za-z0-9ñÑ]/.test(texto)) n += 30;
  const unicos = new Set(texto).size;
  const penalizacion = Math.min(1, unicos / Math.min(texto.length, 12));
  return Math.round(texto.length * Math.log2(n || 1) * penalizacion);
}

export function nivelDeBits(bits) {
  if (bits < 45) return { texto: 'Débil', clase: 'chip-mal', color: 'bg-neon-pink' };
  if (bits < 75) return { texto: 'Aceptable', clase: 'chip-aviso', color: 'bg-neon-amber' };
  if (bits < 110) return { texto: 'Fuerte', clase: 'chip-ok', color: 'bg-neon-green' };
  return { texto: 'Excelente', clase: 'chip-ok', color: 'bg-neon-cyan' };
}


export function tiempoFuerzaBruta(bits) {
  // 10^12 intentos por segundo, la mitad del espacio de media.
  const segundos = Math.pow(2, bits - 1) / 1e12;
  const u = [['siglos', 3.15e9], ['años', 3.15e7], ['días', 86400], ['horas', 3600], ['minutos', 60]];
  if (segundos < 1) return 'menos de un segundo';
  if (segundos > 3.15e9 * 1e6) return 'más que la edad del universo';
  for (const [nombre, s] of u) if (segundos >= s) return `${Math.round(segundos / s).toLocaleString('es-ES')} ${nombre}`;
  return `${Math.round(segundos)} segundos`;
}

export const tamano = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  const u = ['KB', 'MB', 'GB'];
  let v = bytes / 1024, i = 0;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toLocaleString('es-ES', { maximumFractionDigits: v < 10 ? 1 : 0 })} ${u[i]}`;
};
