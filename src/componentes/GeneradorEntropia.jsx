import React, { useState, useEffect, useRef } from 'react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { RefreshCw, Key } from 'lucide-react';

export default function GeneradorEntropia() {
  const { llaveMaestra, actualizarLlaveMaestra } = useSeguridad();
  const [sincronizando, establecerSincronizando] = useState(false);
  const [progresoEntropia, establecerProgresoEntropia] = useState(0);
  const [frecuencia, establecerFrecuencia] = useState(432);
  const [textoNucleo, establecerTextoNucleo] = useState('INICIAR CAPTURA');

  const contextoAudioRef = useRef(null);
  const oscilador1Ref = useRef(null);
  const oscilador2Ref = useRef(null);
  const filtroRef = useRef(null);
  const gananciaRef = useRef(null);
  const intervaloFrecuenciaRef = useRef(null);
  const intervaloRespaldoRef = useRef(null);

  const finalizarGeneracion = (forzar = false) => {
    establecerSincronizando(false);
    establecerTextoNucleo('INICIAR CAPTURA');

    if (intervaloFrecuenciaRef.current) {
      clearInterval(intervaloFrecuenciaRef.current);
      intervaloFrecuenciaRef.current = null;
    }
    if (intervaloRespaldoRef.current) {
      clearInterval(intervaloRespaldoRef.current);
      intervaloRespaldoRef.current = null;
    }

    if (oscilador1Ref.current) {
      try { oscilador1Ref.current.stop(); } catch (e) {}
      oscilador1Ref.current.disconnect();
      oscilador1Ref.current = null;
    }
    if (oscilador2Ref.current) {
      try { oscilador2Ref.current.stop(); } catch (e) {}
      oscilador2Ref.current.disconnect();
      oscilador2Ref.current = null;
    }

    if (forzar) {
      establecerProgresoEntropia(0);
      establecerTextoNucleo('CAPTURA CANCELADA');
      return;
    }

    const caracteresHex = '0123456789ABCDEF';
    let llaveSegura = 'NV-';
    for (let i = 0; i < 4; i++) {
      let segmento = '';
      for (let j = 0; j < 4; j++) {
        segmento += caracteresHex[Math.floor(Math.random() * 16)];
      }
      llaveSegura += segmento + (i < 3 ? '-' : '');
    }

    actualizarLlaveMaestra(llaveSegura);

    if (contextoAudioRef.current) {
      try {
        const ctx = contextoAudioRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const oscExito = ctx.createOscillator();
        const gananciaExito = ctx.createGain();

        oscExito.type = 'sine';
        oscExito.frequency.setValueAtTime(587.33, ctx.currentTime);
        oscExito.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15);

        gananciaExito.gain.setValueAtTime(0.04, ctx.currentTime);
        gananciaExito.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

        oscExito.connect(gananciaExito);
        gananciaExito.connect(ctx.destination);

        oscExito.start();
        oscExito.stop(ctx.currentTime + 0.6);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const recolectarEntropia = (e) => {
    establecerProgresoEntropia((anterior) => {
      const velocidad = Math.abs(e.movementX || 1) + Math.abs(e.movementY || 1);
      const siguiente = anterior + Math.min(velocidad * 0.15, 3.5);
      
      if (siguiente >= 100) {
        window.removeEventListener('mousemove', recolectarEntropia);
        setTimeout(() => {
          finalizarGeneracion(false);
        }, 50);
        return 100;
      }
      
      establecerTextoNucleo(`CAPTURANDO\n${Math.round(siguiente)}%`);
      return siguiente;
    });
  };

  const iniciarSincronizacion = () => {
    establecerSincronizando(true);
    establecerProgresoEntropia(0);
    establecerTextoNucleo('CAPTURANDO\n0%');

    if (!contextoAudioRef.current) {
      contextoAudioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const ctx = contextoAudioRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filtro = ctx.createBiquadFilter();
    const ganancia = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(100, ctx.currentTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(102, ctx.currentTime);

    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(250, ctx.currentTime);

    ganancia.gain.setValueAtTime(0.02, ctx.currentTime);

    osc1.connect(filtro);
    osc2.connect(filtro);
    filtro.connect(ganancia);
    ganancia.connect(ctx.destination);

    osc1.start();
    osc2.start();

    oscilador1Ref.current = osc1;
    oscilador2Ref.current = osc2;
    filtroRef.current = filtro;
    gananciaRef.current = ganancia;

    intervaloFrecuenciaRef.current = setInterval(() => {
      const freqObjetivo = 400 + Math.random() * 80;
      establecerFrecuencia(Math.floor(freqObjetivo));
      const freqFiltro = 300 + (freqObjetivo - 400) * 6;
      if (filtroRef.current) {
        filtroRef.current.frequency.setValueAtTime(freqFiltro, ctx.currentTime);
      }
    }, 300);

    window.addEventListener('mousemove', recolectarEntropia);

    intervaloRespaldoRef.current = setInterval(() => {
      establecerProgresoEntropia((anterior) => {
        const siguiente = anterior + 2.0;
        if (siguiente >= 100) {
          window.removeEventListener('mousemove', recolectarEntropia);
          setTimeout(() => {
            finalizarGeneracion(false);
          }, 50);
          return 100;
        }
        establecerTextoNucleo(`CAPTURANDO\n${Math.round(siguiente)}%`);
        return siguiente;
      });
    }, 250);
  };

  const alternarCaptura = () => {
    if (sincronizando) {
      window.removeEventListener('mousemove', recolectarEntropia);
      finalizarGeneracion(true);
    } else {
      iniciarSincronizacion();
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', recolectarEntropia);
      if (intervaloFrecuenciaRef.current) clearInterval(intervaloFrecuenciaRef.current);
      if (intervaloRespaldoRef.current) clearInterval(intervaloRespaldoRef.current);
    };
  }, []);

  return (
    <div className="relative w-full max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-12 z-10 flex flex-col justify-center items-center text-center gap-14">
      <div className="absolute w-[clamp(200px,30vw,450px)] h-[clamp(200px,30vw,450px)] rounded-full bg-neon-cyan/5 top-[10%] left-[-10%] blur-[120px] pointer-events-none animate-float-orb z-0" />

      <div>
        <span className="inline-block text-neon-cyan text-xs font-bold uppercase tracking-widest mb-2.5">
          Seguridad de Conocimiento Cero
        </span>
        <h2 className="font-heading text-white text-3xl md:text-5xl font-bold tracking-tight">
          Generador de Entropía Biométrica
        </h2>
      </div>

      <div className="flex flex-col items-center gap-10 w-full max-w-lg">
        <button
          onClick={alternarCaptura}
          className={`w-56 h-56 rounded-full relative flex flex-col items-center justify-center transition-all duration-500 cursor-pointer border-none select-none focus:outline-none ${
            sincronizando
              ? 'bg-gradient-to-br from-neon-cyan/20 to-transparent shadow-[0_0_60px_rgba(6,182,212,0.35)]'
              : 'bg-gradient-to-br from-neon-violet/15 to-transparent shadow-[0_0_40px_rgba(139,92,246,0.18)] border border-white/5 hover:border-white/10 hover:scale-[1.01]'
          }`}
        >
          {sincronizando && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/80 animate-pulse-wave wave-1" />
              <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/80 animate-pulse-wave wave-2 [animation-delay:1s]" />
              <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/80 animate-pulse-wave wave-3 [animation-delay:2s]" />
            </>
          )}

          <div className="z-10 font-heading font-extrabold text-sm tracking-wider text-white whitespace-pre-line text-center leading-relaxed">
            {llaveMaestra && !sincronizando ? (
              <div className="flex flex-col items-center gap-2 px-4">
                <span className="text-neon-cyan text-xs font-bold uppercase tracking-wider">LLAVE GENERADA</span>
                <span className="text-neon-violet text-[11px] font-mono tracking-widest bg-black/60 border border-white/10 px-4 py-2.5 rounded-xl mt-1 select-all shadow-md">
                  {llaveMaestra}
                </span>
              </div>
            ) : (
              textoNucleo
            )}
          </div>
        </button>

        <div className="text-center px-4">
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 font-medium">
            Inicia la recolección de ruido de entropía de tu navegador y movimientos. NextVault creará una llave maestra criptográfica en local y de forma 100% privada para tu bóveda digital.
          </p>
          
          <button
            onClick={alternarCaptura}
            className={`inline-flex items-center gap-2.5 px-9 py-4 rounded-full text-white font-extrabold text-sm transition-all duration-300 cursor-pointer border-none ${
              sincronizando
                ? 'bg-gradient-to-r from-neon-pink to-red-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                : 'bg-gradient-to-r from-neon-violet to-neon-pink shadow-[0_4px_25px_rgba(139,92,246,0.3)] hover:scale-105'
            }`}
          >
            {sincronizando ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Detener Captura
              </>
            ) : (
              <>
                <Key size={16} />
                Capturar Entropía
              </>
            )}
          </button>

          {sincronizando && (
            <div className="mt-6 font-heading text-xs font-bold uppercase tracking-widest text-neon-cyan">
              Frecuencia Criptográfica: <span className="font-mono font-bold">{frecuencia}</span> Hz
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
