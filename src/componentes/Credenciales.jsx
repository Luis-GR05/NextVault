import { useMemo, useState } from 'react';
import { Plus, Search, Eye, EyeOff, Copy, Pencil, Trash2, ExternalLink, Wand2 } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';
import { entropiaDeTexto, nivelDeBits } from '../lib/cripto';
import { Generador } from './GeneradorEntropia';

const VACIO = { titulo: '', usuario: '', clave: '', url: '', notas: '' };

function Formulario({ inicial, alGuardar, alCancelar }) {
  const [d, establecerD] = useState(inicial);
  const [ver, establecerVer] = useState(false);
  const [generador, establecerGenerador] = useState(false);
  const [error, establecerError] = useState('');
  const campo = (k) => ({ value: d[k], onChange: (e) => establecerD({ ...d, [k]: e.target.value }) });

  const enviar = (e) => {
    e.preventDefault();
    if (!d.titulo.trim()) return establecerError('Ponle un nombre para encontrarla después.');
    if (!d.clave) return establecerError('Falta la contraseña.');
    alGuardar({ ...d, titulo: d.titulo.trim(), usuario: d.usuario.trim(), url: d.url.trim() });
  };

  return (
    <form onSubmit={enviar} className="vidrio p-6 md:p-8 grid gap-4 entra" noValidate>
      <h3 className="font-heading text-white text-xl font-bold">{inicial.id ? 'Editar credencial' : 'Nueva credencial'}</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="etiqueta" htmlFor="cr-titulo">Nombre</label><input id="cr-titulo" className="campo" placeholder="Banco, correo, wifi…" autoFocus {...campo('titulo')} /></div>
        <div><label className="etiqueta" htmlFor="cr-usuario">Usuario</label><input id="cr-usuario" className="campo" autoComplete="off" {...campo('usuario')} /></div>
      </div>
      <div>
        <label className="etiqueta" htmlFor="cr-clave">Contraseña</label>
        <div className="flex gap-2">
          <input id="cr-clave" type={ver ? 'text' : 'password'} className="campo mono" autoComplete="new-password" {...campo('clave')} />
          <button type="button" className="icono-btn border border-white/10 !w-12 !h-auto" onClick={() => establecerVer(!ver)} aria-label={ver ? 'Ocultar' : 'Mostrar'}>{ver ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          <button type="button" className="icono-btn border border-white/10 !w-12 !h-auto" onClick={() => establecerGenerador(!generador)} aria-label="Generar contraseña" aria-expanded={generador}><Wand2 size={17} /></button>
        </div>
        {generador && <div className="mt-3 p-4 rounded-2xl bg-black/30 border border-white/8"><Generador compacto alUsar={(v) => { establecerD({ ...d, clave: v }); establecerVer(true); establecerGenerador(false); }} /></div>}
      </div>
      <div><label className="etiqueta" htmlFor="cr-url">Dirección web</label><input id="cr-url" className="campo" placeholder="https://" {...campo('url')} /></div>
      <div><label className="etiqueta" htmlFor="cr-notas">Notas</label><textarea id="cr-notas" rows={2} className="campo resize-y" {...campo('notas')} /></div>
      {error && <p className="error-texto" role="alert">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="boton boton-pri">Guardar cifrada</button>
        <button type="button" className="boton boton-sec" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export default function Credenciales() {
  const { secretos, guardarSecreto, eliminarSecreto, avisar } = useSeguridad();
  const [edicion, establecerEdicion] = useState(null);
  const [busqueda, establecerBusqueda] = useState('');
  const [visible, establecerVisible] = useState(null);
  const [porBorrar, establecerPorBorrar] = useState(null);

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return q ? secretos.filter((s) => [s.titulo, s.usuario, s.url].join(' ').toLowerCase().includes(q)) : secretos;
  }, [secretos, busqueda]);

  const copiar = async (texto, que) => {
    try {
      await navigator.clipboard.writeText(texto);
      avisar(`${que} copiada. El portapapeles se vacía en 30 segundos.`);
      setTimeout(async () => { try { if ((await navigator.clipboard.readText()) === texto) await navigator.clipboard.writeText(''); } catch { /* sin permiso de lectura */ } }, 30000);
    } catch { avisar('No se pudo copiar al portapapeles', 'error'); }
  };
  const debiles = secretos.filter((s) => entropiaDeTexto(s.clave) < 45).length;
  const repetidas = secretos.length - new Set(secretos.map((s) => s.clave)).size;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative sm:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="search" className="campo !pl-11" placeholder="Buscar credenciales" aria-label="Buscar credenciales" value={busqueda} onChange={(e) => establecerBusqueda(e.target.value)} />
        </div>
        <button className="boton boton-pri" onClick={() => establecerEdicion(VACIO)}><Plus size={16} /> Añadir credencial</button>
      </div>

      {(debiles > 0 || repetidas > 0) && (
        <p className="chip chip-aviso self-start !py-2 !px-4">
          {[debiles > 0 && `${debiles} ${debiles === 1 ? 'contraseña débil' : 'contraseñas débiles'}`, repetidas > 0 && `${repetidas} ${repetidas === 1 ? 'repetida' : 'repetidas'}`].filter(Boolean).join(' y ')}
        </p>
      )}

      {edicion && <Formulario key={edicion.id ?? 'nueva'} inicial={edicion} alCancelar={() => establecerEdicion(null)}
        alGuardar={async (d) => { await guardarSecreto(d); establecerEdicion(null); avisar('Credencial cifrada y guardada'); }} />}

      <div className="vidrio p-5 md:p-8">
        {secretos.length === 0 ? (
          <p className="text-slate-400 py-10 text-center">Guarda aquí tus contraseñas: se cifran con la misma clave que tus archivos y solo se ven con la bóveda abierta.</p>
        ) : lista.length === 0 ? (
          <p className="text-slate-400 py-10 text-center">Nada coincide con «{busqueda}».</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/6">
            {lista.map((s) => {
              const nivel = nivelDeBits(entropiaDeTexto(s.clave));
              return (
                <li key={s.id} className="py-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-neon-violet/30 to-neon-pink/20 border border-white/10 grid place-items-center font-heading font-extrabold text-white flex-none">{s.titulo[0]?.toUpperCase()}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold truncate flex items-center gap-2">{s.titulo}
                        {/^https?:\/\//.test(s.url) && <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-neon-cyan" aria-label={`Abrir ${s.titulo}`}><ExternalLink size={14} /></a>}</p>
                      <p className="text-xs text-slate-400 truncate">{s.usuario || 'Sin usuario'}</p>
                      <p className="mono text-sm mt-1 text-slate-200 break-all">{visible === s.id ? s.clave : '•'.repeat(Math.min(14, s.clave.length))}</p>
                    </div>
                    <span className={`chip hidden md:inline-flex ${nivel.clase}`}>{nivel.texto}</span>
                    <button className="icono-btn" onClick={() => establecerVisible(visible === s.id ? null : s.id)} aria-label={visible === s.id ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{visible === s.id ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                    <button className="icono-btn" onClick={() => copiar(s.clave, 'Contraseña')} aria-label={`Copiar contraseña de ${s.titulo}`}><Copy size={17} /></button>
                    <button className="icono-btn hidden sm:inline-grid" onClick={() => { establecerEdicion(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label={`Editar ${s.titulo}`}><Pencil size={17} /></button>
                    <button className="icono-btn hover:!text-neon-pink" onClick={() => establecerPorBorrar(porBorrar === s.id ? null : s.id)} aria-label={`Eliminar ${s.titulo}`}><Trash2 size={17} /></button>
                  </div>
                  {s.notas && visible === s.id && <p className="text-sm text-slate-400 mt-2 md:ml-[60px] whitespace-pre-wrap">{s.notas}</p>}
                  {porBorrar === s.id && (
                    <div className="mt-3 md:ml-[60px] flex flex-wrap items-center gap-3 text-sm bg-neon-pink/8 border border-neon-pink/25 rounded-xl px-4 py-3">
                      <span className="text-slate-200 flex-1">¿Eliminar «{s.titulo}»? No se puede deshacer.</span>
                      <button className="boton boton-peligro boton-mini" onClick={async () => { await eliminarSecreto(s.id); establecerPorBorrar(null); avisar('Credencial eliminada'); }}>Eliminar</button>
                      <button className="boton boton-sec boton-mini" onClick={() => establecerPorBorrar(null)}>Conservar</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
