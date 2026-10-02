import { useMemo, useState } from 'react';
import { FileText, Download, Trash2, Search, ChevronDown, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { tamano } from '../lib/cripto';
import { nodosDeFragmento } from '../lib/boveda';
import { PERFILES, NOMBRES_NODO } from '../lib/perfiles';
import Subida from './Subida';

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

export default function Archivos() {
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
          <div key={k} className="placa !rounded-md p-4 md:p-6">
            <dd className="font-heading text-2xl md:text-4xl font-medium text-hueso tracking-tight">{v}</dd>
            <dt className="text-xs md:text-sm text-slate-400 font-semibold mt-1">{k}</dt>
          </div>
        ))}
      </dl>

      <Subida />

      <div className="placa p-5 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="font-heading text-hueso text-2xl font-medium">Tu bóveda</h2>
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
                    <span className="w-11 h-11 rounded bg-white/5 border border-white/8 grid place-items-center text-laton flex-none"><FileText size={20} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-hueso font-semibold truncate">{a.nombre}</p>
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
                    <button className="icono-btn hover:!text-alerta" aria-label={`Eliminar ${a.nombre}`} onClick={() => establecerPorBorrar(porBorrar === a.id ? null : a.id)}><Trash2 size={18} /></button>
                  </div>

                  {porBorrar === a.id && (
                    <div className="mt-3 ml-0 md:ml-[60px] flex flex-wrap items-center gap-3 text-sm bg-alerta/8 border border-alerta/25 rounded px-4 py-3">
                      <TriangleAlert size={16} className="text-alerta" />
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

