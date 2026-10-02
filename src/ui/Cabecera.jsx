import { useState } from 'react';
import { Menu, X, LogOut, Lock } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';

export default function Cabecera({ secciones, indice, ir, enPanel, irAlPanel, irAInicio, abrirAcceso }) {
  const { cuenta, abierta, bloquear, cerrarSesion } = useSeguridad();
  const [menu, establecerMenu] = useState(false);
  const cerrar = () => establecerMenu(false);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 border-b border-[var(--linea)] ${enPanel || menu ? 'bg-carbon' : 'bg-carbon/70 backdrop-blur-md'}`}>
      <nav className="flex items-center justify-between gap-6 px-[clamp(20px,5vw,88px)] h-16" aria-label="Principal">
        <button onClick={() => { cerrar(); irAInicio(); ir(0); }} className="flex items-center gap-3 font-medium tracking-[-0.02em] text-lg text-hueso">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-laton)" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3.2" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></svg>
          NextVault
        </button>

        <button onClick={() => establecerMenu(!menu)} className="md:hidden icono-btn text-hueso" aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menu}>
          {menu ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`${menu ? 'flex' : 'hidden'} md:flex absolute md:static top-16 inset-x-0 bg-carbon md:bg-transparent border-b border-[var(--linea)] md:border-0 flex-col md:flex-row items-start md:items-center gap-5 md:gap-7 p-6 md:p-0`}>
          {!enPanel && secciones.slice(1).map((s, i) => (
            <button key={s} onClick={() => { cerrar(); ir(i + 1); }} aria-current={indice === i + 1 ? 'true' : undefined}
              className={`text-sm transition-colors ${indice === i + 1 ? 'text-laton' : 'text-niebla hover:text-hueso'}`}>{s}</button>
          ))}
          {enPanel ? (
            <>
              <span className="dato truncate max-w-[220px]">{cuenta?.correo}</span>
              <button onClick={() => { cerrar(); irAInicio(); bloquear(); }} className="boton boton-sec boton-mini"><Lock size={14} /> Bloquear</button>
              <button onClick={() => { cerrar(); irAInicio(); cerrarSesion(); }} className="boton boton-peligro boton-mini"><LogOut size={14} /> Salir</button>
            </>
          ) : abierta ? (
            <button onClick={() => { cerrar(); irAlPanel(); }} className="boton boton-pri boton-mini">Panel privado</button>
          ) : cuenta ? (
            <button onClick={() => { cerrar(); abrirAcceso('desbloquear'); }} className="boton boton-pri boton-mini"><Lock size={14} /> Desbloquear</button>
          ) : (
            <button onClick={() => { cerrar(); abrirAcceso('entrar'); }} className="boton boton-sec boton-mini">Acceso cliente</button>
          )}
        </div>
      </nav>
    </header>
  );
}
