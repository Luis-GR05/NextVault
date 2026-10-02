import { useState } from 'react';
import { PERFILES } from '../lib/perfiles';

export default function Bovedas() {
  const [activa, establecerActiva] = useState('alfa');
  const p = PERFILES[activa];
  const lista = Object.values(PERFILES);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-20 max-w-[1180px]">
      <div>
        <h2 className="titular sube">Cuatro bóvedas, cuatro cerraduras</h2>
        <p className="entrada sube mt-6" style={{ '--n': 1 }}>Cada perfil decide en cuántos fragmentos se parte un archivo, cuántas copias se guardan y cuánto cuesta derivar tu clave.</p>
        <div role="tablist" aria-label="Perfiles de bóveda" className="sube mt-9 border-t border-[var(--linea)]" style={{ '--n': 2 }}>
          {lista.map((x, i) => (
            <button key={x.clave} role="tab" aria-selected={activa === x.clave} onClick={() => establecerActiva(x.clave)}
              className={`w-full grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 text-left py-4 border-b border-[var(--linea)] transition-colors ${activa === x.clave ? 'text-hueso' : 'text-niebla hover:text-hueso'}`}>
              <span className={`mono text-xs ${activa === x.clave ? 'text-laton' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
              <span className="text-xl md:text-2xl font-medium tracking-[-0.02em]">{x.nombre}</span>
              <span className="dato">{x.lema}</span>
            </button>
          ))}
        </div>
      </div>

      <div key={activa} role="tabpanel" className="placa p-6 md:p-9 entra self-start sube" style={{ '--n': 3 }}>
        <p className="dato text-laton">Vault {p.nombre}</p>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-hueso/90 max-w-[52ch]">{p.descripcion}</p>
        <table className="tabla-ficha mt-6">
          <tbody>
            <tr><th scope="row">Fragmentos por archivo</th><td>{p.fragmentos}</td></tr>
            <tr><th scope="row">Copias de cada fragmento</th><td>{p.copias}</td></tr>
            <tr><th scope="row">Nodos que pueden caer</th><td>{p.copias - 1}</td></tr>
            <tr><th scope="row">Derivación de clave</th><td>PBKDF2 × {p.iteraciones.toLocaleString('es-ES')}</td></tr>
            <tr><th scope="row">Compresión previa</th><td>{p.comprimir ? 'gzip' : 'no'}</td></tr>
            <tr><th scope="row">Cuota base</th><td>{p.precio} €/mes</td></tr>
          </tbody>
        </table>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-7">
          {p.medidas.map(([etiqueta, valor]) => (
            <div key={etiqueta}>
              <div className="flex justify-between text-xs text-niebla mb-2"><span>{etiqueta}</span><span className="mono">{valor}</span></div>
              <div className="h-[3px] bg-[var(--linea)]"><div className="h-full bg-laton transition-[width] duration-700" style={{ width: `${valor}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
