import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSeguridad } from './contexto/ContextoSeguridad';
import FondoRed from './componentes/FondoRed';
import Navegacion from './componentes/Navegacion';
import PiePagina from './componentes/PiePagina';
import Hero from './componentes/Hero';
import ComoFunciona from './componentes/ComoFunciona';
import BovedasCatalogo from './componentes/BovedasCatalogo';
import GeneradorEntropia from './componentes/GeneradorEntropia';
import ConfiguradorPlan from './componentes/ConfiguradorPlan';
import AccesoSeguro from './componentes/AccesoSeguro';
import PanelPrincipal from './componentes/PanelPrincipal';

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
  const irAInicio = useCallback((ancla = '') => {
    establecerEnPanel(false);
    window.location.hash = ancla ? `#${ancla}` : '';
    if (!ancla) window.scrollTo({ top: 0 });
  }, []);
  const abrirAcceso = useCallback((modo = 'entrar', config = null) => establecerAcceso({ modo, config }), []);

  // El panel solo existe con la bóveda abierta. Si está bloqueada o no hay sesión, se pide acceso.
  const mostrarPanel = enPanel && abierta;
  const accesoVisible = acceso ?? (enPanel && !abierta && !iniciando ? { modo: cuenta ? 'desbloquear' : 'entrar', config: null } : null);

  return (
    <div className="relative min-h-screen flex flex-col">
      <a href="#contenido-principal" className="skip-link">Saltar al contenido</a>
      <FondoRed />
      <Navegacion enPanel={mostrarPanel} irAlPanel={irAlPanel} irAInicio={irAInicio} abrirAcceso={abrirAcceso} />

      <main id="contenido-principal" className="relative z-10 flex-grow">
        {mostrarPanel ? (
          <PanelPrincipal />
        ) : (
          <>
            <Hero abrirAcceso={abrirAcceso} irAlPanel={irAlPanel} />
            <ComoFunciona />
            <BovedasCatalogo />
            <GeneradorEntropia />
            <ConfiguradorPlan abrirAcceso={abrirAcceso} />
          </>
        )}
      </main>

      {!mostrarPanel && <PiePagina />}

      <AnimatePresence>
        {accesoVisible && (
          <AccesoSeguro
            key={`acceso-${accesoVisible.modo}`}
            modoInicial={accesoVisible.modo}
            config={accesoVisible.config}
            alCerrar={() => { establecerAcceso(null); if (enPanel && !abierta) irAInicio(); }}
            alEntrar={() => { establecerAcceso(null); irAlPanel(); }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-2 pointer-events-none w-max max-w-[calc(100%-2rem)]" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`entra px-5 py-3 rounded-full text-sm font-semibold backdrop-blur-xl border shadow-2xl ${
            a.tipo === 'error' ? 'bg-neon-pink/15 border-neon-pink/40 text-pink-200'
              : a.tipo === 'info' ? 'bg-neon-violet/15 border-neon-violet/40 text-violet-100'
              : 'bg-neon-green/10 border-neon-green/40 text-emerald-100'}`}>
            {a.texto}
          </div>
        ))}
      </div>
    </div>
  );
}
