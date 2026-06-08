import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Key } from 'lucide-react';

export default function Hero({ irASeccion }) {
  return (
    <div className="relative w-full max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-12 z-10">
      <div className="absolute w-[clamp(250px,40vw,550px)] h-[clamp(250px,40vw,550px)] rounded-full bg-neon-violet/10 -top-[10%] -right-[10%] blur-[120px] pointer-events-none animate-float-orb z-0" />
      <div className="absolute w-[clamp(200px,30vw,450px)] h-[clamp(200px,30vw,450px)] rounded-full bg-neon-cyan/10 -bottom-[10%] -left-[10%] blur-[120px] pointer-events-none animate-float-orb z-0 [animation-delay:-5s]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-start gap-10 max-w-4xl"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2.5 bg-elevated/80 border border-white/10 px-6 py-3 rounded-full text-xs font-bold text-neon-cyan tracking-wider uppercase backdrop-blur-md shadow-lg"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-[0_0_10px_#06b6d4] animate-core-pulse" />
          Red Principal Activa — Nodos Sincronizados
        </motion.span>

        <h1 className="font-heading font-extrabold text-[clamp(3rem,7vw,5rem)] leading-[1.05] tracking-tight text-white mt-2">
          Seguridad absoluta para tus{' '}
          <span className="bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink bg-clip-text text-transparent">
            activos digitales
          </span>
        </h1>

        <p className="text-[clamp(1.1rem,2vw,1.3rem)] text-slate-300 max-w-3xl font-medium leading-relaxed mt-2">
          Bóvedas encriptadas descentralizadas y almacenamiento de conocimiento cero. Fragmenta, distribuye y protege tus archivos sensibles contra amenazas cuánticas con control total de tus llaves.
        </p>

        <div className="flex gap-6 flex-wrap mt-6">
          <button
            onClick={() => irASeccion(1)}
            className="inline-flex items-center gap-2.5 px-9 py-4.5 rounded-full bg-gradient-to-r from-neon-violet to-neon-pink text-white font-extrabold text-sm shadow-[0_4px_25px_rgba(139,92,246,0.45)] hover:shadow-[0_8px_35px_rgba(139,92,246,0.65)] hover:-translate-y-0.5 transition-all duration-250 cursor-pointer border-none"
          >
            Explorar Bóvedas <ArrowRight size={16} />
          </button>
          <button
            onClick={() => irASeccion(3)}
            className="inline-flex items-center gap-2.5 px-9 py-4.5 rounded-full bg-transparent border-1.5 border-white/15 text-slate-200 font-extrabold text-sm hover:border-neon-cyan hover:bg-neon-cyan/5 transition-all duration-250 cursor-pointer"
          >
            Generar Llave <Key size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
