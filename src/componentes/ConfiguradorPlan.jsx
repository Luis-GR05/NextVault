import React, { useState } from 'react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { ArrowRight, Server, ShieldCheck } from 'lucide-react';

const bovedasBases = [
  { clave: 'alfa', nombre: 'Vault Alpha v4', precio: 650 },
  { clave: 'obsidian', nombre: 'Vault Obsidian Quantum', precio: 420 },
  { clave: 'gravity', nombre: 'Vault Zero-Gravity', precio: 290 },
  { clave: 'cold', nombre: 'Vault Cold Armour', precio: 380 }
];

export default function ConfiguradorPlan() {
  const { configuracionBoveda, actualizarConfiguracion } = useSeguridad();
  const [nodos, establecerNodos] = useState(8);
  const [copias, establecerCopias] = useState(2);
  const [bovedaClave, establecerBovedaClave] = useState('alfa');
  const [correo, establecerCorreo] = useState('');
  const [exitoSubmit, establecerExitoSubmit] = useState(false);

  const bovedaActual = bovedasBases.find((b) => b.clave === bovedaClave) || bovedasBases[0];
  const totalEstimado = bovedaActual.precio + nodos * 5 + copias * 10;

  const enviarFormulario = (e) => {
    e.preventDefault();
    if (!correo) return;

    actualizarConfiguracion({
      nodos,
      copias,
      tipoBoveda: bovedaActual.nombre,
      precioBase: bovedaActual.precio
    });

    establecerExitoSubmit(true);
    establecerCorreo('');

    setTimeout(() => {
      establecerExitoSubmit(false);
    }, 3000);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-12 z-10 flex flex-col gap-14">
      <div className="absolute w-[clamp(220px,35vw,480px)] h-[clamp(220px,35vw,480px)] rounded-full bg-neon-pink/5 top-[40%] left-[30%] blur-[120px] pointer-events-none animate-float-orb z-0" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-14 w-full items-center">
        <div className="flex flex-col justify-center">
          <span className="inline-block text-neon-cyan text-xs font-bold uppercase tracking-widest mb-2.5">
            Configurador Personalizado
          </span>
          <h2 className="font-heading text-white text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Ajustar Recursos de Bóveda
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-10 max-w-xl font-medium">
            Configura el número de nodos de distribución de datos descentralizados, el número de copias espejo activas para redundancia física y procesa tu solicitud.
          </p>

          <form onSubmit={enviarFormulario} className="flex flex-col gap-8 max-w-xl">
            <div className="flex flex-col gap-4">
              <label htmlFor="rangoNodos" className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Nodos de Distribución (Sharding):</span>
                <span className="text-neon-cyan font-bold font-mono">{nodos} Nodos</span>
              </label>
              <input
                type="range"
                id="rangoNodos"
                min="1"
                max="16"
                value={nodos}
                onChange={(e) => establecerNodos(parseInt(e.target.value))}
                className="styled-range my-2"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label htmlFor="rangoCopias" className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Copias Espejo Activas (Redundancia):</span>
                <span className="text-neon-cyan font-bold font-mono">{copias} Copias</span>
              </label>
              <input
                type="range"
                id="rangoCopias"
                min="0"
                max="6"
                value={copias}
                onChange={(e) => establecerCopias(parseInt(e.target.value))}
                className="styled-range my-2"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="seleccionBase" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Seleccionar Bóveda Base
              </label>
              <select
                id="seleccionBase"
                value={bovedaClave}
                onChange={(e) => establecerBovedaClave(e.target.value)}
                className="w-full bg-elevated/60 border border-white/10 rounded-2xl px-5 py-4 text-slate-200 text-sm font-semibold focus:border-neon-cyan focus:outline-none transition-colors duration-200 cursor-pointer"
              >
                {bovedasBases.map((b) => (
                  <option key={b.clave} value={b.clave} className="bg-elevated text-slate-200 font-semibold">
                    {b.nombre} — {b.precio} USD
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <input
                type="email"
                placeholder="cliente@empresa.com"
                value={correo}
                onChange={(e) => establecerCorreo(e.target.value)}
                required
                className="flex-grow bg-elevated/60 border border-white/10 rounded-2xl px-5 py-4.5 text-slate-200 text-sm font-semibold focus:border-neon-cyan focus:outline-none transition-colors duration-200 placeholder-slate-500"
              />
              <button
                type="submit"
                className={`inline-flex items-center justify-center gap-2.5 px-9 py-4.5 rounded-2xl text-white font-extrabold text-sm transition-all duration-300 cursor-pointer border-none whitespace-nowrap ${
                  exitoSubmit
                    ? 'bg-gradient-to-r from-neon-green to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    : 'bg-gradient-to-r from-neon-violet to-neon-pink shadow-[0_4px_25px_rgba(139,92,246,0.3)] hover:scale-[1.02]'
                }`}
              >
                {exitoSubmit ? '✓ Bóveda Creada' : 'Crear Bóveda Encriptada'}
                {!exitoSubmit && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center w-full">
          <div className="w-full bg-elevated/35 border border-white/8 rounded-3xl p-10 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between h-[400px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3.5">
                TOTAL ESTIMADO DEL PLAN / MENSUAL
              </div>
              <div className="font-heading font-extrabold text-white text-4xl md:text-5xl tracking-tight mb-5 font-mono">
                {totalEstimado.toFixed(2)} <span className="text-xl text-slate-400 font-semibold font-body">USD</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Incluye auditorías de seguridad semanales, sincronización cuántica en la red de nodos NextVault y soporte especializado 24/7.
              </p>
            </div>

            <div className="border-t border-white/8 pt-6 flex flex-col gap-4">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400 flex items-center gap-2"><Server size={14} /> Distribución:</span>
                <span className="font-mono text-neon-cyan font-bold">{nodos} Nodos</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400 flex items-center gap-2"><ShieldCheck size={14} /> Redundancia:</span>
                <span className="font-mono text-neon-cyan font-bold">{copias} Copias</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400">Bóveda Base:</span>
                <span className="font-extrabold text-white">{bovedaActual.nombre}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
