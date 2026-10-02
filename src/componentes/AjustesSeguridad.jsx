import { useEffect, useState } from 'react';
import { Copy, Download, LoaderCircle } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { entropiaDeTexto, tamano, nivelDeBits } from '../lib/cripto';
import { espacioDisponible } from '../lib/almacen';
import { PERFILES } from '../lib/perfiles';

function Bloque({ titulo, nota, children }) {
  return (
    <section className="vidrio p-6 md:p-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-6 lg:gap-12">
      <div><h2 className="font-heading text-white text-xl font-bold">{titulo}</h2><p className="text-sm text-slate-400 mt-2">{nota}</p></div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function AjustesSeguridad() {
  const { cuenta, cambiarContrasena, crearClaveRecuperacion, cambiarPerfil, guardarCuenta, eliminarCuenta, avisar } = useSeguridad();
  const [c, establecerC] = useState({ actual: '', nueva: '', repetir: '' });
  const [errorC, establecerErrorC] = useState('');
  const [ocupado, establecerOcupado] = useState(null);
  const [claveRec, establecerClaveRec] = useState('');
  const [perfil, establecerPerfil] = useState(cuenta.perfil);
  const [copias, establecerCopias] = useState(cuenta.copias);
  const [clavePerfil, establecerClavePerfil] = useState('');
  const [errorP, establecerErrorP] = useState('');
  const [confirmar, establecerConfirmar] = useState('');
  const [espacio, establecerEspacio] = useState(null);

  useEffect(() => { espacioDisponible().then(establecerEspacio); }, []);

  const enviarContrasena = async (e) => {
    e.preventDefault(); establecerErrorC('');
    if (c.nueva.length < 10 || entropiaDeTexto(c.nueva) < 45) return establecerErrorC('La nueva contraseña es demasiado débil: al menos 10 caracteres variados.');
    if (c.nueva !== c.repetir) return establecerErrorC('Las dos contraseñas nuevas no coinciden.');
    establecerOcupado('contrasena');
    try { await cambiarContrasena(c.actual, c.nueva); establecerC({ actual: '', nueva: '', repetir: '' }); avisar('Contraseña maestra cambiada'); }
    catch (ex) { establecerErrorC(ex.message); }
    establecerOcupado(null);
  };
  const generarRecuperacion = async () => {
    establecerOcupado('recuperacion');
    try { establecerClaveRec(await crearClaveRecuperacion()); } catch (ex) { avisar(ex.message, 'error'); }
    establecerOcupado(null);
  };
  const descargarRecuperacion = () => {
    const texto = `NextVault — clave de recuperación\nBóveda: ${cuenta.correo}\nCreada: ${new Date().toLocaleString('es-ES')}\n\n${claveRec}\n\nGuárdala fuera de este dispositivo. Quien la tenga puede abrir tu bóveda.\n`;
    const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'nextvault-recuperacion.txt' });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  };
  const enviarPerfil = async (e) => {
    e.preventDefault(); establecerErrorP('');
    if (!clavePerfil) return establecerErrorP('Escribe tu contraseña maestra para volver a derivar la clave.');
    establecerOcupado('perfil');
    try { await cambiarPerfil({ perfil, copias }, clavePerfil); establecerClavePerfil(''); avisar(`Perfil ${PERFILES[perfil].nombre} activo para los archivos nuevos`); }
    catch (ex) { establecerErrorP(ex.message); }
    establecerOcupado(null);
  };
  const nivel = nivelDeBits(entropiaDeTexto(c.nueva));
  const cambiado = perfil !== cuenta.perfil || copias !== cuenta.copias;

  return (
    <div className="flex flex-col gap-5">
      <Bloque titulo="Clave de recuperación" nota="Es la única forma de volver a entrar si olvidas la contraseña maestra. Se muestra una sola vez.">
        {claveRec ? (
          <div className="entra">
            <p className="mono text-lg md:text-xl text-neon-cyan bg-black/50 border border-neon-cyan/30 rounded-2xl p-5 break-all select-all tracking-wider">{claveRec}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <button className="boton boton-sec boton-mini" onClick={async () => { try { await navigator.clipboard.writeText(claveRec); avisar('Clave copiada'); } catch { avisar('No se pudo copiar', 'error'); } }}><Copy size={14} /> Copiar</button>
              <button className="boton boton-sec boton-mini" onClick={descargarRecuperacion}><Download size={14} /> Descargar .txt</button>
              <button className="boton boton-pri boton-mini" onClick={() => establecerClaveRec('')}>Ya la he guardado</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <span className={`chip ${cuenta.recuperacion ? 'chip-ok' : 'chip-aviso'}`}>{cuenta.recuperacion ? `Creada el ${new Date(cuenta.recuperacion.creada).toLocaleDateString('es-ES')}` : 'Todavía no tienes'}</span>
            <button className="boton boton-pri" disabled={ocupado === 'recuperacion'} onClick={generarRecuperacion}>
              {ocupado === 'recuperacion' && <LoaderCircle size={16} className="gira" />}{cuenta.recuperacion ? 'Generar una nueva' : 'Generar clave de recuperación'}
            </button>
            {cuenta.recuperacion && <p className="text-xs text-slate-500 basis-full">Generar una nueva invalida la anterior.</p>}
          </div>
        )}
      </Bloque>

      <Bloque titulo="Contraseña maestra" nota="Al cambiarla se vuelve a envolver la clave de datos; tus archivos no se recifran.">
        <form onSubmit={enviarContrasena} className="grid gap-4 max-w-md" noValidate>
          <div><label className="etiqueta" htmlFor="aj-actual">Actual</label><input id="aj-actual" type="password" autoComplete="current-password" className="campo" value={c.actual} onChange={(e) => establecerC({ ...c, actual: e.target.value })} /></div>
          <div><label className="etiqueta" htmlFor="aj-nueva">Nueva</label><input id="aj-nueva" type="password" autoComplete="new-password" className="campo" value={c.nueva} onChange={(e) => establecerC({ ...c, nueva: e.target.value })} />
            {c.nueva && <p className="text-xs text-slate-400 mt-2">Fuerza: <span className={`chip ${nivel.clase}`}>{nivel.texto}</span></p>}</div>
          <div><label className="etiqueta" htmlFor="aj-rep">Repite la nueva</label><input id="aj-rep" type="password" autoComplete="new-password" className="campo" value={c.repetir} onChange={(e) => establecerC({ ...c, repetir: e.target.value })} /></div>
          {errorC && <p className="error-texto" role="alert">{errorC}</p>}
          <button className="boton boton-sec self-start justify-self-start" disabled={ocupado === 'contrasena' || !c.actual || !c.nueva}>{ocupado === 'contrasena' && <LoaderCircle size={16} className="gira" />}Cambiar contraseña</button>
        </form>
      </Bloque>

      <Bloque titulo="Perfil y redundancia" nota="Se aplica a los archivos que subas a partir de ahora. Los que ya están guardados conservan su reparto.">
        <form onSubmit={enviarPerfil} className="grid gap-4 max-w-md" noValidate>
          <div><label className="etiqueta" htmlFor="aj-perfil">Perfil</label>
            <select id="aj-perfil" className="campo" value={perfil} onChange={(e) => { establecerPerfil(e.target.value); establecerCopias(Math.min(PERFILES[e.target.value].copias, cuenta.nodos)); }}>
              {Object.values(PERFILES).map((p) => <option key={p.clave} value={p.clave}>{p.nombre}: {p.fragmentos} fragmentos, PBKDF2 {p.iteraciones / 1000}k{p.comprimir ? ', gzip' : ''}</option>)}
            </select></div>
          <div><div className="flex justify-between mb-3"><label className="etiqueta !mb-0" htmlFor="aj-copias">Copias de cada fragmento</label><span className="mono font-bold text-white">{copias}</span></div>
            <input id="aj-copias" type="range" min="1" max={Math.min(3, cuenta.nodos)} value={copias} onChange={(e) => establecerCopias(Number(e.target.value))} className="rango" /></div>
          {cambiado && (<>
            <div><label className="etiqueta" htmlFor="aj-clave-perfil">Contraseña maestra</label><input id="aj-clave-perfil" type="password" autoComplete="current-password" className="campo" value={clavePerfil} onChange={(e) => establecerClavePerfil(e.target.value)} /></div>
            {errorP && <p className="error-texto" role="alert">{errorP}</p>}
            <button className="boton boton-pri justify-self-start" disabled={ocupado === 'perfil'}>{ocupado === 'perfil' && <LoaderCircle size={16} className="gira" />}Aplicar cambios</button>
          </>)}
        </form>
      </Bloque>

      <Bloque titulo="Bloqueo automático" nota="Al bloquear, la clave se borra de la memoria y hace falta la contraseña para volver a abrir.">
        <label className="etiqueta" htmlFor="aj-bloqueo">Bloquear tras</label>
        <select id="aj-bloqueo" className="campo max-w-xs" value={cuenta.autobloqueo} onChange={async (e) => { await guardarCuenta({ autobloqueo: Number(e.target.value) }); avisar('Bloqueo automático actualizado'); }}>
          <option value="1">1 minuto sin actividad</option><option value="5">5 minutos sin actividad</option><option value="10">10 minutos sin actividad</option>
          <option value="30">30 minutos sin actividad</option><option value="0">Nunca (solo a mano)</option>
        </select>
      </Bloque>

      <Bloque titulo="Almacenamiento" nota="Lo que el navegador concede a este sitio. Marcar el almacenamiento como persistente evita que el navegador lo borre si falta espacio.">
        {espacio?.cuota ? (
          <div className="max-w-md">
            <p className="text-sm text-slate-300"><strong className="text-white">{tamano(espacio.usado)}</strong> usados de {tamano(espacio.cuota)}</p>
            <div className="mt-3 h-2 rounded-full bg-white/8 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet" style={{ width: `${Math.max(1, (espacio.usado / espacio.cuota) * 100)}%` }} /></div>
            <button className="boton boton-sec boton-mini mt-4" onClick={async () => { const ok = await navigator.storage?.persist?.(); avisar(ok ? 'Almacenamiento marcado como persistente' : 'El navegador no ha concedido la persistencia', ok ? 'ok' : 'info'); }}>Pedir almacenamiento persistente</button>
          </div>
        ) : <p className="text-sm text-slate-400">Este navegador no informa del espacio disponible.</p>}
      </Bloque>

      <Bloque titulo="Eliminar la bóveda" nota="Borra la cuenta, todos los fragmentos y todas las credenciales de este navegador. No hay copia en ningún otro sitio.">
        <label className="etiqueta" htmlFor="aj-borrar">Escribe {cuenta.correo} para confirmar</label>
        <div className="flex flex-wrap gap-3 max-w-xl">
          <input id="aj-borrar" className="campo flex-1 min-w-[220px]" value={confirmar} onChange={(e) => establecerConfirmar(e.target.value)} autoComplete="off" />
          <button className="boton boton-peligro" disabled={confirmar.trim().toLowerCase() !== cuenta.correo} onClick={async () => { await eliminarCuenta(); window.location.hash = ''; avisar('Bóveda eliminada', 'info'); }}>Eliminar para siempre</button>
        </div>
      </Bloque>
    </div>
  );
}
