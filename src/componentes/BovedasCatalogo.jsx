import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Layers, Zap, ShieldAlert } from 'lucide-react';

const bovedasDatos = {
  alfa: {
    clave: 'alfa',
    titulo: 'Vault Alpha v4',
    subtitulo: 'Cifrado AES-256 de alto rendimiento',
    descripcion: 'Nuestra bóveda estándar avanzada de alto rendimiento. Utiliza algoritmos de cifrado simétrico AES-256-GCM con autenticación integrada. Diseñada con derivación de llaves robusta mediante PBKDF2, redundancia distribuida multipunto y protección activa contra ataques de fuerza bruta mediante módulos de hardware seguro (HSM).',
    icono: Lock,
    estadisticas: [
      { etiqueta: 'Robustez del Cifrado', valor: 95 },
      { etiqueta: 'Aislamiento y Privacidad', valor: 99 },
      { etiqueta: 'Velocidad de Recuperación', valor: 78 },
      { etiqueta: 'Resistencia Cuántica', valor: 25 }
    ]
  },
  obsidian: {
    clave: 'obsidian',
    titulo: 'Vault Obsidian Quantum',
    subtitulo: 'Cifrado resistente a la computación cuántica',
    descripcion: 'La solución de almacenamiento definitiva resistente al paso del tiempo. Integra criptografía post-cuántica (mecanismo de encapsulación de claves Kyber y firmas digitales Dilithium homologadas por el NIST), fragmentación (sharding) global de archivos cifrados y tolerancia a fallos bizantinos.',
    icono: ShieldAlert,
    estadisticas: [
      { etiqueta: 'Robustez del Cifrado', valor: 99 },
      { etiqueta: 'Aislamiento y Privacidad', valor: 99 },
      { etiqueta: 'Velocidad de Recuperación', valor: 65 },
      { etiqueta: 'Resistencia Cuántica', valor: 99 }
    ]
  },
  gravity: {
    clave: 'gravity',
    titulo: 'Vault Zero-Gravity',
    subtitulo: 'Sincronización instantánea de alta frecuencia',
    descripcion: 'Almacenamiento en caliente (hot storage) para transacciones de alta velocidad y sincronización en tiempo real. Cuenta con distribución de carga adaptativa en red perimetral, recuperación instantánea de archivos de gran volumen y ancho de banda dedicado ilimitado.',
    icono: Zap,
    estadisticas: [
      { etiqueta: 'Robustez del Cifrado', valor: 85 },
      { etiqueta: 'Aislamiento y Privacidad', valor: 90 },
      { etiqueta: 'Velocidad de Recuperación', valor: 99 },
      { etiqueta: 'Resistencia Cuántica', valor: 60 }
    ]
  },
  cold: {
    clave: 'cold',
    titulo: 'Vault Cold Armour',
    subtitulo: 'Archivo en frío ultra-aislado desconectado',
    descripcion: 'Blindaje físico absoluto para activos digitales pasivos críticos. Funciona en una infraestructura completamente aislada y desconectada de la red pública (Air-Gapped), requiriendo firmas criptográficas múltiples distribuidas (multi-sig) y autorización física por llave de hardware.',
    icono: Layers,
    estadisticas: [
      { etiqueta: 'Robustez del Cifrado', valor: 99 },
      { etiqueta: 'Aislamiento y Privacidad', valor: 99 },
      { etiqueta: 'Velocidad de Recuperación', valor: 30 },
      { etiqueta: 'Resistencia Cuántica', valor: 99 }
    ]
  }
};

export default function BovedasCatalogo() {
  const [bovedaActiva, establecerBovedaActiva] = useState('alfa');
  const contenedorRef = useRef(null);
  const [posicionBrillo, establecerPosicionBrillo] = useState({ x: 0, y: 0 });

  const manejarMovimientoRaton = (e) => {
    if (!contenedorRef.current) return;
    const rect = contenedorRef.current.getBoundingClientRect();
    establecerPosicionBrillo({
      x: e.clientX - rect.left - 125,
      y: e.clientY - rect.top - 125
    });
  };

  const boveda = bovedasDatos[bovedaActiva];

  return (
    <div className="relative w-full max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-12 z-10 flex flex-col gap-14">
      <div className="absolute w-[clamp(220px,35vw,480px)] h-[clamp(220px,35vw,480px)] rounded-full bg-neon-pink/5 top-[30%] left-[45%] blur-[120px] pointer-events-none animate-float-orb z-0 [animation-delay:-10s]" />

      <div>
        <span className="inline-block text-neon-cyan text-xs font-bold uppercase tracking-widest mb-2.5">
          Arquitectura de Seguridad
        </span>
        <h2 className="font-heading text-white text-3xl md:text-5xl font-bold tracking-tight">
          Contenedores de Bóveda Segura
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 w-full items-start">
        <div className="flex flex-col gap-5">
          {Object.values(bovedasDatos).map((item) => {
            const Icono = item.icono;
            const estaActiva = bovedaActiva === item.clave;
            return (
              <button
                key={item.clave}
                onClick={() => establecerBovedaActiva(item.clave)}
                className={`flex items-center gap-5 p-6 text-left rounded-2xl border transition-all duration-300 backdrop-blur-md cursor-pointer focus:outline-none ${
                  estaActiva
                    ? 'border-neon-violet bg-neon-violet/10 shadow-[0_0_25px_rgba(139,92,246,0.2)]'
                    : 'border-white/5 bg-elevated/30 hover:border-white/12 hover:bg-elevated/50'
                }`}
              >
                <span className={`p-3.5 rounded-xl transition-colors ${
                  estaActiva ? 'bg-neon-violet/20 text-neon-cyan' : 'bg-white/5 text-slate-400'
                }`}>
                  <Icono size={24} />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="font-heading font-extrabold text-white text-base leading-tight">
                    {item.titulo}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {item.subtitulo}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div
          ref={contenedorRef}
          onMouseMove={manejarMovimientoRaton}
          className="relative bg-elevated/35 border border-white/8 rounded-3xl p-10 md:p-14 flex flex-col justify-between overflow-hidden backdrop-blur-xl shadow-2xl min-h-[500px]"
        >
          <div
            className="absolute w-64 h-64 rounded-full blur-[90px] bg-neon-violet/12 pointer-events-none transition-all duration-300"
            style={{
              left: `${posicionBrillo.x}px`,
              top: `${posicionBrillo.y}px`
            }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={bovedaActiva}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 flex flex-col h-full justify-between gap-12"
            >
              <div>
                <h3 className="font-heading text-white text-2xl md:text-3xl font-extrabold mb-5">
                  {boveda.titulo}
                </h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
                  {boveda.descripcion}
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {boveda.estadisticas.map((stat, idx) => (
                  <div key={idx} className="flex flex-col gap-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                      <span>{stat.etiqueta}</span>
                      <span className="text-neon-cyan font-mono font-bold">{stat.valor}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-black/40 border border-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.valor}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-green rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
