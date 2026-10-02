// NextVault — operaciones de la bóveda: cifrar, fragmentar, repartir, recuperar, auditar y reparar.
import { bd } from './almacen';
import { cifrar, descifrar, cifrarJson, descifrarJson, sha256, aleatorio, aHex } from './cripto';
import { PERFILES } from './perfiles';

export const LIMITE_ARCHIVO = 250 * 1024 * 1024;

const claveFragmento = (archivoId, indice, nodo) => `${archivoId}:${indice}:${nodo}`;

/** Nodos que reciben las copias del fragmento `indice`: consecutivos a partir de un desplazamiento propio del archivo. */
export function nodosDeFragmento(desplazamiento, indice, copias, totalNodos) {
  const n = [];
  for (let r = 0; r < Math.min(copias, totalNodos); r++) n.push((desplazamiento + indice + r) % totalNodos);
  return n;
}

async function comprimir(bytes) {
  const flujo = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(flujo).arrayBuffer());
}
async function descomprimir(bytes) {
  const flujo = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(flujo).arrayBuffer());
}

/**
 * Guarda un archivo. `alProgresar({ fase, progreso, detalle })` informa de cada etapa real.
 * Devuelve el registro con los metadatos ya descifrados para la interfaz.
 */
export async function guardarArchivo({ archivo, cuenta, claveDatos, alProgresar = () => {} }) {
  if (archivo.size > LIMITE_ARCHIVO) throw new Error('El archivo supera el límite de 250 MB por archivo.');
  if (archivo.size === 0) throw new Error('El archivo está vacío.');
  const perfil = PERFILES[cuenta.perfil];
  const id = aHex(aleatorio(8));

  alProgresar({ fase: 'leyendo', progreso: 0.05 });
  let claro = new Uint8Array(await archivo.arrayBuffer());
  const huella = await sha256(claro);

  let comprimido = false;
  if (perfil.comprimir && 'CompressionStream' in window) {
    alProgresar({ fase: 'comprimiendo', progreso: 0.15 });
    const c = await comprimir(claro);
    if (c.length < claro.length) { claro = c; comprimido = true; }
  }

  alProgresar({ fase: 'cifrando', progreso: 0.3 });
  const { iv, cifrado } = await cifrar(claveDatos, claro);

  const totalFragmentos = Math.max(1, Math.min(perfil.fragmentos, cifrado.length));
  const paso = Math.ceil(cifrado.length / totalFragmentos);
  const desplazamiento = aleatorio(1)[0] % cuenta.nodos;
  const fragmentos = [];
  for (let i = 0; i < totalFragmentos; i++) {
    alProgresar({ fase: 'fragmentando', progreso: 0.45 + 0.25 * (i / totalFragmentos), detalle: `${i + 1}/${totalFragmentos}` });
    const datos = cifrado.slice(i * paso, Math.min((i + 1) * paso, cifrado.length));
    const hash = await sha256(datos);
    fragmentos.push({ indice: i, hash, bytes: datos.length, datos });
  }

  alProgresar({ fase: 'repartiendo', progreso: 0.75 });
  const registros = [];
  for (const f of fragmentos) {
    for (const nodo of nodosDeFragmento(desplazamiento, f.indice, cuenta.copias, cuenta.nodos)) {
      registros.push({ clave: claveFragmento(id, f.indice, nodo), archivoId: id, correo: cuenta.correo, indice: f.indice, nodo, hash: f.hash, bytes: f.bytes, datos: f.datos.buffer });
    }
  }
  await bd.ponerVarios('fragmentos', registros);

  const meta = { nombre: archivo.name, tipo: archivo.type || 'application/octet-stream', bytes: archivo.size, huella, modificado: archivo.lastModified };
  const metaCifrada = await cifrarJson(claveDatos, meta);
  const registro = {
    id, correo: cuenta.correo, creado: Date.now(), perfil: cuenta.perfil, comprimido,
    iv, bytesCifrados: cifrado.length, desplazamiento, copias: cuenta.copias, totalNodos: cuenta.nodos,
    fragmentos: fragmentos.map(({ indice, hash, bytes }) => ({ indice, hash, bytes })),
    metaIv: metaCifrada.iv, meta: metaCifrada.cifrado,
  };
  await bd.poner('archivos', registro);
  alProgresar({ fase: 'listo', progreso: 1 });
  return { ...registro, ...meta };
}

