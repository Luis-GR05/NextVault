import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, ShieldCheck, Zap, Snowflake } from 'lucide-react';
import { PERFILES } from '../lib/perfiles';

const ICONOS = { alfa: Lock, obsidian: ShieldCheck, gravity: Zap, cold: Snowflake };

export default function BovedasCatalogo() {
  const [activa, establecerActiva] = useState('alfa');
  const p = PERFILES[activa];
  const Icono = ICONOS[activa];

  return (
    <section id="perfiles" className="relative max-w-7xl mx-auto px-5 md:px-10 py-20 md:py-28">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <h2 className="titular max-w-2xl">Cuatro bóvedas, cuatro maneras de repartir el riesgo</h2>
        <p className="text-slate-400 max-w-sm">El perfil decide cuántos fragmentos se crean, cuántas copias se guardan y cuánto cuesta derivar tu clave.</p>
      </div>

      <div role="tablist" aria-label="Perfiles de bóveda" className="flex gap-2 overflow-x-auto sin-barra pb-2">
        {Object.values(PERFILES).map((x) => {
          const I = ICONOS[x.clave];
          return (
            <button key={x.clave} role="tab" aria-selected={activa === x.clave} onClick={() => establecerActiva(x.clave)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap border transition-all duration-300 ${
                activa === x.clave ? 'bg-white text-obsidian border-white' : 'border-white/12 text-slate-300 hover:border-white/40'}`}>
              <I size={16} /> {x.nombre}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activa} role="tabpanel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }} className="vidrio mt-6 p-7 md:p-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16">
          <div>
            <span className="w-14 h-14 rounded-2xl bg-neon-violet/12 border border-neon-violet/30 grid place-items-center text-neon-cyan"><Icono size={26} /></span>
            <h3 className="font-heading text-white text-4xl md:text-5xl font-extrabold tracking-tight mt-6">{p.nombre}</h3>
            <p className="text-neon-cyan font-semibold mt-1">{p.lema}</p>
            <p className="text-slate-300 mt-5 max-w-lg leading-relaxed">{p.descripcion}</p>
            <dl className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              {[['Fragmentos', p.fragmentos], ['Copias', p.copias], ['PBKDF2', `${p.iteraciones / 1000}k`]].map(([k, v]) => (
                <div key={k} className="border-l border-white/12 pl-4">
                  <dd className="font-heading text-3xl font-extrabold text-white">{v}</dd>
                  <dt className="text-xs text-slate-400 font-semibold mt-1">{k}</dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-center gap-6">
            {p.medidas.map(([etiqueta, valor]) => (
              <div key={etiqueta}>
                <div className="flex justify-between text-sm font-semibold mb-2"><span className="text-slate-300">{etiqueta}</span><span className="mono text-slate-400">{valor}</span></div>
                <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${valor}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink" />
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-500">Valores relativos entre perfiles, de 0 a 100.</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
