import { useRef, useState } from 'react';
import { UploadCloud, LoaderCircle } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { PERFILES } from '../lib/perfiles';
import { LIMITE_ARCHIVO } from '../lib/boveda';

const FASES = { leyendo: 'Leyendo el archivo', comprimiendo: 'Comprimiendo', cifrando: 'Cifrando con AES-256-GCM', fragmentando: 'Fragmentando', repartiendo: 'Repartiendo entre nodos', listo: 'Guardado' };

/** Zona de subida: cifra, fragmenta y reparte cada archivo de verdad, mostrando la etapa en curso. */
export default function SimuladorFragmentacion() {
  const { cuenta, subirArchivo, avisar } = useSeguridad();
  const [encima, establecerEncima] = useState(false);
  const [cola, establecerCola] = useState(null); // { nombre, fase, progreso, detalle, indice, total }
  const entrada = useRef(null);
  const perfil = PERFILES[cuenta.perfil];

  const procesar = async (lista) => {
    const archivos = [...lista];
    if (!archivos.length || cola) return;
    let bien = 0;
    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      try {
        establecerCola({ nombre: archivo.name, fase: 'leyendo', progreso: 0, indice: i + 1, total: archivos.length });
        await subirArchivo(archivo, (p) => establecerCola((c) => ({ ...c, ...p })));
        bien++;
      } catch (e) {
        avisar(`${archivo.name}: ${e.name === 'QuotaExceededError' ? 'no queda espacio en el navegador.' : e.message}`, 'error');
      }
    }
    establecerCola(null);
    if (bien) avisar(bien === 1 ? 'Archivo cifrado y repartido' : `${bien} archivos cifrados y repartidos`);
    if (entrada.current) entrada.current.value = '';
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); establecerEncima(true); }}
      onDragLeave={() => establecerEncima(false)}
      onDrop={(e) => { e.preventDefault(); establecerEncima(false); procesar(e.dataTransfer.files); }}
      className={`rounded-3xl border-2 border-dashed transition-colors duration-200 p-6 md:p-8 ${encima ? 'border-neon-cyan bg-neon-cyan/8' : 'border-white/12 bg-black/20'}`}>
      {cola ? (
        <div aria-live="polite">
          <div className="flex items-center gap-3 text-white font-semibold">
            <LoaderCircle size={18} className="gira text-neon-cyan flex-none" />
            <span className="truncate">{cola.nombre}</span>
            {cola.total > 1 && <span className="mono text-xs text-slate-400 flex-none">{cola.indice}/{cola.total}</span>}
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink transition-[width] duration-300" style={{ width: `${Math.round(cola.progreso * 100)}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-400">{FASES[cola.fase]}{cola.detalle ? ` ${cola.detalle}` : ''}…</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <span className="w-14 h-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/25 grid place-items-center text-neon-cyan flex-none"><UploadCloud size={26} /></span>
          <div className="flex-1">
            <p className="text-white font-semibold">Suelta archivos aquí para cifrarlos</p>
            <p className="text-sm text-slate-400 mt-1">
              Perfil {perfil.nombre}: {perfil.fragmentos} fragmentos, {cuenta.copias} {cuenta.copias === 1 ? 'copia' : 'copias'} de cada uno en {cuenta.nodos} nodos. Hasta {LIMITE_ARCHIVO / 1024 / 1024} MB por archivo.
            </p>
          </div>
          <button type="button" onClick={() => entrada.current?.click()} className="boton boton-pri">Elegir archivos</button>
          <input ref={entrada} type="file" multiple className="sr-only" aria-label="Elegir archivos para cifrar" onChange={(e) => procesar(e.target.files)} />
        </div>
      )}
    </div>
  );
}
