import { useCallback, useEffect, useState } from 'react';
import { Activity, Wrench, HardDrive, Bug, LoaderCircle } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { tamano } from '../lib/cripto';
import { NOMBRES_NODO } from '../lib/perfiles';
import { estadoNodos, auditar, reparar, vaciarNodo, corromperFragmento } from '../lib/boveda';

/** Estado real de cada nodo y herramientas para provocar fallos, auditar la integridad y reparar. */
export default function Nodos() {
  const { cuenta, archivos, alternarNodo, avisar } = useSeguridad();
  const [nodos, establecerNodos] = useState([]);
  const [informe, establecerInforme] = useState(null);
  const [tarea, establecerTarea] = useState(null);
  const [porVaciar, establecerPorVaciar] = useState(null);

  const refrescar = useCallback(async () => establecerNodos(await estadoNodos(cuenta)), [cuenta]);
  useEffect(() => {
    let vigente = true;
    estadoNodos(cuenta).then((n) => { if (vigente) establecerNodos(n); });
    return () => { vigente = false; };
  }, [cuenta, archivos]);

  const ejecutarAuditoria = async (silenciosa = false) => {
    establecerTarea('auditar');
    try {
      const r = await auditar(cuenta, cuenta.nodosCaidos);
      establecerInforme(r);
      if (!silenciosa) avisar(r.irrecuperables.length ? 'Hay archivos que no se pueden reconstruir' : r.degradados.length || r.copiasDanadas || r.copiasAusentes ? 'Auditoría terminada: hay copias que reparar' : 'Auditoría terminada: todo íntegro', r.irrecuperables.length ? 'error' : 'ok');
    } catch (e) { avisar(e.message, 'error'); }
    establecerTarea(null);
  };
  const ejecutarReparacion = async () => {
    establecerTarea('reparar');
    try {
      const r = await reparar(cuenta, cuenta.nodosCaidos);
      avisar(r.restauradas ? `${r.restauradas} ${r.restauradas === 1 ? 'copia restaurada' : 'copias restauradas'}${r.sinFuente ? `; ${r.sinFuente} sin copia sana de la que partir` : ''}` : r.sinFuente ? 'No queda ninguna copia sana de esos fragmentos' : 'No había nada que reparar', r.sinFuente && !r.restauradas ? 'error' : 'ok');
      await refrescar(); establecerInforme(await auditar(cuenta, cuenta.nodosCaidos));
    } catch (e) { avisar(e.message, 'error'); }
    establecerTarea(null);
  };
  const vaciar = async (n) => {
    const borrados = await vaciarNodo(cuenta, n);
    establecerPorVaciar(null); await refrescar();
    avisar(`${NOMBRES_NODO[n]} ha perdido ${borrados} ${borrados === 1 ? 'fragmento' : 'fragmentos'}. Audita y repara.`, 'info');
    establecerInforme(await auditar(cuenta, cuenta.nodosCaidos));
  };
  const corromper = async (n) => {
    const hecho = await corromperFragmento(cuenta, n);
    avisar(hecho ? `Un fragmento de ${NOMBRES_NODO[n]} tiene ahora un byte alterado. La auditoría lo detectará.` : 'Ese nodo no guarda fragmentos', hecho ? 'info' : 'error');
  };

  const maximo = Math.max(1, ...nodos.map((n) => n.bytes));
  const activos = cuenta.nodos - cuenta.nodosCaidos.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="placa p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="font-heading text-hueso text-2xl font-medium">{activos} de {cuenta.nodos} nodos conectados</h2>
          <p className="text-sm text-slate-400 mt-2">
            Desconecta un nodo, vacía su disco o corrompe un fragmento y comprueba que tus archivos siguen abriéndose.
            Con {cuenta.copias} {cuenta.copias === 1 ? 'copia' : 'copias'} por fragmento, la bóveda tolera {cuenta.copias - 1 === 0 ? 'cero fallos' : `${cuenta.copias - 1} ${cuenta.copias - 1 === 1 ? 'nodo caído' : 'nodos caídos'} a la vez`}.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="boton boton-sec" disabled={!!tarea} onClick={() => ejecutarAuditoria()}>{tarea === 'auditar' ? <LoaderCircle size={16} className="gira" /> : <Activity size={16} />} Auditar integridad</button>
          <button className="boton boton-pri" disabled={!!tarea} onClick={ejecutarReparacion}>{tarea === 'reparar' ? <LoaderCircle size={16} className="gira" /> : <Wrench size={16} />} Reparar copias</button>
        </div>
      </div>

      {informe && (
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 entra" aria-live="polite">
          {[['Copias verificadas', informe.copiasRevisadas, 'chip-ok'], ['Copias dañadas', informe.copiasDanadas, informe.copiasDanadas ? 'chip-mal' : 'chip-ok'],
            ['Copias ausentes', informe.copiasAusentes, informe.copiasAusentes ? 'chip-aviso' : 'chip-ok'],
            ['Archivos irrecuperables', informe.irrecuperables.length, informe.irrecuperables.length ? 'chip-mal' : 'chip-ok']].map(([k, v, c]) => (
            <div key={k} className="placa !rounded-md p-5">
              <dd className="font-heading text-3xl font-medium text-hueso">{v}</dd>
              <dt className="mt-2"><span className={`chip ${c}`}>{k}</span></dt>
            </div>
          ))}
        </dl>
      )}

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodos.map((n) => {
          const caido = cuenta.nodosCaidos.includes(n.id);
          return (
            <li key={n.id} className={`placa !rounded-md p-5 transition-opacity ${caido ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-hueso font-medium flex items-center gap-2"><span className={`w-2 h-2 rounded-sm ${caido ? 'bg-alerta' : 'bg-ok'}`} />{NOMBRES_NODO[n.id]}</p>
                  <p className="mono text-[11px] text-slate-500 mt-0.5">nodo {n.id + 1} · {caido ? 'desconectado' : 'en línea'}</p>
                </div>
                <button role="switch" aria-checked={!caido} aria-label={`${caido ? 'Conectar' : 'Desconectar'} ${NOMBRES_NODO[n.id]}`} className="interruptor" onClick={() => alternarNodo(n.id)} />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <p className="font-heading text-3xl font-medium text-hueso">{n.fragmentos}<span className="text-sm font-semibold text-slate-400 ml-2">fragmentos</span></p>
                <p className="mono text-xs text-slate-400">{tamano(n.bytes)}</p>
              </div>
              <div className="mt-3 h-1.5 rounded-sm bg-white/8 overflow-hidden"><div className="h-full rounded-sm bg-laton transition-[width] duration-500" style={{ width: `${(n.bytes / maximo) * 100}%` }} /></div>
              {porVaciar === n.id ? (
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className="text-slate-300 flex-1">¿Borrar sus {n.fragmentos} fragmentos?</span>
                  <button className="boton boton-peligro boton-mini" onClick={() => vaciar(n.id)}>Vaciar</button>
                  <button className="boton boton-sec boton-mini" onClick={() => establecerPorVaciar(null)}>No</button>
                </div>
              ) : (
                <div className="mt-4 flex gap-2">
                  <button className="boton boton-sec boton-mini" disabled={!n.fragmentos} onClick={() => establecerPorVaciar(n.id)}><HardDrive size={13} /> Vaciar disco</button>
                  <button className="boton boton-sec boton-mini" disabled={!n.fragmentos} onClick={() => corromper(n.id)}><Bug size={13} /> Corromper</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-slate-500 max-w-2xl">En esta edición cada nodo es un almacén independiente dentro de IndexedDB, en tu navegador. Los fallos que provocas aquí borran o alteran datos reales de ese almacén.</p>
    </div>
  );
}
