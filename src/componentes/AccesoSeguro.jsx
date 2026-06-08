import React, { useState } from 'react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { motion } from 'framer-motion';
import { ShieldAlert, X, Eye, EyeOff } from 'lucide-react';

export default function AccesoSeguro({ alCerrar, alIniciarSesionExitoso }) {
  const { iniciarSesion, registrarUsuario } = useSeguridad();
  const [esLogin, establecerEsLogin] = useState(true);
  const [correo, establecerCorreo] = useState('');
  const [contrasena, establecerContrasena] = useState('');
  const [mostrarContrasena, establecerMostrarContrasena] = useState(false);
  const [errorText, establecerErrorText] = useState('');

  const procesarFormulario = (e) => {
    e.preventDefault();
    establecerErrorText('');

    if (!correo || !contrasena) {
      establecerErrorText('Por favor, completa todos los campos.');
      return;
    }

    if (contrasena.length < 6) {
      establecerErrorText('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (esLogin) {
      iniciarSesion(correo, contrasena);
    } else {
      registrarUsuario(correo, contrasena);
    }

    alIniciarSesionExitoso();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/85 backdrop-blur-md px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-elevated/90 border border-white/10 rounded-3xl p-10 md:p-14 relative overflow-hidden backdrop-blur-2xl shadow-2xl flex flex-col gap-8"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-neon-violet/15 rounded-full blur-2xl pointer-events-none" />
        
        <button
          onClick={alCerrar}
          className="absolute top-6 right-6 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer focus:outline-none transition-colors duration-200"
          aria-label="Cerrar formulario"
        >
          <X size={22} />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <span className="w-14 h-14 rounded-2xl bg-neon-violet/10 border border-neon-violet/30 flex items-center justify-center text-neon-cyan shadow-md">
            <ShieldAlert size={28} />
          </span>
          <h3 className="font-heading text-white text-2xl font-extrabold tracking-tight">
            Acceso Autorizado NextVault
          </h3>
          <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
            Establece una sesión cifrada de almacenamiento y protección descentralizada
          </p>
        </div>

        <div className="flex border-b border-white/5 w-full mt-2">
          <button
            onClick={() => {
              establecerEsLogin(true);
              establecerErrorText('');
            }}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest bg-transparent border-none cursor-pointer focus:outline-none transition-colors duration-200 ${
              esLogin ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              establecerEsLogin(false);
              establecerErrorText('');
            }}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest bg-transparent border-none cursor-pointer focus:outline-none transition-colors duration-200 ${
              !esLogin ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {errorText && (
          <div className="p-4 bg-neon-pink/10 border border-neon-pink/20 rounded-xl text-xs text-neon-pink font-bold text-center leading-normal">
            {errorText}
          </div>
        )}

        <form onSubmit={procesarFormulario} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="correoAcceso" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Dirección de Correo
            </label>
            <input
              type="email"
              id="correoAcceso"
              value={correo}
              onChange={(e) => establecerCorreo(e.target.value)}
              placeholder="cliente@nextvault.com"
              required
              className="bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-slate-200 text-sm font-semibold focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan focus:outline-none transition-all duration-200 w-full placeholder-slate-600"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="contrasenaAcceso" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Clave de Seguridad
            </label>
            <div className="relative">
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                id="contrasenaAcceso"
                value={contrasena}
                onChange={(e) => establecerContrasena(e.target.value)}
                placeholder="••••••••••••"
                required
                className="bg-black/50 border border-white/10 rounded-2xl pl-5 pr-12 py-4 text-slate-200 text-sm font-semibold focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan focus:outline-none transition-all duration-200 w-full placeholder-slate-600"
              />
              <button
                type="button"
                onClick={() => establecerMostrarContrasena(!mostrarContrasena)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer focus:outline-none transition-colors duration-200"
              >
                {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-neon-violet to-neon-pink text-white text-sm font-extrabold shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.5)] transition-all duration-300 cursor-pointer border-none"
          >
            {esLogin ? 'Iniciar Conexión Segura' : 'Crear Cuenta Descentralizada'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
