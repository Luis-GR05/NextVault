import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { PERFILES, NOMBRES_NODO, cuotaPlan } from '../lib/perfiles';
import { nodosDeFragmento } from '../lib/boveda';

export default function Configurador({ abrirAcceso, irAlPanel }) {
  const { cuenta, abierta } = useSeguridad();
  const [perfil, establecerPerfil] = useState('alfa');
  const [nodos, establecerNodos] = useState(6);
  const [copias, establecerCopias] = useState(PERFILES.alfa.copias);
  const p = PERFILES[perfil];
  const copiasReales = Math.min(copias, nodos);
  const cuota = cuotaPlan({ perfil, nodos, copias: copiasReales });

  const reparto = useMemo(() => {
    const porNodo = Array.from({ length: nodos }, () => []);
    for (let f = 0; f < p.fragmentos; f++) nodosDeFragmento(0, f, copiasReales, nodos).forEach((n) => porNodo[n].push(f));
    return porNodo;
  }, [nodos, copiasReales, p.fragmentos]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 lg:gap-16 max-w-[1180px]">
      <div>
        <h2 className="titular sube">Monta tu plan pieza a pieza</h2>
        <div className="sube mt-9 grid gap-7 max-w-[440px]" style={{ '--n': 1 }}>
          <div>
            <label htmlFor="cfg-perfil" className="etiqueta">Bóveda</label>
            <select id="cfg-perfil" className="campo" value={perfil} onChange={(e) => { establecerPerfil(e.target.value); establecerCopias(PERFILES[e.target.value].copias); }}>
              {Object.values(PERFILES).map((x) => <option key={x.clave} value={x.clave}>{x.nombre}: {x.lema.toLowerCase()}</option>)}
            </select>
          </div>
          <div>
            <div className="flex justify-between mb-3"><label htmlFor="cfg-nodos" className="etiqueta !mb-0">Nodos de almacenamiento</label><span className="mono text-sm">{nodos}</span></div>
            <input id="cfg-nodos" type="range" min="4" max="12" value={nodos} onChange={(e) => establecerNodos(Number(e.target.value))} className="rango" />
          </div>
          <div>
            <div className="flex justify-between mb-3"><label htmlFor="cfg-copias" className="etiqueta !mb-0">Copias de cada fragmento</label><span className="mono text-sm">{copiasReales}</span></div>
            <input id="cfg-copias" type="range" min="1" max="3" value={copias} onChange={(e) => establecerCopias(Number(e.target.value))} className="rango" />
          </div>
        </div>
      </div>

      <div className="sube" style={{ '--n': 2 }}>
        <div className="placa p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[var(--linea)]">
            <div>
              <p className="dato">Cuota estimada</p>
              <p className="text-[clamp(2.6rem,5vw,4rem)] leading-none font-medium tracking-[-0.04em] mt-1">{cuota.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €<span className="text-base text-niebla font-normal tracking-normal"> /mes</span></p>
            </div>
            {abierta ? <button onClick={irAlPanel} className="boton boton-pri">Ir al panel <ArrowRight size={16} /></button>
              : cuenta ? <button onClick={() => abrirAcceso('desbloquear')} className="boton boton-pri">Desbloquear mi bóveda</button>
              : <button onClick={() => abrirAcceso('registro', { perfil, nodos, copias: copiasReales })} className="boton boton-pri">Crear bóveda con este plan <ArrowRight size={16} /></button>}
          </div>
          <table className="tabla-ficha">
            <tbody>
              <tr><th scope="row">Bóveda {p.nombre}</th><td>{p.precio.toFixed(2).replace('.', ',')} €</td></tr>
              <tr><th scope="row">{nodos} nodos × 0,50 €</th><td>{(nodos * 0.5).toFixed(2).replace('.', ',')} €</td></tr>
              <tr><th scope="row">{copiasReales - 1} {copiasReales - 1 === 1 ? 'copia adicional' : 'copias adicionales'} × 2 €</th><td>{((copiasReales - 1) * 2).toFixed(2).replace('.', ',')} €</td></tr>
              <tr><th scope="row">Aguanta la caída de</th><td className={copiasReales === 1 ? '!text-aviso' : ''}>{copiasReales - 1 === 0 ? 'ningún nodo' : `${copiasReales - 1} ${copiasReales - 1 === 1 ? 'nodo' : 'nodos'}`}</td></tr>
            </tbody>
          </table>
          <p className="dato mt-6 mb-3">Reparto de un archivo ({p.fragmentos} fragmentos)</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {reparto.map((fr, n) => (
              <div key={n} className="border border-[var(--linea)] px-2.5 py-2 min-h-[58px]">
                <p className="text-[11px] text-niebla truncate">{NOMBRES_NODO[n]}</p>
                <p className="mono text-[11px] text-laton mt-1 tracking-widest">{fr.length ? fr.map((f) => f + 1).join(' ') : <span className="text-niebla">—</span>}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="dato mt-4">Proyecto de demostración: la cuota es orientativa y no se cobra nada. La bóveda se crea y funciona en este navegador.</p>
      </div>
    </div>
  );
}
