import { useRef, useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { contrasenaDesdeEntropia, entropiaBits, tiempoFuerzaBruta, nivelDeBits } from '../lib/cripto';

const OBJETIVO = 160; // muestras de movimiento
const JUEGOS = [['minusculas', 'abc'], ['mayusculas', 'ABC'], ['numeros', '123'], ['simbolos', '#$&']];

/** Generador de entropía: el movimiento del puntero se mezcla con el generador criptográfico del sistema. */
export default function Entropia() {
  const [muestras, establecerMuestras] = useState([]);
  const [longitud, establecerLongitud] = useState(24);
  const [op, establecerOp] = useState({ minusculas: true, mayusculas: true, numeros: true, simbolos: true });
  const [llave, establecerLlave] = useState('');
  const [copiado, establecerCopiado] = useState(false);
  const lienzo = useRef(null);
  const ultimo = useRef(null);
  const generando = useRef(false);

  const completo = muestras.length >= OBJETIVO;
  const progreso = Math.min(1, muestras.length / OBJETIVO);
  const bits = entropiaBits(longitud, op);
  const nivel = nivelDeBits(bits);
  const activos = Object.values(op).filter(Boolean).length;

  const generar = async (m, l = longitud, o = op) => {
    if (generando.current) return; generando.current = true;
    establecerLlave(await contrasenaDesdeEntropia(m, l, o)); establecerCopiado(false);
    generando.current = false;
  };
  const alMover = (e) => {
    if (completo) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - r.left), y = Math.round(e.clientY - r.top);
    if (ultimo.current && Math.hypot(x - ultimo.current.x, y - ultimo.current.y) < 6) return;
    const ctx = lienzo.current.getContext('2d');
    if (lienzo.current.width !== r.width) { lienzo.current.width = r.width; lienzo.current.height = r.height; }
    ctx.strokeStyle = '#c9a45a'; ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
    if (ultimo.current) { ctx.beginPath(); ctx.moveTo(ultimo.current.x, ultimo.current.y); ctx.lineTo(x, y); ctx.stroke(); }
    ultimo.current = { x, y };
    const nuevas = [...muestras, x, y, Math.round(performance.now() * 1000) % 100000];
    establecerMuestras(nuevas);
    if (nuevas.length >= OBJETIVO) generar(nuevas);
  };
  const reiniciar = () => {
    establecerMuestras([]); establecerLlave(''); ultimo.current = null;
    const c = lienzo.current; c.getContext('2d').clearRect(0, 0, c.width, c.height);
  };
  const cambiar = (l, o) => { establecerLongitud(l); establecerOp(o); if (completo) generar(muestras, l, o); };
  const copiar = async () => { try { await navigator.clipboard.writeText(llave); establecerCopiado(true); setTimeout(() => establecerCopiado(false), 1800); } catch { /* sin portapapeles */ } };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 lg:gap-16 max-w-[1180px]">
      <div>
        <h2 className="titular sube">Tu mano también es azar</h2>
        <p className="entrada sube mt-6" style={{ '--n': 1 }}>
          Mueve el puntero o el dedo sobre la placa. Tu trazo se mezcla con el generador criptográfico del sistema y de
          ahí sale una llave que nadie puede repetir.
        </p>
        <div className="sube mt-8 grid gap-6 max-w-[420px]" style={{ '--n': 2 }}>
          <div>
            <div className="flex justify-between mb-3"><label htmlFor="ent-long" className="etiqueta !mb-0">Longitud</label><span className="mono text-sm">{longitud} caracteres</span></div>
            <input id="ent-long" type="range" min="12" max="64" value={longitud} onChange={(e) => cambiar(Number(e.target.value), op)} className="rango" />
          </div>
          <div className="flex gap-2" role="group" aria-label="Tipos de carácter">
            {JUEGOS.map(([k, muestra]) => (
              <button key={k} type="button" aria-pressed={op[k]} disabled={op[k] && activos === 1} onClick={() => cambiar(longitud, { ...op, [k]: !op[k] })}
                className={`mono px-3.5 py-2 text-sm border transition-colors ${op[k] ? 'border-laton text-laton' : 'border-[var(--linea)] text-niebla'}`}>{muestra}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="sube" style={{ '--n': 3 }}>
        <div className="placa relative aspect-[16/9] min-h-[220px] overflow-hidden touch-none sin-gesto cursor-crosshair" onPointerMove={alMover}>
          <canvas ref={lienzo} className="absolute inset-0 w-full h-full" aria-hidden="true" />
          <div className="absolute inset-0 grid place-items-center text-center p-6 pointer-events-none">
            {completo ? (
              <output className="mono text-[clamp(1rem,2.2vw,1.45rem)] text-hueso break-all bg-carbon/85 px-4 py-3 pointer-events-auto select-all" aria-label="Llave generada">{llave || '…'}</output>
            ) : (
              <p className="text-niebla">{muestras.length ? 'Sigue moviendo' : 'Mueve el puntero por aquí'}</p>
            )}
          </div>
          <div className="absolute left-0 bottom-0 h-[3px] bg-laton transition-[width] duration-150" style={{ width: `${progreso * 100}%` }} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <p className="dato" aria-live="polite">{completo ? <>Entropía <span className="text-hueso">{bits} bits</span> · <span className={`chip ${nivel.clase}`}>{nivel.texto}</span> · fuerza bruta: {tiempoFuerzaBruta(bits)}</> : `Capturando ${Math.round(progreso * 100)} %`}</p>
          <div className="flex gap-2">
            <button className="boton boton-sec boton-mini" onClick={reiniciar} disabled={!muestras.length}><RotateCcw size={14} /> Otra captura</button>
            <button className="boton boton-pri boton-mini" onClick={copiar} disabled={!llave}>{copiado ? <Check size={14} /> : <Copy size={14} />} {copiado ? 'Copiada' : 'Copiar llave'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
