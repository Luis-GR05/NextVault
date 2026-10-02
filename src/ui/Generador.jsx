import { useMemo, useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { generarContrasena, entropiaBits, tiempoFuerzaBruta, nivelDeBits } from '../lib/cripto';

const JUEGOS = [['minusculas', 'abc'], ['mayusculas', 'ABC'], ['numeros', '123'], ['simbolos', '#$&']];

/** Generador reutilizable. `alUsar` aparece como botón cuando se integra en un formulario. */
export function Generador({ alUsar, compacto = false }) {
  const [longitud, establecerLongitud] = useState(20);
  const [op, establecerOp] = useState({ minusculas: true, mayusculas: true, numeros: true, simbolos: true });
  const [tirada, establecerTirada] = useState(0);
  const [copiado, establecerCopiado] = useState(false);

  // Se genera una contraseña nueva cada vez que cambian las opciones o se pide otra tirada.
  const valor = useMemo(() => generarContrasena(longitud, op, tirada), [longitud, op, tirada]);
  const generar = () => { establecerTirada((t) => t + 1); establecerCopiado(false); };

  const bits = entropiaBits(longitud, op);
  const nivel = nivelDeBits(bits);
  const activos = Object.values(op).filter(Boolean).length;

  const copiar = async () => {
    try { await navigator.clipboard.writeText(valor); establecerCopiado(true); setTimeout(() => establecerCopiado(false), 1800); } catch { /* portapapeles no disponible */ }
  };

  return (
    <div className={compacto ? 'flex flex-col gap-4' : 'placa p-6 md:p-9 flex flex-col gap-6'}>
      <div className="flex items-stretch gap-2">
        <output className={`mono flex-1 min-w-0 bg-black/50 border border-white/10 rounded-md px-4 ${compacto ? 'py-3 text-sm' : 'py-5 text-[clamp(1rem,2.4vw,1.5rem)]'} text-laton break-all select-all`} aria-label="Contraseña generada">
          {valor || '—'}
        </output>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={generar} className="icono-btn border border-white/10 flex-1" aria-label="Generar otra"><RefreshCw size={16} /></button>
          <button type="button" onClick={copiar} className="icono-btn border border-white/10 flex-1" aria-label="Copiar">{copiado ? <Check size={16} className="text-ok" /> : <Copy size={16} />}</button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label htmlFor={compacto ? 'gen-long-c' : 'gen-long'} className="etiqueta !mb-0">Longitud</label>
          <span className="mono text-sm text-hueso font-medium">{longitud} caracteres</span>
        </div>
        <input id={compacto ? 'gen-long-c' : 'gen-long'} type="range" min="8" max="64" value={longitud} onChange={(e) => establecerLongitud(Number(e.target.value))} className="rango" />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Tipos de carácter">
        {JUEGOS.map(([k, muestra]) => (
          <button key={k} type="button" aria-pressed={op[k]} disabled={op[k] && activos === 1}
            onClick={() => establecerOp((o) => ({ ...o, [k]: !o[k] }))}
            className={`mono px-4 py-2 rounded-sm text-sm font-medium border transition-colors ${op[k] ? 'bg-laton/20 border-laton/60 text-hueso' : 'border-white/12 text-slate-500'}`}>
            {muestra}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/8">
        <div className="flex items-center gap-3">
          <span className={`chip ${nivel.clase}`}>{nivel.texto}</span>
          <span className="text-sm text-slate-400"><strong className="text-hueso mono">{bits}</strong> bits de entropía</span>
        </div>
        {alUsar
          ? <button type="button" onClick={() => alUsar(valor)} className="boton boton-pri boton-mini">Usar esta</button>
          : <span className="text-sm text-slate-400">Fuerza bruta: <strong className="text-slate-200">{tiempoFuerzaBruta(bits)}</strong></span>}
      </div>
    </div>
  );
}

