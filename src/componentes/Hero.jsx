import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, Lock } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { aHex, cifrar, generarClaveDatos } from '../lib/cripto';

const te = new TextEncoder();
const COLORES = ['text-neon-cyan', 'text-neon-violet', 'text-neon-pink', 'text-neon-green'];
const FONDOS = ['bg-neon-cyan', 'bg-neon-violet', 'bg-neon-pink', 'bg-neon-green'];

/** Demostración real: lo que escribes se cifra con AES-256-GCM y se parte en cuatro fragmentos al vuelo. */
function CifradoEnVivo() {
  const [texto, establecerTexto] = useState('La combinación de la caja es 48-15-16');
  const [salida, establecerSalida] = useState({ iv: '', fragmentos: [] });
  const clave = useRef(null);

  useEffect(() => {
    let vigente = true;
    (async () => {
      if (!clave.current) clave.current = await generarClaveDatos();
      const { iv, cifrado } = await cifrar(clave.current, te.encode(texto));
      if (!vigente) return;
      const hex = aHex(cifrado);
      const paso = Math.ceil(hex.length / 4 / 2) * 2;
      establecerSalida({ iv: aHex(iv), fragmentos: [0, 1, 2, 3].map((i) => hex.slice(i * paso, (i + 1) * paso)).filter(Boolean) });
    })();
    return () => { vigente = false; };
  }, [texto]);

  return (
    <div className="vidrio p-6 md:p-7 w-full shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
      <label htmlFor="demo-texto" className="etiqueta">Escribe algo. Se cifra aquí mismo, mientras tecleas.</label>
      <input id="demo-texto" className="campo" value={texto} maxLength={80} onChange={(e) => establecerTexto(e.target.value)} autoComplete="off" spellCheck={false} />

      <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 font-semibold">
        <Lock size={13} className="text-neon-cyan" /> AES-256-GCM
        <span className="mono text-slate-500 truncate">iv {salida.iv}</span>
      </div>
      <p className="mono mt-2 text-[13px] leading-relaxed break-all min-h-[88px]" aria-label="Texto cifrado en hexadecimal">
        {salida.fragmentos.map((f, i) => <span key={i} className={COLORES[i]}>{f}</span>)}
      </p>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-white/8 bg-black/30 px-3 py-2.5">
            <span className={`block w-full h-1 rounded-full ${FONDOS[i]} ${salida.fragmentos[i] ? 'opacity-90' : 'opacity-15'}`} />
            <span className="block mt-2 text-[11px] font-semibold text-slate-300">Fragmento {i + 1}</span>
            <span className="block mono text-[10px] text-slate-500">{salida.fragmentos[i] ? `${salida.fragmentos[i].length / 2} B` : 'vacío'}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">Cada fragmento va a un nodo distinto. Por separado no dicen nada; sin tu clave, juntos tampoco.</p>
    </div>
  );
}

export default function Hero({ abrirAcceso, irAlPanel }) {
  const { cuenta, abierta } = useSeguridad();
  return (
    <section id="inicio" className="relative max-w-7xl mx-auto px-5 md:px-10 pt-[120px] md:pt-[150px] pb-20 md:pb-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center min-h-[92vh]">
      <div className="orbe w-[520px] h-[520px] bg-neon-violet/15 -top-20 -right-40" />
      <div className="orbe w-[420px] h-[420px] bg-neon-cyan/10 bottom-0 -left-40 [animation-delay:-6s]" />

      <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="relative flex flex-col items-start gap-7">
        <span className="inline-flex items-center gap-2.5 bg-elevated/80 border border-white/10 px-4 py-2 rounded-full text-xs font-semibold text-neon-cyan backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-neon-cyan pulso" />
          Conocimiento cero: la clave nunca sale de tu navegador
        </span>
        <h1 className="font-heading font-extrabold text-white text-[clamp(2.8rem,7.4vw,5.6rem)] leading-[0.98] tracking-[-0.04em]">
          Lo que guardas aquí <span className="degradado">solo lo abres tú</span>
        </h1>
        <p className="text-[clamp(1.05rem,1.6vw,1.25rem)] text-slate-300 max-w-xl leading-relaxed">
          NextVault cifra tus archivos y contraseñas en el propio dispositivo, los parte en fragmentos y guarda cada
          fragmento por duplicado en nodos distintos. Si un nodo cae, la bóveda se reconstruye sola.
        </p>
        <div className="flex gap-4 flex-wrap">
          {abierta ? (
            <button onClick={irAlPanel} className="boton boton-pri">Abrir mi bóveda <ArrowRight size={16} /></button>
          ) : cuenta ? (
            <button onClick={() => abrirAcceso('desbloquear')} className="boton boton-pri">Desbloquear bóveda <Lock size={16} /></button>
          ) : (
            <button onClick={() => abrirAcceso('registro')} className="boton boton-pri">Crear mi bóveda <ArrowRight size={16} /></button>
          )}
          <a href="#generador" className="boton boton-sec">Generar una contraseña <KeyRound size={16} /></a>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 48, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} className="relative">
        <CifradoEnVivo />
      </motion.div>
    </section>
  );
}
