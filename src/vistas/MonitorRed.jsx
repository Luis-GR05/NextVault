import { useEffect, useMemo, useRef, useState } from 'react';
import { aHex, cifrar, generarClaveDatos } from '../lib/cripto';
import { nodosDeFragmento } from '../lib/boveda';
import { NOMBRES_NODO } from '../lib/perfiles';

const te = new TextEncoder();
const NODOS = 8, FRAGMENTOS = 4, COPIAS = 2;

/** Demostración con criptografía real: lo que escribes se cifra, se fragmenta y se reparte; apaga nodos y mira si aún se reconstruye. */
export default function MonitorRed() {
  const [texto, establecerTexto] = useState('Escritura de la casa, pág. 1 de 14');
  const [hex, establecerHex] = useState('');
  const [caidos, establecerCaidos] = useState([]);
  const clave = useRef(null);

  useEffect(() => {
    let vigente = true;
    (async () => {
      if (!clave.current) clave.current = await generarClaveDatos();
      const { cifrado } = await cifrar(clave.current, te.encode(texto || ' '));
      if (vigente) establecerHex(aHex(cifrado));
    })();
    return () => { vigente = false; };
  }, [texto]);

  const paso = Math.ceil(hex.length / FRAGMENTOS / 2) * 2 || 2;
  const fragmentos = Array.from({ length: FRAGMENTOS }, (_, i) => hex.slice(i * paso, (i + 1) * paso));
  const reparto = useMemo(() => {
    const porNodo = Array.from({ length: NODOS }, () => []);
    for (let f = 0; f < FRAGMENTOS; f++) nodosDeFragmento(1, f * 2, COPIAS, NODOS).forEach((n) => porNodo[n].push(f));
    return porNodo;
  }, []);
  const vivas = Array.from({ length: FRAGMENTOS }, (_, f) => reparto.filter((fr, n) => fr.includes(f) && !caidos.includes(n)).length);
  const recuperable = vivas.every((v) => v > 0);
  const degradado = recuperable && vivas.some((v) => v < COPIAS);
  const alternar = (n) => establecerCaidos((c) => (c.includes(n) ? c.filter((x) => x !== n) : [...c, n]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 lg:gap-16 max-w-[1180px]">
      <div>
        <h2 className="titular sube">Apaga nodos. Mira qué pasa.</h2>
        <p className="entrada sube mt-6" style={{ '--n': 1 }}>Escribe algo: se cifra de verdad, se parte en cuatro fragmentos y cada uno se guarda en dos nodos. Después desconecta los que quieras.</p>
        <div className="sube mt-8" style={{ '--n': 2 }}>
          <label htmlFor="mon-texto" className="etiqueta">Texto de prueba</label>
          <input id="mon-texto" className="campo" value={texto} maxLength={64} onChange={(e) => establecerTexto(e.target.value)} autoComplete="off" spellCheck={false} />
          <p className="dato mt-4">Cifrado AES-256-GCM, {hex.length / 2} bytes</p>
          <p className="mono text-[12px] leading-relaxed break-all mt-2 min-h-[72px]" aria-label="Texto cifrado en hexadecimal">
            {fragmentos.map((f, i) => <span key={i} className={i % 2 ? 'text-niebla' : 'text-hueso'}>{f}</span>)}
          </p>
        </div>
      </div>

      <div className="sube" style={{ '--n': 3 }}>
        <div className={`placa px-5 py-4 flex items-center justify-between gap-4 border-l-2 ${recuperable ? (degradado ? 'border-l-aviso' : 'border-l-ok') : 'border-l-alerta'}`} aria-live="polite">
          <div>
            <p className="font-medium">{!recuperable ? 'Irrecuperable: falta un fragmento entero' : degradado ? 'Recuperable, pero sin margen' : 'Íntegro y con redundancia completa'}</p>
            <p className="dato mt-1">{NODOS - caidos.length}/{NODOS} nodos en línea · copias vivas por fragmento: {vivas.join(' ')}</p>
          </div>
          {caidos.length > 0 && <button className="boton boton-sec boton-mini" onClick={() => establecerCaidos([])}>Reconectar todos</button>}
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {reparto.map((fr, n) => {
            const caido = caidos.includes(n);
            return (
              <li key={n}>
                <button onClick={() => alternar(n)} aria-pressed={!caido} aria-label={`${caido ? 'Conectar' : 'Desconectar'} ${NOMBRES_NODO[n]}`}
                  className={`placa w-full text-left p-4 min-h-[112px] transition-all duration-300 hover:border-[var(--linea-fuerte)] ${caido ? 'opacity-40' : ''}`}>
                  <span className="flex items-center justify-between">
                    <span className="text-sm font-medium">{NOMBRES_NODO[n]}</span>
                    <span className={`w-2 h-2 ${caido ? 'bg-alerta' : 'bg-ok late'}`} />
                  </span>
                  <span className="dato block mt-0.5">{caido ? 'desconectado' : 'en línea'}</span>
                  <span className="flex gap-1.5 mt-4">
                    {fr.length ? fr.map((f) => <span key={f} className={`mono text-[11px] w-6 h-6 grid place-items-center border ${caido ? 'border-[var(--linea)] text-niebla' : 'border-laton text-laton'}`}>{f + 1}</span>)
                      : <span className="dato">vacío</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="dato mt-4">Los nodos de esta instalación son almacenes locales del navegador. En el panel privado puedes vaciarlos, corromperlos, auditar y reparar.</p>
      </div>
    </div>
  );
}
