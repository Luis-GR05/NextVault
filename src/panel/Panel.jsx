import { useEffect, useState } from 'react';
import { FileText, KeyRound, Server, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import Archivos from './Archivos';
import Credenciales from './Credenciales';
import Nodos from './Nodos';
import Seguridad from './Seguridad';

const PESTANAS = [['archivos', 'Archivos', FileText], ['credenciales', 'Credenciales', KeyRound], ['nodos', 'Nodos', Server], ['seguridad', 'Seguridad', ShieldCheck]];

export default function Panel() {
  const { cuenta, archivos, secretos } = useSeguridad();
  const [pestana, establecerPestana] = useState(() => window.location.hash.split('/')[2] || 'archivos');

  useEffect(() => {
    const alCambiar = () => establecerPestana(window.location.hash.split('/')[2] || 'archivos');
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  const activa = PESTANAS.some(([k]) => k === pestana) ? pestana : 'archivos';
  const cuentas = { archivos: archivos.length, credenciales: secretos.length, nodos: cuenta.nodos - cuenta.nodosCaidos.length };

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-10 pt-[96px] pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <h1 className="font-heading text-hueso text-4xl md:text-5xl font-medium tracking-tight">Tu bóveda</h1>
          <p className="text-sm text-slate-400 mt-2">Abierta en este dispositivo. Se bloquea sola {cuenta.autobloqueo ? `tras ${cuenta.autobloqueo} minutos sin actividad` : 'solo cuando tú lo pidas'}.</p>
        </div>
        {cuenta.recuperacion
          ? <span className="chip chip-ok self-start md:self-auto"><ShieldCheck size={13} /> Clave de recuperación creada</span>
          : <a href="#/panel/seguridad" className="chip chip-aviso self-start md:self-auto"><TriangleAlert size={13} /> Sin clave de recuperación</a>}
      </header>

      <div role="tablist" aria-label="Secciones de la bóveda" className="flex gap-1.5 overflow-x-auto sin-barra mb-8 p-1.5 rounded-sm bg-white/5 border border-white/8 w-full md:w-max">
        {PESTANAS.map(([k, texto, Icono]) => (
          <a key={k} href={`#/panel/${k}`} role="tab" aria-selected={activa === k}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-sm text-sm font-medium whitespace-nowrap transition-colors ${activa === k ? 'bg-hueso text-carbon' : 'text-slate-300 hover:text-hueso'}`}>
            <Icono size={16} /> {texto}
            {cuentas[k] !== undefined && <span className={`mono text-xs ${activa === k ? 'text-slate-500' : 'text-slate-500'}`}>{cuentas[k]}</span>}
          </a>
        ))}
      </div>

      <div role="tabpanel" key={activa} className="entra">
        {activa === 'archivos' && <Archivos />}
        {activa === 'credenciales' && <Credenciales />}
        {activa === 'nodos' && <Nodos />}
        {activa === 'seguridad' && <Seguridad />}
      </div>
    </div>
  );
}
