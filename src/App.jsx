import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSeguridad } from './contexto/ContextoSeguridad';
import { usePantallas } from './hooks/usePantallas';
import Cabecera from './ui/Cabecera';
import Dial from './ui/Dial';
import Portada from './vistas/Portada';
import Bovedas from './vistas/Bovedas';
import MonitorRed from './vistas/MonitorRed';
import Entropia from './vistas/Entropia';
import Configurador from './vistas/Configurador';
import Acceso from './vistas/Acceso';
import Panel from './panel/Panel';

const SECCIONES = ['Inicio', 'Bóvedas', 'Monitor de red', 'Generador de entropía', 'Configurar plan'];
const enPanelSegunHash = () => window.location.hash.startsWith('#/panel');

export default function App() {
  const { cuenta, abierta, iniciando, avisos } = useSeguridad();
  const [enPanel, establecerEnPanel] = useState(enPanelSegunHash);
  const [acceso, establecerAcceso] = useState(null); // { modo, config } | null

  useEffect(() => {
    const alCambiar = () => establecerEnPanel(enPanelSegunHash());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  const irAlPanel = useCallback(() => { establecerEnPanel(true); window.location.hash = '#/panel'; window.scrollTo(0, 0); }, []);
  const irAInicio = useCallback(() => { establecerEnPanel(false); window.location.hash = ''; }, []);
  const abrirAcceso = useCallback((modo = 'entrar', config = null) => establecerAcceso({ modo, config }), []);

  // El panel solo existe con la bóveda abierta; si no lo está, se pide la contraseña.
  const mostrarPanel = enPanel && abierta;
  const accesoVisible = acceso ?? (enPanel && !abierta && !iniciando ? { modo: cuenta ? 'desbloquear' : 'entrar', config: null } : null);
  const { indice, ir, contenedor } = usePantallas(SECCIONES.length, !mostrarPanel && !accesoVisible);

  const clase = (i) => `pantalla ${i === indice ? 'activa' : i < indice ? 'antes' : ''}`;
  const vistas = [
    <Portada key="p" ir={ir} abrirAcceso={abrirAcceso} irAlPanel={irAlPanel} />, <Bovedas key="b" />, <MonitorRed key="m" />,
    <Entropia key="e" />, <Configurador key="c" abrirAcceso={abrirAcceso} irAlPanel={irAlPanel} />,
  ];

  return (
    <div className="relative min-h-screen">
      <a href="#contenido-principal" className="skip-link">Saltar al contenido</a>
      <Cabecera secciones={SECCIONES} indice={indice} ir={ir} enPanel={mostrarPanel} irAlPanel={irAlPanel} irAInicio={irAInicio} abrirAcceso={abrirAcceso} />

      <main id="contenido-principal">
        {mostrarPanel ? <Panel /> : (
          <div className="pantallas" ref={contenedor}>
            <Dial indice={indice} />
            {vistas.map((v, i) => (
              <section key={SECCIONES[i]} className={clase(i)} aria-label={SECCIONES[i]} aria-hidden={i !== indice} inert={i !== indice}>{v}</section>
            ))}
            <nav className="fixed inset-x-0 bottom-0 z-20 h-12 px-[clamp(20px,5vw,88px)] flex items-center gap-4 bg-carbon/90 backdrop-blur-sm border-t border-[var(--linea)]" aria-label="Pantallas">
              <div className="flex gap-1.5">
                {SECCIONES.map((s, i) => (
                  <button key={s} onClick={() => ir(i)} aria-label={`Ir a ${s}`} aria-current={i === indice ? 'true' : undefined}
                    className={`h-1 transition-all duration-500 ${i === indice ? 'w-10 bg-laton' : 'w-5 bg-[var(--linea-fuerte)] hover:bg-hueso'}`} />
                ))}
              </div>
              <span className="dato">{String(indice + 1).padStart(2, '0')}/{String(SECCIONES.length).padStart(2, '0')} · {SECCIONES[indice]}</span>
              <span className="dato ml-auto max-sm:hidden">Rueda, flechas o desliza para cambiar de pantalla</span>
            </nav>
          </div>
        )}
      </main>

      <AnimatePresence>
        {accesoVisible && (
          <Acceso key={`acceso-${accesoVisible.modo}`} modoInicial={accesoVisible.modo} config={accesoVisible.config}
            alCerrar={() => { establecerAcceso(null); if (enPanel && !abierta) irAInicio(); }}
            alEntrar={() => { establecerAcceso(null); irAlPanel(); }} />
        )}
      </AnimatePresence>

      <div className="fixed bottom-16 right-6 z-[70] flex flex-col items-end gap-2 pointer-events-none max-w-[calc(100%-3rem)] max-md:bottom-16" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`entra placa px-4 py-3 text-sm border-l-2 ${a.tipo === 'error' ? 'border-l-alerta' : a.tipo === 'info' ? 'border-l-aviso' : 'border-l-ok'}`}>{a.texto}</div>
        ))}
      </div>
    </div>
  );
}
