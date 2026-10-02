import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { PERFILES, NOMBRES_NODO } from '../lib/perfiles';
import { nodosDeFragmento } from '../lib/boveda';

const TONOS = ['bg-neon-cyan', 'bg-neon-violet', 'bg-neon-pink', 'bg-neon-green', 'bg-neon-amber', 'bg-sky-400', 'bg-fuchsia-400', 'bg-lime-400'];

export default function ConfiguradorPlan({ abrirAcceso }) {
  const { cuenta } = useSeguridad();
  const [perfil, establecerPerfil] = useState('alfa');
  const [nodos, establecerNodos] = useState(6);
  const [copias, establecerCopias] = useState(PERFILES.alfa.copias);
  const p = PERFILES[perfil];
  const copiasReales = Math.min(copias, nodos);

  const elegirPerfil = (k) => { establecerPerfil(k); establecerCopias(PERFILES[k].copias); };

  // Reparto real de un archivo de ejemplo: qué fragmentos caerían en cada nodo.
  const reparto = useMemo(() => {
    const porNodo = Array.from({ length: nodos }, () => []);
    for (let f = 0; f < p.fragmentos; f++) nodosDeFragmento(0, f, copiasReales, nodos).forEach((n) => porNodo[n].push(f));
    return porNodo;
  }, [nodos, copiasReales, p.fragmentos]);

  return (
    <section id="configurar" className="relative max-w-7xl mx-auto px-5 md:px-10 py-20 md:py-28">
      <h2 className="titular max-w-3xl">Configura tu bóveda y mira dónde acaba cada fragmento</h2>

      <div className="mt-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="vidrio p-6 md:p-9 flex flex-col gap-8">
          <div>
            <label htmlFor="cfg-perfil" className="etiqueta">Perfil</label>
            <select id="cfg-perfil" className="campo" value={perfil} onChange={(e) => elegirPerfil(e.target.value)}>
              {Object.values(PERFILES).map((x) => <option key={x.clave} value={x.clave}>{x.nombre}: {x.lema.toLowerCase()}</option>)}
            </select>
          </div>
          <div>
            <div className="flex justify-between mb-3"><label htmlFor="cfg-nodos" className="etiqueta !mb-0">Nodos de almacenamiento</label><span className="mono font-bold text-white">{nodos}</span></div>
            <input id="cfg-nodos" type="range" min="4" max="12" value={nodos} onChange={(e) => establecerNodos(Number(e.target.value))} className="rango" />
          </div>
          <div>
            <div className="flex justify-between mb-3"><label htmlFor="cfg-copias" className="etiqueta !mb-0">Copias de cada fragmento</label><span className="mono font-bold text-white">{copiasReales}</span></div>
            <input id="cfg-copias" type="range" min="1" max="3" value={copias} onChange={(e) => establecerCopias(Number(e.target.value))} className="rango" />
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 pt-6 border-t border-white/8">
            <div><dt className="text-xs text-slate-400 font-semibold">Aguanta la caída de</dt>
              <dd className="font-heading text-2xl font-extrabold text-white mt-1">{copiasReales - 1 === 0 ? 'Ningún nodo' : `${copiasReales - 1} ${copiasReales - 1 === 1 ? 'nodo' : 'nodos'}`}</dd></div>
            <div><dt className="text-xs text-slate-400 font-semibold">Espacio ocupado</dt>
              <dd className="font-heading text-2xl font-extrabold text-white mt-1">×{copiasReales}{p.comprimir ? ' tras comprimir' : ''}</dd></div>
            <div><dt className="text-xs text-slate-400 font-semibold">Fragmentos por archivo</dt>
              <dd className="font-heading text-2xl font-extrabold text-white mt-1">{p.fragmentos}</dd></div>
            <div><dt className="text-xs text-slate-400 font-semibold">Derivación de clave</dt>
              <dd className="font-heading text-2xl font-extrabold text-white mt-1">{(p.iteraciones / 1000).toLocaleString('es-ES')}k iter.</dd></div>
          </dl>
          {copiasReales === 1 && <p className="chip chip-aviso self-start">Con una sola copia, perder un nodo es perder archivos</p>}

          {cuenta ? (
            <p className="text-sm text-slate-400">Ya tienes una bóveda en este navegador. Puedes cambiar su perfil desde Seguridad, dentro del panel.</p>
          ) : (
            <button onClick={() => abrirAcceso('registro', { perfil, nodos, copias: copiasReales })} className="boton boton-pri self-start">
              Crear bóveda con esta configuración <ArrowRight size={16} />
            </button>
          )}
        </div>

        <div className="vidrio p-6 md:p-9">
          <p className="etiqueta">Reparto de un archivo de ejemplo</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {reparto.map((fragmentos, n) => (
              <div key={n} className="rounded-2xl border border-white/8 bg-black/30 p-4 min-h-[96px]">
                <p className="text-sm font-bold text-white">{NOMBRES_NODO[n]}</p>
                <p className="mono text-[11px] text-slate-500">nodo {n + 1}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {fragmentos.length ? fragmentos.map((f) => (
                    <span key={f} title={`Fragmento ${f + 1}`} className={`w-6 h-6 rounded-md grid place-items-center text-[11px] font-extrabold text-obsidian ${TONOS[f % TONOS.length]}`}>{f + 1}</span>
                  )) : <span className="text-xs text-slate-600">sin fragmentos</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-5">Cada número es un fragmento del archivo cifrado. El mismo número en dos nodos es su copia de seguridad.</p>
        </div>
      </div>
    </section>
  );
}
