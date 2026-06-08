import React, { useState } from 'react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { HardDrive, Server, Key, Eye, EyeOff, ShieldCheck, AlertTriangle, Trash2, FileText } from 'lucide-react';
import SimuladorFragmentacion from './SimuladorFragmentacion';

export default function PanelPrincipal({ irAGeneradorLlave }) {
  const { usuario, llaveMaestra, archivosBoveda, eliminarArchivo, configuracionBoveda } = useSeguridad();
  const [ocultarLlave, establecerOcultarLlave] = useState(true);

  const totalCapacidad = 50.00;
  const tamanoArchivosSubidos = archivosBoveda.reduce((acc, curr) => acc + curr.tamanoReal, 0) / (1024 * 1024 * 1024);
  const almacenamientoUsado = 12.8 + tamanoArchivosSubidos;
  const porcentajeUso = (almacenamientoUsado / totalCapacidad) * 100;

  return (
    <div className="w-full min-h-screen bg-obsidian py-32 px-8 md:px-16 lg:px-24 max-w-7xl mx-auto z-10 relative flex flex-col gap-12">
      <div className="absolute w-[clamp(250px,40vw,550px)] h-[clamp(250px,40vw,550px)] rounded-full bg-neon-violet/5 -top-[10%] left-[10%] blur-[120px] pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/8 pb-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-white text-3xl md:text-4xl font-extrabold tracking-tight">
            Panel de Seguridad Descentralizado
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            Sesión activa para: <span className="text-neon-cyan font-bold font-mono">{usuario?.correo}</span>
          </p>
        </div>
        
        {llaveMaestra ? (
          <div className="flex items-center gap-2.5 px-6 py-3.5 bg-neon-green/10 border border-neon-green/20 rounded-full text-xs text-neon-green font-extrabold uppercase tracking-widest backdrop-blur-md shadow-md">
            <ShieldCheck size={16} />
            Protección Cuántica Activa
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-6 py-3.5 bg-neon-pink/10 border border-neon-pink/20 rounded-full text-xs text-neon-pink font-extrabold uppercase tracking-widest backdrop-blur-md shadow-md">
            <AlertTriangle size={16} />
            Vulnerabilidad: Llave Requerida
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-elevated/35 border border-white/8 rounded-2xl p-8 flex items-center gap-6 backdrop-blur-md transition-all hover:scale-[1.01] hover:border-white/12">
          <span className="w-14 h-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan shadow-md">
            <HardDrive size={24} />
          </span>
          <div className="flex flex-col flex-grow gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Espacio de Almacenamiento</span>
            <span className="font-heading text-xl font-bold text-white font-mono mt-0.5">
              {almacenamientoUsado.toFixed(2)} / {totalCapacidad} <span className="text-sm font-body font-semibold text-slate-400">GB</span>
            </span>
            <div className="w-full h-1.5 bg-black/40 border border-white/5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded-full transition-all duration-500"
                style={{ width: `${porcentajeUso}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-elevated/35 border border-white/8 rounded-2xl p-8 flex items-center gap-6 backdrop-blur-md transition-all hover:scale-[1.01] hover:border-white/12">
          <span className="w-14 h-14 rounded-2xl bg-neon-violet/10 border border-neon-violet/20 flex items-center justify-center text-neon-violet shadow-md">
            <Server size={24} />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Distribución de Red</span>
            <span className="font-heading text-xl font-bold text-white font-mono mt-0.5">
              {configuracionBoveda.nodos} Nodos / {configuracionBoveda.copias} Espejos
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
              Base: {configuracionBoveda.tipoBoveda}
            </span>
          </div>
        </div>

        <div className="bg-elevated/35 border border-white/8 rounded-2xl p-8 flex flex-col justify-center gap-2.5 backdrop-blur-md transition-all hover:scale-[1.01] hover:border-white/12 relative overflow-hidden">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Llave Maestra Criptográfica</span>
          {llaveMaestra ? (
            <div className="flex items-center justify-between gap-3 bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 mt-0.5">
              <span className="font-mono text-xs tracking-widest text-neon-cyan select-all">
                {ocultarLlave ? '••••-••••-••••-••••' : llaveMaestra}
              </span>
              <button
                onClick={() => establecerOcultarLlave(!ocultarLlave)}
                className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer focus:outline-none transition-colors duration-200"
              >
                {ocultarLlave ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          ) : (
            <button
              onClick={irAGeneradorLlave}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neon-pink/10 hover:bg-neon-pink/15 border border-neon-pink/20 text-neon-pink text-xs font-extrabold uppercase tracking-widest cursor-pointer transition-colors duration-200 shadow-md"
            >
              <Key size={14} />
              Generar Llave Maestra
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10 w-full items-start">
        <div className="bg-elevated/35 border border-white/8 rounded-3xl p-8 md:p-10 backdrop-blur-xl flex flex-col h-[560px] shadow-2xl">
          <h3 className="font-heading text-white text-lg font-bold mb-6 flex items-center gap-2.5 border-b border-white/5 pb-4">
            <FileText size={20} className="text-neon-cyan" />
            Bóveda de Archivos
          </h3>

          <div className="flex-grow overflow-y-auto scrollbar-none pr-1">
            {archivosBoveda.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <span className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mb-5 border border-white/5 shadow-inner">
                  <FileText size={28} />
                </span>
                <h4 className="text-sm font-bold text-white mb-2">No hay archivos en la bóveda</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-medium">
                  Carga un archivo en el simulador lateral para iniciar el proceso de fragmentación y distribución cuántica.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {archivosBoveda.map((archivo) => (
                  <div
                    key={archivo.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-black/25 border border-white/5 rounded-2xl gap-4 transition-all hover:border-white/12"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-neon-cyan border border-white/5 animate-pulse">
                        <FileText size={20} />
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white max-w-[200px] md:max-w-[280px] truncate">
                          {archivo.nombre}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">
                          {archivo.tamano} • Clave: <span className="text-neon-violet">{archivo.llaveCriptografica}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                          archivo.estado === 'resguardado'
                            ? 'bg-neon-green/10 text-neon-green border border-neon-green/20 shadow-sm'
                            : 'bg-neon-pink/15 text-neon-pink border border-neon-pink/20 shadow-sm'
                        }`}>
                          {archivo.estado}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                          Nodos: {archivo.nodosAsignados.join(', ')}
                        </span>
                      </div>

                      <button
                        onClick={() => eliminarArchivo(archivo.id)}
                        className="p-2.5 rounded-xl bg-transparent hover:bg-neon-pink/10 text-slate-400 hover:text-neon-pink border-none cursor-pointer focus:outline-none transition-colors duration-200"
                        aria-label="Eliminar archivo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-elevated/35 border border-white/8 rounded-3xl p-8 backdrop-blur-xl h-[560px] shadow-2xl">
          <SimuladorFragmentacion />
        </div>
      </div>
    </div>
  );
}
