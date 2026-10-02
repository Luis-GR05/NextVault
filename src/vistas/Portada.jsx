import { ArrowRight, Lock } from 'lucide-react';
import { useSeguridad } from '../contexto/ContextoSeguridad';

const GARANTIAS = [
  ['AES-256-GCM', 'Cifrado autenticado de cada archivo'],
  ['PBKDF2 · 310.000', 'Iteraciones para derivar tu clave'],
  ['SHA-256', 'Huella verificada en cada fragmento'],
];

export default function Portada({ ir, abrirAcceso, irAlPanel }) {
  const { cuenta, abierta } = useSeguridad();
  return (
    <div className="max-w-[760px]">
      <h1 className="titular sube !text-[clamp(2.7rem,7.4vw,6.2rem)]">Una bóveda sin puerta trasera</h1>
      <p className="entrada sube mt-7" style={{ '--n': 1 }}>
        Tus archivos y contraseñas se cifran en este dispositivo, se parten en fragmentos y se reparten por duplicado
        entre nodos. Nadie más tiene la combinación: ni nosotros.
      </p>
      <div className="sube flex flex-wrap gap-3 mt-9" style={{ '--n': 2 }}>
        {abierta ? <button onClick={irAlPanel} className="boton boton-pri">Abrir panel privado <ArrowRight size={16} /></button>
          : cuenta ? <button onClick={() => abrirAcceso('desbloquear')} className="boton boton-pri"><Lock size={15} /> Desbloquear bóveda</button>
          : <button onClick={() => abrirAcceso('registro')} className="boton boton-pri">Crear bóveda <ArrowRight size={16} /></button>}
        <button onClick={() => ir(1)} className="boton boton-sec">Explorar bóvedas</button>
      </div>
      <dl className="sube grid sm:grid-cols-3 gap-x-8 gap-y-4 mt-14 pt-6 border-t border-[var(--linea)] max-w-[640px]" style={{ '--n': 3 }}>
        {GARANTIAS.map(([k, v]) => (
          <div key={k}><dt className="mono text-sm text-laton">{k}</dt><dd className="text-sm text-niebla mt-1">{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}