export async function listarArchivos(correo, claveDatos) {
  const registros = await bd.porIndice('archivos', 'correo', correo);
  const salida = [];
  for (const r of registros) {
    try { salida.push({ ...r, ...(await descifrarJson(claveDatos, r.metaIv, r.meta)) }); }
    catch { salida.push({ ...r, nombre: '(metadatos ilegibles)', bytes: 0, tipo: '', huella: '' }); }
  }
  return salida.sort((a, b) => b.creado - a.creado);
}

/** Busca, para cada fragmento, una copia íntegra en un nodo conectado. */
async function reunirFragmentos(registro, nodosCaidos) {
  const copias = await bd.porIndice('fragmentos', 'archivo', registro.id);
  const partes = [];
  for (const f of registro.fragmentos) {
    const candidatas = copias.filter((c) => c.indice === f.indice);
    let buena = null;
    for (const c of candidatas) {
      if (nodosCaidos.includes(c.nodo)) continue;
      if ((await sha256(c.datos)) === f.hash) { buena = c; break; }
    }
    if (!buena) {
      const donde = candidatas.length ? `sus copias están en nodos desconectados o dañados (${candidatas.map((c) => c.nodo + 1).join(', ')})` : 'no queda ninguna copia';
      throw new Error(`No se puede reconstruir: falta el fragmento ${f.indice + 1} de ${registro.fragmentos.length}; ${donde}.`);
    }
    partes.push(new Uint8Array(buena.datos));
  }
  return partes;
}

export async function recuperarArchivo({ registro, claveDatos, nodosCaidos = [] }) {
  const partes = await reunirFragmentos(registro, nodosCaidos);
  const cifrado = new Uint8Array(partes.reduce((a, p) => a + p.length, 0));
  let pos = 0;
  for (const p of partes) { cifrado.set(p, pos); pos += p.length; }
  let claro = await descifrar(claveDatos, registro.iv, cifrado);
  if (registro.comprimido) claro = await descomprimir(claro);
  if (registro.huella && (await sha256(claro)) !== registro.huella) throw new Error('La huella SHA-256 no coincide con la original.');
  return new Blob([claro], { type: registro.tipo });
}

export async function eliminarArchivo(id) {
  await bd.borrarPorIndice('fragmentos', 'archivo', id);
  await bd.borrar('archivos', id);
}

/** Estado de cada nodo: fragmentos y bytes que guarda. */
export async function estadoNodos(cuenta) {
  const todos = await bd.porIndice('fragmentos', 'correo', cuenta.correo);
  const nodos = Array.from({ length: cuenta.nodos }, (_, i) => ({ id: i, fragmentos: 0, bytes: 0 }));
  for (const f of todos) { if (nodos[f.nodo]) { nodos[f.nodo].fragmentos++; nodos[f.nodo].bytes += f.bytes; } }
  return nodos;
}

