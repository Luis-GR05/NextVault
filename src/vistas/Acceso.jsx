import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, X, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { entropiaDeTexto, nivelDeBits } from '../lib/cripto';
import { PERFILES, configuracionInicial } from '../lib/perfiles';

const TITULOS = {
  entrar: ['Abre tu bóveda', 'Escribe tu correo y tu contraseña maestra.'],
  registro: ['Crea tu bóveda', 'La contraseña maestra cifra todo lo demás. No se puede recuperar si la pierdes.'],
  desbloquear: ['Bóveda bloqueada', 'Vuelve a escribir tu contraseña maestra para descifrarla.'],
  recuperar: ['Recupera el acceso', 'Usa tu clave de recuperación para fijar una contraseña nueva.'],
};

export default function Acceso({ modoInicial = 'entrar', config, alCerrar, alEntrar }) {
  const { cuenta, registrar, entrar, entrarConRecuperacion, cerrarSesion } = useSeguridad();
  const [modo, establecerModo] = useState(modoInicial);
  const [correo, establecerCorreo] = useState(cuenta?.correo ?? '');
  const [contrasena, establecerContrasena] = useState('');
  const [repetir, establecerRepetir] = useState('');
  const [recuperacion, establecerRecuperacion] = useState('');
  const [ver, establecerVer] = useState(false);
  const [error, establecerError] = useState('');
  const [ocupado, establecerOcupado] = useState(false);
  const caja = useRef(null);

  useEffect(() => {
    const alTecla = (e) => { if (e.key === 'Escape') alCerrar(); };
    document.addEventListener('keydown', alTecla);
    document.body.style.overflow = 'hidden';
    caja.current?.querySelector('input')?.focus();
    return () => { document.removeEventListener('keydown', alTecla); document.body.style.overflow = ''; };
  }, [alCerrar]);

  const cambiar = (m) => { establecerModo(m); establecerError(''); establecerContrasena(''); establecerRepetir(''); };
  const crea = modo === 'registro' || modo === 'recuperar';
  const bits = entropiaDeTexto(contrasena);
  const nivel = nivelDeBits(bits);
  const cfg = config ?? configuracionInicial();

  const enviar = async (e) => {
    e.preventDefault(); establecerError('');
    const c = modo === 'desbloquear' ? cuenta.correo : correo.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) return establecerError('Escribe un correo válido.');
    if (crea) {
      if (contrasena.length < 10) return establecerError('La contraseña maestra necesita al menos 10 caracteres.');
      if (bits < 45) return establecerError('Es demasiado fácil de adivinar. Alárgala o mezcla tipos de carácter.');
      if (contrasena !== repetir) return establecerError('Las dos contraseñas no coinciden.');
    } else if (!contrasena) return establecerError('Escribe tu contraseña maestra.');
    if (modo === 'recuperar' && recuperacion.replace(/[^a-z0-9]/gi, '').length < 32) return establecerError('La clave de recuperación tiene 32 caracteres.');

    establecerOcupado(true);
    try {
      if (modo === 'registro') await registrar(c, contrasena, cfg);
      else if (modo === 'recuperar') await entrarConRecuperacion(c, recuperacion, contrasena);
      else await entrar(c, contrasena);
      alEntrar();
    } catch (ex) {
      establecerError(ex.message || 'No se pudo abrir la bóveda.');
      establecerOcupado(false);
    }
  };

  const [titulo, nota] = TITULOS[modo];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-carbon/85 backdrop-blur-md p-4 overflow-y-auto"
      onMouseDown={(e) => { if (e.target === e.currentTarget) alCerrar(); }}>
      <motion.div ref={caja} role="dialog" aria-modal="true" aria-labelledby="acceso-titulo"
        initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="placa w-full max-w-md p-7 md:p-10 relative my-auto ">
        <button onClick={alCerrar} className="icono-btn absolute top-4 right-4" aria-label="Cerrar"><X size={20} /></button>

        <span className="w-12 h-12 rounded-md bg-laton/12 border border-laton/30 grid place-items-center text-laton"><ShieldCheck size={24} /></span>
        <h2 id="acceso-titulo" className="font-heading text-hueso text-3xl font-medium tracking-tight mt-5">{titulo}</h2>
        <p className="text-sm text-slate-400 mt-2">{nota}</p>

        {modo === 'registro' && (
          <p className="mt-4 text-xs text-slate-300 bg-white/5 border border-white/8 rounded px-4 py-3">
            Bóveda <strong className="text-hueso">{PERFILES[cfg.perfil].nombre}</strong>: {cfg.nodos} nodos, {cfg.copias} {cfg.copias === 1 ? 'copia' : 'copias'} de cada fragmento.
          </p>
        )}

        <form onSubmit={enviar} className="flex flex-col gap-4 mt-6" noValidate>
          {modo === 'desbloquear' ? (
            <p className="mono text-sm text-laton bg-black/40 border border-white/8 rounded px-4 py-3 truncate">{cuenta?.correo}</p>
          ) : (
            <div><label htmlFor="acc-correo" className="etiqueta">Correo</label>
              <input id="acc-correo" type="email" autoComplete="username" className="campo" value={correo} onChange={(e) => establecerCorreo(e.target.value)} placeholder="tu@correo.com" /></div>
          )}

          {modo === 'recuperar' && (
            <div><label htmlFor="acc-rec" className="etiqueta">Clave de recuperación</label>
              <input id="acc-rec" className="campo mono uppercase" value={recuperacion} onChange={(e) => establecerRecuperacion(e.target.value)} placeholder="XXXX-XXXX-XXXX-…" autoComplete="off" spellCheck={false} /></div>
          )}

          <div>
            <label htmlFor="acc-clave" className="etiqueta">{modo === 'recuperar' ? 'Nueva contraseña maestra' : 'Contraseña maestra'}</label>
            <div className="relative">
              <input id="acc-clave" type={ver ? 'text' : 'password'} autoComplete={crea ? 'new-password' : 'current-password'} className="campo pr-12" value={contrasena} onChange={(e) => establecerContrasena(e.target.value)} />
              <button type="button" onClick={() => establecerVer(!ver)} className="icono-btn absolute right-1.5 top-1/2 -translate-y-1/2" aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{ver ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            {crea && contrasena && (
              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-sm bg-white/10 overflow-hidden"><div className={`h-full rounded-sm transition-all duration-300 ${nivel.color}`} style={{ width: `${Math.min(100, bits / 1.2)}%` }} /></div>
                <span className="text-xs font-semibold text-slate-300">{nivel.texto}</span>
              </div>
            )}
          </div>

          {crea && (
            <div><label htmlFor="acc-rep" className="etiqueta">Repítela</label>
              <input id="acc-rep" type={ver ? 'text' : 'password'} autoComplete="new-password" className="campo" value={repetir} onChange={(e) => establecerRepetir(e.target.value)} /></div>
          )}

          {error && <p className="error-texto" role="alert">{error}</p>}

          <button type="submit" disabled={ocupado} className="boton boton-pri w-full mt-1">
            {ocupado ? <><LoaderCircle size={16} className="gira" /> Derivando la clave…</> : modo === 'registro' ? 'Crear bóveda' : modo === 'recuperar' ? 'Fijar contraseña y abrir' : 'Abrir bóveda'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm text-slate-400">
          {modo === 'entrar' && <p>¿Primera vez? <button onClick={() => cambiar('registro')} className="text-laton font-semibold hover:underline">Crea una bóveda</button></p>}
          {modo === 'registro' && <p>¿Ya tienes una? <button onClick={() => cambiar('entrar')} className="text-laton font-semibold hover:underline">Entra</button></p>}
          {(modo === 'entrar' || modo === 'desbloquear') && <p><button onClick={() => cambiar('recuperar')} className="text-slate-300 font-semibold hover:underline">He olvidado mi contraseña</button></p>}
          {modo === 'recuperar' && <p><button onClick={() => cambiar(cuenta ? 'desbloquear' : 'entrar')} className="text-laton font-semibold hover:underline">Volver</button></p>}
          {modo === 'desbloquear' && <p><button onClick={() => { cerrarSesion(); cambiar('entrar'); establecerCorreo(''); }} className="text-slate-300 font-semibold hover:underline">Usar otra bóveda</button></p>}
        </div>
      </motion.div>
    </motion.div>
  );
}
