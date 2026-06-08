import React, { useState } from 'react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { Shield, Menu, X, LogOut, LayoutDashboard, Home } from 'lucide-react';

export default function Navegacion({
  seccionActiva,
  irASeccion,
  abrirLogin,
  irAlPanel,
  enPanel,
  irALanding
}) {
  const { usuario, cerrarSesion } = useSeguridad();
  const [menuAbierto, establecerMenuAbierto] = useState(false);

  const alternarMenu = () => establecerMenuAbierto(!menuAbierto);

  const navegarA = (indice) => {
    establecerMenuAbierto(false);
    irALanding();
    setTimeout(() => {
      irASeccion(indice);
    }, 50);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 bg-obsidian/75 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <button
        onClick={irALanding}
        className="flex items-center gap-3 font-heading font-extrabold text-2xl tracking-tight text-white bg-transparent border-none cursor-pointer focus:outline-none"
      >
        <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-violet to-neon-pink flex items-center justify-center text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] animate-rotate-core">
          <Shield size={20} strokeWidth={2.5} />
        </span>
        NextVault
      </button>

      <button
        onClick={alternarMenu}
        className="md:hidden text-white hover:text-neon-cyan focus:outline-none"
        aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuAbierto}
      >
        {menuAbierto ? <X size={24} /> : <Menu size={24} />}
      </button>

      <ul
        className={`fixed inset-y-0 right-0 w-64 md:w-auto md:static bg-obsidian/95 md:bg-transparent border-l border-white/10 md:border-none p-8 md:p-0 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-9 list-none transition-transform duration-300 z-40 md:transform-none ${
          menuAbierto ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {!enPanel && (
          <>
            <li>
              <button
                onClick={() => navegarA(1)}
                className={`text-sm font-semibold tracking-wide bg-transparent border-none cursor-pointer transition-colors duration-200 focus:outline-none relative py-1 ${
                  seccionActiva === 1 ? 'text-neon-cyan' : 'text-slate-300 hover:text-white'
                }`}
              >
                Bóvedas
              </button>
            </li>
            <li>
              <button
                onClick={() => navegarA(2)}
                className={`text-sm font-semibold tracking-wide bg-transparent border-none cursor-pointer transition-colors duration-200 focus:outline-none relative py-1 ${
                  seccionActiva === 2 ? 'text-neon-cyan' : 'text-slate-300 hover:text-white'
                }`}
              >
                Monitor de Red
              </button>
            </li>
            <li>
              <button
                onClick={() => navegarA(3)}
                className={`text-sm font-semibold tracking-wide bg-transparent border-none cursor-pointer transition-colors duration-200 focus:outline-none relative py-1 ${
                  seccionActiva === 3 ? 'text-neon-cyan' : 'text-slate-300 hover:text-white'
                }`}
              >
                Generador de Entropía
              </button>
            </li>
          </>
        )}

        <li className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          {enPanel ? (
            <>
              <button
                onClick={irALanding}
                className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white bg-transparent border-none cursor-pointer py-1"
              >
                <Home size={16} />
                Inicio
              </button>
              <button
                onClick={cerrarSesion}
                className="flex items-center gap-2 text-sm font-semibold text-neon-pink hover:text-white bg-transparent border-none cursor-pointer py-1"
              >
                <LogOut size={16} />
                Salir
              </button>
            </>
          ) : usuario ? (
            <>
              <button
                onClick={irAlPanel}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-neon-violet to-neon-pink text-white text-sm font-bold shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:scale-105 transition-transform duration-200 cursor-pointer border-none"
              >
                <LayoutDashboard size={16} />
                Panel Privado
              </button>
              <button
                onClick={cerrarSesion}
                className="flex items-center gap-2 text-sm font-semibold text-neon-pink hover:text-white bg-transparent border-none cursor-pointer py-1"
              >
                <LogOut size={16} />
                Salir
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navegarA(4)}
                className="text-sm font-semibold text-slate-300 hover:text-white bg-transparent border-none cursor-pointer py-1 w-full md:w-auto text-left"
              >
                Configurar Plan
              </button>
              <button
                onClick={abrirLogin}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-neon-violet to-neon-pink text-white text-sm font-bold shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:scale-105 transition-transform duration-200 cursor-pointer border-none w-full md:w-auto"
              >
                Acceso Cliente
              </button>
            </>
          )}
        </li>
      </ul>
    </nav>
  );
}