/** Comprueba la huella de todas las copias y cuenta cuántas quedan sanas por fragmento. */
export async function auditar(cuenta, nodosCaidos = [], alProgresar = () => {}) {
  const archivos = await bd.porIndice('archivos', 'correo', cuenta.correo);
  const informe = { archivos: archivos.length, copiasRevisadas: 0, copiasDanadas: 0, copiasAusentes: 0, degradados: [], irrecuperables: [] };
  let hechos = 0;
  for (const a of archivos) {
    const copias = await bd.porIndice('fragmentos', 'archivo', a.id);
    let peor = Infinity;
    for (const f of a.fragmentos) {
      const esperados = nodosDeFragmento(a.desplazamiento, f.indice, a.copias, a.totalNodos);
      let sanas = 0;
      for (const nodo of esperados) {
        const c = copias.find((x) => x.indice === f.indice && x.nodo === nodo);
        if (!c) { informe.copiasAusentes++; continue; }
        informe.copiasRevisadas++;
        if ((await sha256(c.datos)) !== f.hash) { informe.copiasDanadas++; continue; }
        if (!nodosCaidos.includes(nodo)) sanas++;
      }
      peor = Math.min(peor, sanas);
    }
    if (peor === 0) informe.irrecuperables.push(a.id);
    else if (peor < a.copias) informe.degradados.push(a.id);
    alProgresar(++hechos / archivos.length);
  }
  return informe;
}

/** Vuelve a crear las copias ausentes o dañadas a partir de una copia sana. */
export async function reparar(cuenta, nodosCaidos = []) {
  const archivos = await bd.porIndice('archivos', 'correo', cuenta.correo);
  let restauradas = 0, sinFuente = 0;
  for (const a of archivos) {
    const copias = await bd.porIndice('fragmentos', 'archivo', a.id);
    for (const f of a.fragmentos) {
      const esperados = nodosDeFragmento(a.desplazamiento, f.indice, a.copias, a.totalNodos);
      let fuente = null; const faltan = [];
      for (const nodo of esperados) {
        const c = copias.find((x) => x.indice === f.indice && x.nodo === nodo);
        const sana = c && (await sha256(c.datos)) === f.hash;
        if (sana && !nodosCaidos.includes(nodo)) fuente = fuente || c;
        else if (!sana && !nodosCaidos.includes(nodo)) faltan.push(nodo);
      }
      if (!faltan.length) continue;
      if (!fuente) { sinFuente += faltan.length; continue; }
      await bd.ponerVarios('fragmentos', faltan.map((nodo) => ({ ...fuente, clave: claveFragmento(a.id, f.indice, nodo), nodo })));
      restauradas += faltan.length;
    }
  }
  return { restauradas, sinFuente };
}

/** Simula la pérdida del disco de un nodo: borra de verdad todos sus fragmentos. */
export const vaciarNodo = (cuenta, nodo) => bd.borrarPorIndice('fragmentos', 'nodo', [cuenta.correo, nodo]);

/** Simula corrupción silenciosa: altera un byte de un fragmento del nodo. */
export async function corromperFragmento(cuenta, nodo) {
  const lista = await bd.porIndice('fragmentos', 'nodo', [cuenta.correo, nodo]);
  if (!lista.length) return false;
  const f = lista[aleatorio(1)[0] % lista.length];
  const bytes = new Uint8Array(f.datos.slice(0));
  bytes[0] ^= 0xff;
  await bd.poner('fragmentos', { ...f, datos: bytes.buffer });
  return true;
}

/* ───── Credenciales ───── */
export async function listarSecretos(correo, claveDatos) {
  const registros = await bd.porIndice('secretos', 'correo', correo);
  const salida = [];
  for (const r of registros) {
    try { salida.push({ id: r.id, actualizado: r.actualizado, ...(await descifrarJson(claveDatos, r.iv, r.datos)) }); } catch { /* registro ilegible: se omite */ }
  }
  return salida.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
}
export async function guardarSecreto(correo, claveDatos, secreto) {
  const { id = aHex(aleatorio(8)), ...campos } = secreto;
  const { iv, cifrado } = await cifrarJson(claveDatos, campos);
  await bd.poner('secretos', { id, correo, iv, datos: cifrado, actualizado: Date.now() });
  return id;
}
export const eliminarSecreto = (id) => bd.borrar('secretos', id);

export async function borrarTodo(correo) {
  await bd.borrarPorIndice('fragmentos', 'correo', correo);
  await bd.borrarPorIndice('archivos', 'correo', correo);
  await bd.borrarPorIndice('secretos', 'correo', correo);
  await bd.borrar('cuentas', correo);
}
