import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { bd } from '../lib/almacen';
import {
  aleatorio, derivarClave, generarClaveDatos, envolverClave, desenvolverClave,
  generarClaveRecuperacion, normalizarRecuperacion,
} from '../lib/cripto';
import { PERFILES, configuracionInicial } from '../lib/perfiles';
import * as boveda from '../lib/boveda';

const ContextoSeguridad = createContext(null);
const ULTIMO = 'nextvault_ultimo';
const ITER_RECUPERACION = 200000;

const normalizar = (correo) => correo.trim().toLowerCase();

export function ProveedorSeguridad({ children }) {
  const [cuenta, establecerCuenta] = useState(null);       // registro público de la cuenta (sin claves en claro)
  const [claveDatos, establecerClaveDatos] = useState(null); // CryptoKey en memoria; desaparece al bloquear
  const [archivos, establecerArchivos] = useState([]);
  const [secretos, establecerSecretos] = useState([]);
  const [avisos, establecerAvisos] = useState([]);
  const [iniciando, establecerIniciando] = useState(true);
  const temporizador = useRef(null);
  const cuentaRef = useRef(null);
  useEffect(() => { cuentaRef.current = cuenta; }, [cuenta]);

  const avisar = useCallback((texto, tipo = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    establecerAvisos((a) => [...a, { id, texto, tipo }]);
    setTimeout(() => establecerAvisos((a) => a.filter((x) => x.id !== id)), 4200);
  }, []);

  // Al cargar: si hubo una sesión en este navegador, se muestra bloqueada (hay que volver a escribir la contraseña).
  useEffect(() => {
    (async () => {
      try {
        const ultimo = localStorage.getItem(ULTIMO);
        if (ultimo) { const c = await bd.obtener('cuentas', ultimo); if (c) establecerCuenta(c); }
      } catch { /* IndexedDB no disponible */ }
      establecerIniciando(false);
    })();
  }, []);

  const cargarContenido = useCallback(async (c, clave) => {
    const [a, s] = await Promise.all([boveda.listarArchivos(c.correo, clave), boveda.listarSecretos(c.correo, clave)]);
    establecerArchivos(a); establecerSecretos(s);
  }, []);

  const abrirSesion = useCallback(async (c, clave) => {
    establecerCuenta(c); establecerClaveDatos(clave);
    localStorage.setItem(ULTIMO, c.correo);
    await cargarContenido(c, clave);
  }, [cargarContenido]);

  const registrar = useCallback(async (correoBruto, contrasena, config = configuracionInicial()) => {
    const correo = normalizar(correoBruto);
    if (await bd.obtener('cuentas', correo)) throw new Error('Ya existe una bóveda con ese correo en este navegador. Inicia sesión.');
    const perfil = PERFILES[config.perfil] ?? PERFILES.alfa;
    const sal = aleatorio(16);
    const kek = await derivarClave(contrasena, sal, perfil.iteraciones);
    const dek = await generarClaveDatos();
    const envuelta = await envolverClave(kek, dek);
    const nueva = {
      correo, sal, iteraciones: perfil.iteraciones, dekIv: envuelta.iv, dek: envuelta.cifrado, recuperacion: null,
      perfil: perfil.clave, nodos: config.nodos, copias: Math.min(config.copias, config.nodos), nodosCaidos: [],
      autobloqueo: 10, creada: Date.now(),
    };
    await bd.poner('cuentas', nueva);
    await abrirSesion(nueva, dek);
  }, [abrirSesion]);

  const entrar = useCallback(async (correoBruto, contrasena) => {
    const correo = normalizar(correoBruto);
    const c = await bd.obtener('cuentas', correo);
    if (!c) throw new Error('No hay ninguna bóveda con ese correo en este navegador.');
    const kek = await derivarClave(contrasena, c.sal, c.iteraciones);
    let dek;
    try { dek = await desenvolverClave(kek, c.dekIv, c.dek); }
    catch { throw new Error('Contraseña maestra incorrecta.'); }
    await abrirSesion(c, dek);
  }, [abrirSesion]);

  const guardarCuenta = useCallback(async (campos) => {
    const nueva = { ...cuentaRef.current, ...campos };
    cuentaRef.current = nueva;
    establecerCuenta(nueva);
    await bd.poner('cuentas', nueva);
    return nueva;
  }, []);

  const reenvolver = async (c, dek, contrasena) => {
    const sal = aleatorio(16);
    const kek = await derivarClave(contrasena, sal, PERFILES[c.perfil].iteraciones);
    const envuelta = await envolverClave(kek, dek);
    return { sal, iteraciones: PERFILES[c.perfil].iteraciones, dekIv: envuelta.iv, dek: envuelta.cifrado };
  };

  const entrarConRecuperacion = useCallback(async (correoBruto, claveRecuperacion, nuevaContrasena) => {
    const correo = normalizar(correoBruto);
    const c = await bd.obtener('cuentas', correo);
    if (!c) throw new Error('No hay ninguna bóveda con ese correo en este navegador.');
    if (!c.recuperacion) throw new Error('Esa bóveda no tiene clave de recuperación. Sin la contraseña maestra no se puede abrir.');
    const k = await derivarClave(normalizarRecuperacion(claveRecuperacion), c.recuperacion.sal, ITER_RECUPERACION);
    let dek;
    try { dek = await desenvolverClave(k, c.recuperacion.iv, c.recuperacion.dek); }
    catch { throw new Error('La clave de recuperación no es correcta.'); }
    const actualizada = { ...c, ...(await reenvolver(c, dek, nuevaContrasena)) };
    await bd.poner('cuentas', actualizada);
    await abrirSesion(actualizada, dek);
  }, [abrirSesion]);

  const cambiarContrasena = useCallback(async (actual, nueva) => {
    const kek = await derivarClave(actual, cuenta.sal, cuenta.iteraciones);
    try { await desenvolverClave(kek, cuenta.dekIv, cuenta.dek); }
    catch { throw new Error('La contraseña actual no es correcta.'); }
    await guardarCuenta(await reenvolver(cuenta, claveDatos, nueva));
  }, [cuenta, claveDatos, guardarCuenta]);

  const crearClaveRecuperacion = useCallback(async () => {
    const texto = generarClaveRecuperacion();
    const sal = aleatorio(16);
    const k = await derivarClave(texto, sal, ITER_RECUPERACION);
    const envuelta = await envolverClave(k, claveDatos);
    await guardarCuenta({ recuperacion: { sal, iv: envuelta.iv, dek: envuelta.cifrado, creada: Date.now() } });
    return texto;
  }, [claveDatos, guardarCuenta]);

  const cambiarPerfil = useCallback(async (config, contrasena) => {
    // Cambiar de perfil cambia las iteraciones de PBKDF2: hay que volver a envolver la clave con la contraseña.
    const kek = await derivarClave(contrasena, cuenta.sal, cuenta.iteraciones);
    try { await desenvolverClave(kek, cuenta.dekIv, cuenta.dek); }
    catch { throw new Error('Contraseña maestra incorrecta.'); }
    const base = { ...cuenta, perfil: config.perfil };
    await guardarCuenta({ perfil: config.perfil, copias: Math.min(config.copias, cuenta.nodos), ...(await reenvolver(base, claveDatos, contrasena)) });
  }, [cuenta, claveDatos, guardarCuenta]);

  const bloquear = useCallback(() => { establecerClaveDatos(null); establecerArchivos([]); establecerSecretos([]); }, []);
  const cerrarSesion = useCallback(() => { bloquear(); establecerCuenta(null); localStorage.removeItem(ULTIMO); }, [bloquear]);

  const eliminarCuenta = useCallback(async () => {
    await boveda.borrarTodo(cuenta.correo);
    cerrarSesion();
  }, [cuenta, cerrarSesion]);

  /* Archivos */
  const subirArchivo = useCallback(async (archivo, alProgresar) => {
    const r = await boveda.guardarArchivo({ archivo, cuenta, claveDatos, alProgresar });
    establecerArchivos((a) => [r, ...a]);
    return r;
  }, [cuenta, claveDatos]);

  const descargarArchivo = useCallback(async (registro) => {
    const blob = await boveda.recuperarArchivo({ registro, claveDatos, nodosCaidos: cuenta.nodosCaidos });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: registro.nombre });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, [cuenta, claveDatos]);

  const eliminarArchivo = useCallback(async (id) => {
    await boveda.eliminarArchivo(id);
    establecerArchivos((a) => a.filter((x) => x.id !== id));
  }, []);

  /* Credenciales */
  const guardarSecreto = useCallback(async (secreto) => {
    await boveda.guardarSecreto(cuenta.correo, claveDatos, secreto);
    establecerSecretos(await boveda.listarSecretos(cuenta.correo, claveDatos));
  }, [cuenta, claveDatos]);
  const eliminarSecreto = useCallback(async (id) => {
    await boveda.eliminarSecreto(id);
    establecerSecretos((s) => s.filter((x) => x.id !== id));
  }, []);

  /* Nodos */
  const alternarNodo = useCallback((nodo) => {
    const caidos = cuenta.nodosCaidos.includes(nodo) ? cuenta.nodosCaidos.filter((n) => n !== nodo) : [...cuenta.nodosCaidos, nodo];
    return guardarCuenta({ nodosCaidos: caidos });
  }, [cuenta, guardarCuenta]);

  /* Bloqueo automático por inactividad */
  useEffect(() => {
    if (!claveDatos || !cuenta?.autobloqueo) return undefined;
    const rearmar = () => {
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => { bloquear(); avisar('Bóveda bloqueada por inactividad', 'info'); }, cuenta.autobloqueo * 60000);
    };
    const eventos = ['pointerdown', 'keydown', 'pointermove'];
    eventos.forEach((e) => window.addEventListener(e, rearmar, { passive: true }));
    rearmar();
    return () => { clearTimeout(temporizador.current); eventos.forEach((e) => window.removeEventListener(e, rearmar)); };
  }, [claveDatos, cuenta?.autobloqueo, bloquear, avisar]);

  const valor = useMemo(() => ({
    iniciando, cuenta, abierta: !!claveDatos, bloqueada: !!cuenta && !claveDatos, archivos, secretos, avisos, avisar,
    registrar, entrar, entrarConRecuperacion, cambiarContrasena, crearClaveRecuperacion, cambiarPerfil, guardarCuenta,
    bloquear, cerrarSesion, eliminarCuenta, subirArchivo, descargarArchivo, eliminarArchivo, guardarSecreto, eliminarSecreto, alternarNodo,
  }), [iniciando, cuenta, claveDatos, archivos, secretos, avisos, avisar, registrar, entrar, entrarConRecuperacion, cambiarContrasena,
    crearClaveRecuperacion, cambiarPerfil, guardarCuenta, bloquear, cerrarSesion, eliminarCuenta, subirArchivo, descargarArchivo,
    eliminarArchivo, guardarSecreto, eliminarSecreto, alternarNodo]);

  return <ContextoSeguridad.Provider value={valor}>{children}</ContextoSeguridad.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSeguridad() {
  const contexto = useContext(ContextoSeguridad);
  if (!contexto) throw new Error('useSeguridad debe usarse dentro de ProveedorSeguridad');
  return contexto;
}
