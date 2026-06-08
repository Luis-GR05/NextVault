import React, { useState, useEffect, useRef } from 'react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Cpu, Layers, Share2, CheckCircle } from 'lucide-react';

export default function SimuladorFragmentacion() {
  const { registrarArchivo, configuracionBoveda } = useSeguridad();
  const [fase, establecerFase] = useState('reposo');
  const [progreso, establecerProgreso] = useState(0);
  const [nombreArchivo, establecerNombreArchivo] = useState('');
  const [tamanoArchivo, establecerTamanoArchivo] = useState('');
  const [tamanoRealArchivo, establecerTamanoRealArchivo] = useState(0);
  const [hexCadena, establecerHexCadena] = useState('');

  const archivoInputRef = useRef(null);

  useEffect(() => {
    let intervaloHex;
    if (fase === 'encriptando') {
      intervaloHex = setInterval(() => {
        const caracteres = '0123456789ABCDEF';
        let resultado = '';
        for (let i = 0; i < 40; i++) {
          resultado += caracteres[Math.floor(Math.random() * 16)];
          if (i % 2 === 1 && i < 39) resultado += ' ';
        }
        establecerHexCadena(resultado);
      }, 80);
    } else {
      establecerHexCadena('');
    }
    return () => clearInterval(intervaloHex);
  }, [fase]);

  useEffect(() => {
    let temporizador;
    if (fase === 'encriptando') {
      establecerProgreso(0);
      temporizador = setTimeout(() => {
        establecerFase('fragmentando');
      }, 2000);
    } else if (fase === 'fragmentando') {
      establecerProgreso(33);
      temporizador = setTimeout(() => {
        establecerFase('distribuyendo');
      }, 2000);
    } else if (fase === 'distribuyendo') {
      establecerProgreso(66);
      temporizador = setTimeout(() => {
        establecerFase('completado');
        establecerProgreso(100);

        const hexChars = '0123456789ABCDEF';
        let claveCripto = 'CL-';
        for (let i = 0; i < 4; i++) {
          claveCripto += hexChars[Math.floor(Math.random() * 16)];
        }

        const nodosRed = [];
        const cantidadNodos = configuracionBoveda.nodos;
        while (nodosRed.length < Math.min(3, cantidadNodos)) {
          const num = Math.floor(Math.random() * cantidadNodos) + 1;
          if (!nodosRed.includes(num)) nodosRed.push(num);
        }
        if (nodosRed.length === 0) nodosRed.push(1);

        registrarArchivo({
          id: Date.now().toString(),
          nombre: nombreArchivo,
          tamano: tamanoArchivo,
          tamanoReal: tamanoRealArchivo,
          llaveCriptografica: claveCripto,
          nodosAsignados: nodosRed.sort((a, b) => a - b),
          estado: 'resguardado',
          fecha: new Date().toLocaleDateString('es-ES')
        });
      }, 2000);
    }
    return () => clearTimeout(temporizador);
  }, [fase]);

  const seleccionarArchivo = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    iniciarFragmentacion(archivo);
  };

  const iniciarFragmentacion = (archivo) => {
    establecerNombreArchivo(archivo.name);
    establecerTamanoRealArchivo(archivo.size);
    
    if (archivo.size > 1024 * 1024) {
      establecerTamanoArchivo((archivo.size / (1024 * 1024)).toFixed(1) + ' MB');
    } else {
      establecerTamanoArchivo((archivo.size / 1024).toFixed(0) + ' KB');
    }

    establecerFase('encriptando');
  };

  const arrastrarSobre = (e) => {
    e.preventDefault();
  };

  const soltarArchivo = (e) => {
    e.preventDefault();
    const archivo = e.dataTransfer.files?.[0];
    if (!archivo) return;
    iniciarFragmentacion(archivo);
  };

  const reiniciarSimulador = () => {
    establecerFase('reposo');
    establecerNombreArchivo('');
    establecerTamanoArchivo('');
    establecerTamanoRealArchivo(0);
    establecerProgreso(0);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="font-heading text-white text-lg font-bold mb-1">
          Simulador de Red Distribuida
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          Visualiza en tiempo real el sharding cuántico de tus activos
        </p>
      </div>

      <div className="flex-grow flex items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {fase === 'reposo' && (
            <motion.div
              key="reposo"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onDragOver={arrastrarSobre}
              onDrop={soltarArchivo}
              onClick={() => archivoInputRef.current?.click()}
              className="w-full h-52 border-2 border-dashed border-white/10 hover:border-neon-cyan/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-black/25 transition-all duration-300"
            >
              <input
                type="file"
                ref={archivoInputRef}
                onChange={seleccionarArchivo}
                className="hidden"
              />
              <span className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 mb-3 border border-white/5 shadow-md">
                <Upload size={22} />
              </span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                Fragmentación Descentralizada
              </h4>
              <p className="text-[10px] text-slate-400 max-w-xs leading-normal font-semibold">
                Arrastra un archivo aquí o haz clic para subir y simular el proceso de resguardo cuántico
              </p>
            </motion.div>
          )}

          {fase === 'encriptando' && (
            <motion.div
              key="encriptando"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-52 rounded-2xl flex flex-col items-center justify-center p-6 bg-black/40 border border-white/5 relative overflow-hidden"
            >
              <Cpu size={24} className="text-neon-pink animate-spin mb-3.5" />
              <h4 className="text-xs font-bold text-neon-pink uppercase tracking-wider mb-2.5">
                Fase 1: Encriptando Archivo
              </h4>
              <div className="font-mono text-[9px] text-neon-pink/70 w-full truncate text-center max-w-[280px] bg-black/50 border border-white/5 px-3 py-2 rounded-xl">
                {hexCadena}
              </div>
            </motion.div>
          )}

          {fase === 'fragmentando' && (
            <motion.div
              key="fragmentando"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-52 rounded-2xl flex flex-col items-center justify-center p-6 bg-black/40 border border-white/5 relative overflow-hidden"
            >
              <Layers size={24} className="text-neon-violet mb-3.5" />
              <h4 className="text-xs font-bold text-neon-violet uppercase tracking-wider mb-3.5">
                Fase 2: Sharding (Fragmentando)
              </h4>
              <div className="flex gap-2.5">
                {[1, 2, 3, 4, 5].map((bloque) => (
                  <motion.div
                    key={bloque}
                    initial={{ scale: 0.5, y: 12, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ delay: bloque * 0.15, duration: 0.4 }}
                    className={`w-7 h-7 rounded-lg shadow-lg border border-white/10 ${
                      bloque === 1
                        ? 'bg-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                        : bloque === 2
                        ? 'bg-neon-violet shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                        : bloque === 3
                        ? 'bg-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                        : bloque === 4
                        ? 'bg-neon-green shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                        : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {fase === 'distribuyendo' && (
            <motion.div
              key="distribuyendo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-52 rounded-2xl flex items-center justify-center p-6 bg-black/40 border border-white/5 relative overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Share2 size={24} className="text-neon-cyan animate-pulse z-10" />
              </div>
              <div className="w-full h-full flex justify-between items-center px-4 relative z-0">
                {[1, 2, 3].map((nodo) => (
                  <motion.div
                    key={nodo}
                    initial={{ scale: 0.8, x: 0, y: 0 }}
                    animate={{
                      scale: 1,
                      x: nodo === 1 ? -45 : nodo === 3 ? 45 : 0,
                      y: nodo === 2 ? -40 : 40
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                    className="w-5.5 h-5.5 rounded-full bg-neon-cyan/80 shadow-[0_0_12px_rgba(6,182,212,0.8)] border border-white/10"
                  />
                ))}
              </div>
              <div className="absolute bottom-4 text-[10px] font-bold text-neon-cyan uppercase tracking-widest">
                Fase 3: Distribuyendo en Nodos
              </div>
            </motion.div>
          )}

          {fase === 'completado' && (
            <motion.div
              key="completado"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-52 rounded-2xl flex flex-col items-center justify-center p-6 bg-black/40 border border-white/5 text-center gap-1"
            >
              <CheckCircle size={28} className="text-neon-green mb-2" />
              <h4 className="text-xs font-bold text-neon-green uppercase tracking-wider">
                Fase 4: Resguardo Exitoso
              </h4>
              <p className="text-[10px] text-slate-300 max-w-xs leading-normal font-semibold truncate w-full px-4 mb-2">
                {nombreArchivo} ({tamanoArchivo}) encriptado y almacenado.
              </p>
              <button
                onClick={reiniciarSimulador}
                className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-extrabold uppercase tracking-widest border border-white/10 cursor-pointer transition-colors duration-200"
              >
                Subir Otro
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span>Procesamiento</span>
          <span>{progreso}%</span>
        </div>
        <div className="w-full h-1.5 bg-black/40 border border-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-pink via-neon-violet to-neon-cyan rounded-full transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>
    </div>
  );
}
