import React, { useState, useEffect } from 'react';
import { Globe, Cpu, Share2, Database } from 'lucide-react';

const datosIniciales = {
  token: {
    clave: 'token',
    nombre: 'NextVault Token',
    codigo: 'NVT-USD',
    valor: 6.50,
    unidad: 'USD',
    historial: [6.10, 6.20, 6.15, 6.30, 6.25, 6.42, 6.50],
    cambio: '+4.25%',
    positivo: true,
    icono: Globe,
    color: 'var(--color-neon-cyan)'
  },
  latencia: {
    clave: 'latencia',
    nombre: 'Quantum Prover Latency',
    codigo: 'QPN-INDEX',
    valor: 4.20,
    unidad: 'ms',
    historial: [3.95, 4.10, 4.05, 4.12, 4.10, 4.15, 4.20],
    cambio: '+1.98%',
    positivo: true,
    icono: Cpu,
    color: 'var(--color-neon-violet)'
  },
  comision: {
    clave: 'comision',
    nombre: 'Decentralized Relayer Fee',
    codigo: 'DCR-FEE',
    valor: 2.90,
    unidad: 'NVT',
    historial: [3.05, 3.00, 2.98, 2.92, 2.95, 2.91, 2.90],
    cambio: '-0.85%',
    positivo: false,
    icono: Share2,
    color: 'var(--color-neon-pink)'
  },
  capacidad: {
    clave: 'capacidad',
    nombre: 'Active Cold Storage',
    codigo: 'ACA-CAPACITY',
    valor: 380.00,
    unidad: 'TB',
    historial: [345.00, 350.00, 362.00, 360.00, 370.00, 375.00, 380.00],
    cambio: '+5.12%',
    positivo: true,
    icono: Database,
    color: 'var(--color-neon-green)'
  }
};

export default function MonitorRed() {
  const [telemetria, establecerTelemetria] = useState(datosIniciales);
  const [seleccionado, establecerSeleccionado] = useState('token');

  useEffect(() => {
    const intervalo = setInterval(() => {
      establecerTelemetria((anterior) => {
        const copias = { ...anterior };
        Object.keys(copias).forEach((clave) => {
          const item = { ...copias[clave] };
          const porcentajeCambio = (Math.random() - 0.48) * 1.2;
          const valorPrevio = item.valor;
          item.valor += item.valor * (porcentajeCambio / 100);
          if (item.valor < 1) item.valor = 1;
          
          item.positivo = item.valor >= valorPrevio;
          
          const primerHistorial = item.historial[0];
          const diferencia = item.valor - primerHistorial;
          const porcentajeFinal = (diferencia / primerHistorial) * 100;
          item.cambio = `${porcentajeFinal >= 0 ? '+' : ''}${porcentajeFinal.toFixed(2)}%`;
          
          const nuevoHistorial = [...item.historial.slice(1), item.valor];
          item.historial = nuevoHistorial;
          
          copias[clave] = item;
        });
        return copias;
      });
    }, 2800);

    return () => clearInterval(intervalo);
  }, []);

  const itemActivo = telemetria[seleccionado];
  const puntos = itemActivo.historial;
  const min = Math.min(...puntos) * 0.98;
  const max = Math.max(...puntos) * 1.02;

  const ancho = 500;
  const alto = 200;
  const margen = 15;

  let rutaD = '';
  puntos.forEach((val, idx) => {
    const x = (idx / (puntos.length - 1)) * (ancho - margen * 2) + margen;
    const y = alto - (((val - min) / (max - min)) * (alto - margen * 2) + margen);
    rutaD += `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  });

  const rutaArea = `${rutaD} L ${ancho - margen} ${alto} L ${margen} ${alto} Z`;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-12 z-10 flex flex-col gap-14">
      <div className="absolute w-[clamp(250px,40vw,550px)] h-[clamp(250px,40vw,550px)] rounded-full bg-neon-violet/5 top-1/2 left-[80%] blur-[120px] pointer-events-none animate-float-orb z-0" />

      <div className="text-center md:text-left">
        <span className="inline-block text-neon-cyan text-xs font-bold uppercase tracking-widest mb-2.5">
          Telemetría Global
        </span>
        <h2 className="font-heading text-white text-3xl md:text-5xl font-bold tracking-tight">
          Infraestructura & Índice del Token NVT
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 w-full items-start">
        <div className="bg-elevated/35 border border-white/8 rounded-3xl p-8 md:p-10 flex flex-col justify-between backdrop-blur-xl shadow-2xl h-[400px] md:h-[440px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col gap-1">
              <span className="font-heading font-extrabold text-2xl text-white">
                {itemActivo.codigo}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {itemActivo.nombre} (Telemetría de Red)
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-heading font-extrabold text-2xl text-neon-cyan font-mono">
                {itemActivo.valor.toFixed(2)} {itemActivo.unidad}
              </span>
              <span className={`text-xs font-extrabold font-mono ${
                itemActivo.positivo ? 'text-neon-green' : 'text-neon-pink'
              }`}>
                {itemActivo.cambio}
              </span>
            </div>
          </div>

          <div className="relative flex-grow w-full h-48">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${ancho} ${alto}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={itemActivo.positivo ? '#06b6d4' : '#ec4899'} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={itemActivo.positivo ? '#06b6d4' : '#ec4899'} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={rutaArea} fill="url(#chartGlowGrad)" className="transition-all duration-500" />
              <path
                d={rutaD}
                fill="none"
                stroke={itemActivo.positivo ? '#06b6d4' : '#ec4899'}
                strokeWidth="2.5"
                className="transition-all duration-500"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {Object.values(telemetria).map((item) => {
            const Icono = item.icono;
            const esActivo = seleccionado === item.clave;
            return (
              <button
                key={item.clave}
                onClick={() => establecerSeleccionado(item.clave)}
                className={`flex items-center gap-5 p-6 text-left rounded-2xl border transition-all duration-300 backdrop-blur-md cursor-pointer focus:outline-none ${
                  esActivo
                    ? 'border-neon-cyan bg-neon-cyan/8 shadow-[0_0_25px_rgba(6,182,212,0.12)]'
                    : 'border-white/5 bg-elevated/30 hover:border-white/12 hover:bg-elevated/50'
                }`}
              >
                <span
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                >
                  <Icono size={22} style={{ color: item.color }} />
                </span>
                <div className="flex flex-col flex-grow gap-1">
                  <span className="font-bold text-sm text-white">{item.nombre}</span>
                  <span className="text-xs text-slate-400 font-semibold">{item.codigo}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-extrabold text-sm text-white font-mono">
                    {item.valor.toFixed(2)} {item.unidad}
                  </span>
                  <span className={`text-xs font-bold font-mono ${
                    item.positivo ? 'text-neon-green' : 'text-neon-pink'
                  }`}>
                    {item.change || item.cambio}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
