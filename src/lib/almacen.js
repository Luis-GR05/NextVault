// NextVault — persistencia en IndexedDB. Aquí solo se guardan datos ya cifrados.
const NOMBRE = 'nextvault';
const VERSION = 1;
let promesa = null;

function abrir() {
  if (promesa) return promesa;
  promesa = new Promise((ok, mal) => {
    const pet = indexedDB.open(NOMBRE, VERSION);
    pet.onupgradeneeded = () => {
      const db = pet.result;
      db.createObjectStore('cuentas', { keyPath: 'correo' });
      const a = db.createObjectStore('archivos', { keyPath: 'id' });
      a.createIndex('correo', 'correo');
      const f = db.createObjectStore('fragmentos', { keyPath: 'clave' });
      f.createIndex('archivo', 'archivoId');
      f.createIndex('nodo', ['correo', 'nodo']);
      f.createIndex('correo', 'correo');
      const s = db.createObjectStore('secretos', { keyPath: 'id' });
      s.createIndex('correo', 'correo');
    };
    pet.onsuccess = () => ok(pet.result);
    pet.onerror = () => { promesa = null; mal(pet.error); };
  });
  return promesa;
}

const prom = (pet) => new Promise((ok, mal) => { pet.onsuccess = () => ok(pet.result); pet.onerror = () => mal(pet.error); });

async function tx(almacenes, modo, fn) {
  const db = await abrir();
  return new Promise((ok, mal) => {
    const t = db.transaction(almacenes, modo);
    let resultado;
    Promise.resolve(fn(t)).then((r) => { resultado = r; }).catch((e) => { try { t.abort(); } catch { /* ya cerrada */ } mal(e); });
    t.oncomplete = () => ok(resultado);
    t.onerror = () => mal(t.error);
    t.onabort = () => mal(t.error || new Error('Transacción cancelada'));
  });
}

export const bd = {
  obtener: (almacen, clave) => tx(almacen, 'readonly', (t) => prom(t.objectStore(almacen).get(clave))),
  poner: (almacen, valor) => tx(almacen, 'readwrite', (t) => prom(t.objectStore(almacen).put(valor))),
  ponerVarios: (almacen, valores) => tx(almacen, 'readwrite', (t) => Promise.all(valores.map((v) => prom(t.objectStore(almacen).put(v))))),
  borrar: (almacen, clave) => tx(almacen, 'readwrite', (t) => prom(t.objectStore(almacen).delete(clave))),
  porIndice: (almacen, indice, valor) => tx(almacen, 'readonly', (t) => prom(t.objectStore(almacen).index(indice).getAll(valor))),
  clavesPorIndice: (almacen, indice, valor) => tx(almacen, 'readonly', (t) => prom(t.objectStore(almacen).index(indice).getAllKeys(valor))),
  borrarPorIndice: (almacen, indice, valor) => tx(almacen, 'readwrite', async (t) => {
    const s = t.objectStore(almacen);
    const claves = await prom(s.index(indice).getAllKeys(valor));
    await Promise.all(claves.map((k) => prom(s.delete(k))));
    return claves.length;
  }),
  todas: (almacen) => tx(almacen, 'readonly', (t) => prom(t.objectStore(almacen).getAll())),
};

export async function espacioDisponible() {
  if (navigator.storage?.estimate) {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usado: usage, cuota: quota };
  }
  return { usado: 0, cuota: 0 };
}
