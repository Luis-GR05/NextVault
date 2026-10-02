import { useEffect, useState } from 'react';
import { ShieldCheck, Menu, X, LogOut, Lock, LayoutDashboard } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';

const ENLACES = [['como', 'Cómo funciona'], ['perfiles', 'Bóvedas'], ['generador', 'Generador'], ['configurar', 'Configurar']];

export default function Navegacion({ enPanel, irAlPanel, irAInicio, abrirAcceso }) {
  const { cuenta, abierta, bloquear, cerrarSesion } = useSeguridad();
  const [menu, establecerMenu] = useState(false);
  const [solida, establecerSolida] = useState(false);

  useEffect(() => {
    const alScroll = () => establecerSolida(window.scrollY > 24);
    alScroll(); window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, []);

  const cerrar = () => establecerMenu(false);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${solida || enPanel || menu ? 'bg-obsidian/80 backdrop-blur-xl border-b border-white/5' : 'border-b border-transparent'}`}>
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-5 md:px-10 h-[72px]" aria-label="Principal">
        <button onClick={() => { cerrar(); irAInicio(); }} className="flex items-center gap-3 font-heading font-extrabold text-xl tracking-tight text-white">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-violet to-neon-pink grid place-items-center shadow-[0_0_18px_rgba(139,92,246,0.5)]">
            <ShieldCheck size={20} strokeWidth={2.4} />
          </span>
          NextVault
        </button>

        <button onClick={() => establecerMenu(!menu)} className="md:hidden icono-btn text-white" aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menu}>
          {menu ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`${menu ? 'flex' : 'hidden'} md:flex absolute md:static top-[72px] inset-x-0 bg-obsidian md:bg-transparent border-b border-white/10 md:border-0 flex-col md:flex-row items-start md:items-center gap-5 md:gap-8 p-6 md:p-0`}>
          {!enPanel && ENLACES.map(([ancla, texto]) => (
            <a key={ancla} href={`#${ancla}`} onClick={cerrar} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">{texto}</a>
          ))}
          {enPanel ? (
            <>
              <span className="mono text-xs text-neon-cyan truncate max-w-[220px]">{cuenta?.correo}</span>
              <button onClick={() => { cerrar(); irAInicio(); bloquear(); }} className="boton boton-sec boton-mini"><Lock size={14} /> Bloquear</button>
              <button onClick={() => { cerrar(); irAInicio(); cerrarSesion(); }} className="boton boton-peligro boton-mini"><LogOut size={14} /> Salir</button>
            </>
          ) : abierta ? (
            <button onClick={() => { cerrar(); irAlPanel(); }} className="boton boton-pri boton-mini"><LayoutDashboard size={15} /> Mi bóveda</button>
          ) : cuenta ? (
            <button onClick={() => { cerrar(); abrirAcceso('desbloquear'); }} className="boton boton-pri boton-mini"><Lock size={15} /> Desbloquear</button>
          ) : (
            <>
              <button onClick={() => { cerrar(); abrirAcceso('entrar'); }} className="text-sm font-semibold text-slate-300 hover:text-white">Entrar</button>
              <button onClick={() => { cerrar(); abrirAcceso('registro'); }} className="boton boton-pri boton-mini">Crear bóveda</button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
