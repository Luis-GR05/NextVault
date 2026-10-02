import { useEffect, useMemo, useState } from 'react';
import { FileText, KeyRound, Server, ShieldCheck, Download, Trash2, Search, ChevronDown, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { tamano } from '../lib/cripto';
import { nodosDeFragmento } from '../lib/boveda';
import { PERFILES, NOMBRES_NODO } from '../lib/perfiles';
import SimuladorFragmentacion from './SimuladorFragmentacion';
import Credenciales from './Credenciales';
import MonitorRed from './MonitorRed';
import AjustesSeguridad from './AjustesSeguridad';

const PESTANAS = [['archivos', 'Archivos', FileText], ['credenciales', 'Credenciales', KeyRound], ['nodos', 'Nodos', Server], ['seguridad', 'Seguridad', ShieldCheck]];
const fecha = (ms) => new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

/** Un archivo es recuperable si cada fragmento conserva al menos una copia en un nodo conectado. */
function disponibilidad(a, caidos) {
  let peor = Infinity;
  for (const f of a.fragmentos) {
    const vivas = nodosDeFragmento(a.desplazamiento, f.indice, a.copias, a.totalNodos).filter((n) => !caidos.includes(n)).length;
    peor = Math.min(peor, vivas);
  }
  return peor === 0 ? 'inaccesible' : peor < a.copias ? 'degradado' : 'protegido';
}

function Archivos() {
  const { cuenta, archivos, descargarArchivo, eliminarArchivo, avisar } = useSeguridad();
  const [busqueda, establecerBusqueda] = useState('');
  const [abierto, establecerAbierto] = useState(null);
  const [porBorrar, establecerPorBorrar] = useState(null);
  const [descargando, establecerDescargando] = useState(null);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return q ? archivos.filter((a) => a.nombre.toLowerCase().includes(q)) : archivos;
  }, [archivos, busqueda]);
  const total = archivos.reduce((s, a) => s + a.bytes, 0);
  const ocupado = archivos.reduce((s, a) => s + a.bytesCifrados * a.copias, 0);

  const descargar = async (a) => {
    establecerDescargando(a.id);
    try { await descargarArchivo(a); avisar('Archivo reconstruido, verificado y descifrado'); }
    catch (e) { avisar(e.message, 'error'); }
    establecerDescargando(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-3 gap-3 md:gap-5">
        {[['Archivos', archivos.length], ['Contenido original', tamano(total)], ['Ocupado con copias', tamano(ocupado)]].map(([k, v]) => (
          <div key={k} className="vidrio !rounded-2xl p-4 md:p-6">
            <dd className="font-heading text-2xl md:text-4xl font-extrabold text-white tracking-tight">{v}</dd>
            <dt className="text-xs md:text-sm text-slate-400 font-semibold mt-1">{k}</dt>
          </div>
        ))}
      </dl>

      <SimuladorFragmentacion />

      <div className="vidrio p-5 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="font-heading text-white text-2xl font-bold">Tu bóveda</h2>
          {archivos.length > 0 && (
            <div className="relative sm:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="search" className="campo !pl-11" placeholder="Buscar por nombre" aria-label="Buscar archivos" value={busqueda} onChange={(e) => establecerBusqueda(e.target.value)} />
            </div>
          )}
        </div>

        {archivos.length === 0 ? (
          <p className="text-slate-400 py-10 text-center">Aún no hay nada cifrado. Sube un archivo y mira en la pestaña Nodos dónde acaba cada fragmento.</p>
        ) : visibles.length === 0 ? (
          <p className="text-slate-400 py-10 text-center">Ningún archivo se llama así.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/6">
            {visibles.map((a) => {
              const estado = disponibilidad(a, cuenta.nodosCaidos);
              return (
                <li key={a.id} className="py-4 entra">
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="w-11 h-11 rounded-xl bg-white/5 border border-white/8 grid place-items-center text-neon-cyan flex-none"><FileText size={20} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold truncate">{a.nombre}</p>
                      <p className="text-xs text-slate-400">{tamano(a.bytes)} · {fecha(a.creado)} · {a.fragmentos.length} fragmentos × {a.copias}</p>
                    </div>
                    <span className={`chip hidden sm:inline-flex ${estado === 'protegido' ? 'chip-ok' : estado === 'degradado' ? 'chip-aviso' : 'chip-mal'}`}>
                      {estado === 'protegido' ? 'Protegido' : estado === 'degradado' ? 'Sin redundancia' : 'Inaccesible'}
                    </span>
                    <button className="icono-btn" aria-label={`Descargar ${a.nombre}`} disabled={descargando === a.id} onClick={() => descargar(a)}>
                      {descargando === a.id ? <LoaderCircle size={18} className="gira" /> : <Download size={18} />}
                    </button>
                    <button className="icono-btn" aria-label={`Ver detalles de ${a.nombre}`} aria-expanded={abierto === a.id} onClick={() => establecerAbierto(abierto === a.id ? null : a.id)}>
                      <ChevronDown size={18} className={`transition-transform ${abierto === a.id ? 'rotate-180' : ''}`} />
                    </button>
                    <button className="icono-btn hover:!text-neon-pink" aria-label={`Eliminar ${a.nombre}`} onClick={() => establecerPorBorrar(porBorrar === a.id ? null : a.id)}><Trash2 size={18} /></button>
                  </div>

                  {porBorrar === a.id && (
                    <div className="mt-3 ml-0 md:ml-[60px] flex flex-wrap items-center gap-3 text-sm bg-neon-pink/8 border border-neon-pink/25 rounded-xl px-4 py-3">
                      <TriangleAlert size={16} className="text-neon-pink" />
                      <span className="text-slate-200 flex-1">Se borrarán sus {a.fragmentos.length * a.copias} copias. No se puede deshacer.</span>
                      <button className="boton boton-peligro boton-mini" onClick={async () => { await eliminarArchivo(a.id); establecerPorBorrar(null); avisar('Archivo eliminado de todos los nodos'); }}>Eliminar</button>
                      <button className="boton boton-sec boton-mini" onClick={() => establecerPorBorrar(null)}>Conservar</button>
                    </div>
                  )}

                  {abierto === a.id && (
                    <div className="mt-4 ml-0 md:ml-[60px] grid gap-4 text-sm">
                      <p className="text-slate-400">Perfil {PERFILES[a.perfil]?.nombre}{a.comprimido ? ', comprimido con gzip' : ''}. Cifrado: {tamano(a.bytesCifrados)}.</p>
                      <p className="text-slate-400">SHA-256 del original <span className="mono text-xs text-slate-300 break-all block mt-1">{a.huella}</span></p>
                      <div className="grid gap-1.5">
                        {a.fragmentos.map((f) => (
                          <div key={f.indice} className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="mono text-slate-400 w-24">frag. {f.indice + 1} · {tamano(f.bytes)}</span>
                            {nodosDeFragmento(a.desplazamiento, f.indice, a.copias, a.totalNodos).map((n) => (
                              <span key={n} className={`chip ${cuenta.nodosCaidos.includes(n) ? 'chip-mal' : 'chip-ok'}`}>{NOMBRES_NODO[n]}</span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function PanelPrincipal() {
  const { cuenta, archivos, secretos } = useSeguridad();
  const [pestana, establecerPestana] = useState(() => window.location.hash.split('/')[2] || 'archivos');

  useEffect(() => {
    const alCambiar = () => establecerPestana(window.location.hash.split('/')[2] || 'archivos');
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  const activa = PESTANAS.some(([k]) => k === pestana) ? pestana : 'archivos';
  const cuentas = { archivos: archivos.length, credenciales: secretos.length, nodos: cuenta.nodos - cuenta.nodosCaidos.length };

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-10 pt-[104px] pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <h1 className="font-heading text-white text-4xl md:text-5xl font-extrabold tracking-tight">Tu bóveda</h1>
          <p className="text-sm text-slate-400 mt-2">Abierta en este dispositivo. Se bloquea sola {cuenta.autobloqueo ? `tras ${cuenta.autobloqueo} minutos sin actividad` : 'solo cuando tú lo pidas'}.</p>
        </div>
        {cuenta.recuperacion
          ? <span className="chip chip-ok self-start md:self-auto"><ShieldCheck size={13} /> Clave de recuperación creada</span>
          : <a href="#/panel/seguridad" className="chip chip-aviso self-start md:self-auto"><TriangleAlert size={13} /> Sin clave de recuperación</a>}
      </header>

      <div role="tablist" aria-label="Secciones de la bóveda" className="flex gap-1.5 overflow-x-auto sin-barra mb-8 p-1.5 rounded-full bg-white/5 border border-white/8 w-full md:w-max">
        {PESTANAS.map(([k, texto, Icono]) => (
          <a key={k} href={`#/panel/${k}`} role="tab" aria-selected={activa === k}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activa === k ? 'bg-white text-obsidian' : 'text-slate-300 hover:text-white'}`}>
            <Icono size={16} /> {texto}
            {cuentas[k] !== undefined && <span className={`mono text-xs ${activa === k ? 'text-slate-500' : 'text-slate-500'}`}>{cuentas[k]}</span>}
          </a>
        ))}
      </div>

      <div role="tabpanel" key={activa} className="entra">
        {activa === 'archivos' && <Archivos />}
        {activa === 'credenciales' && <Credenciales />}
        {activa === 'nodos' && <MonitorRed />}
        {activa === 'seguridad' && <AjustesSeguridad />}
      </div>
    </div>
  );
}
