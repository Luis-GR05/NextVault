import React, { useState, useEffect } from 'react';
import { useSeguridad } from './contexto/ContextoSeguridad';
import FondoRed from './componentes/FondoRed';
import Navegacion from './componentes/Navegacion';
import PiePagina from './componentes/PiePagina';
import Hero from './componentes/Hero';
import BovedasCatalogo from './componentes/BovedasCatalogo';
import MonitorRed from './componentes/MonitorRed';
import GeneradorEntropia from './componentes/GeneradorEntropia';
import ConfiguradorPlan from './componentes/ConfiguradorPlan';
import AccesoSeguro from './componentes/AccesoSeguro';
import PanelPrincipal from './componentes/PanelPrincipal';
import { AnimatePresence } from 'framer-motion';

export default function App() {
  const { usuario } = useSeguridad();
  const [seccionActiva, establecerSeccionActiva] = useState(0);
  const [loginAbierto, establecerLoginAbierto] = useState(false);
  const [enPanel, establecerEnPanel] = useState(false);
  const [estaTransicionando, establecerEstaTransicionando] = useState(false);
  const [inicioY, establecerInicioY] = useState(0);

  const irASeccion = (indice) => {
    if (estaTransicionando || indice === seccionActiva || indice < 0 || indice > 4) return;
    establecerEstaTransicionando(true);
    establecerSeccionActiva(indice);
    setTimeout(() => {
      establecerEstaTransicionando(false);
    }, 950);
  };

  useEffect(() => {
    if (enPanel || loginAbierto) return;

    const manejarRueda = (e) => {
      if (Math.abs(e.deltaY) < 18 || estaTransicionando) return;
      const direccion = e.deltaY > 0 ? 1 : -1;
      const siguiente = seccionActiva + direccion;
      if (siguiente >= 0 && siguiente <= 4) {
        irASeccion(siguiente);
      }
    };

    const manejarTecla = (e) => {
      if (estaTransicionando) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        irASeccion(seccionActiva + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        irASeccion(seccionActiva - 1);
      }
    };

    const manejarInicioToque = (e) => {
      establecerInicioY(e.touches[0].clientY);
    };

    const manejarFinToque = (e) => {
      if (estaTransicionando) return;
      const finY = e.changedTouches[0].clientY;
      const diferencia = inicioY - finY;
      if (Math.abs(diferencia) > 50) {
        const direccion = diferencia > 0 ? 1 : -1;
        irASeccion(seccionActiva + direccion);
      }
    };

    window.addEventListener('wheel', manejarRueda, { passive: true });
    window.addEventListener('keydown', manejarTecla);
    window.addEventListener('touchstart', manejarInicioToque, { passive: true });
    window.addEventListener('touchend', manejarFinToque, { passive: true });

    return () => {
      window.removeEventListener('wheel', manejarRueda);
      window.removeEventListener('keydown', manejarTecla);
      window.removeEventListener('touchstart', manejarInicioToque);
      window.removeEventListener('touchend', manejarFinToque);
    };
  }, [seccionActiva, estaTransicionando, enPanel, loginAbierto, inicioY]);

  useEffect(() => {
    if (usuario) {
      establecerEnPanel(true);
    } else {
      establecerEnPanel(false);
    }
  }, [usuario]);

  const obtenerClaseSeccion = (indice) => {
    if (indice === seccionActiva) return 'view active';
    if (indice < seccionActiva) return 'view exit-up';
    return 'view exit-down';
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-obsidian text-slate-100 flex flex-col justify-between select-none">
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido
      </a>
      
      <FondoRed />

      <Navegacion
        seccionActiva={seccionActiva}
        irASeccion={irASeccion}
        abrirLogin={() => establecerLoginAbierto(true)}
        irAlPanel={() => establecerEnPanel(true)}
        enPanel={enPanel}
        irALanding={() => establecerEnPanel(false)}
      />

      <main id="contenido-principal" className="flex-grow w-full h-full relative" aria-live="polite">
        {enPanel ? (
          <PanelPrincipal irAGeneradorLlave={() => {
            establecerEnPanel(false);
            setTimeout(() => {
              irASeccion(3);
            }, 50);
          }} />
        ) : (
          <div id="app" className="relative w-full h-full">
            <div className={obtenerClaseSeccion(0)} id="hero">
              <Hero irASeccion={irASeccion} />
            </div>
            <div className={obtenerClaseSeccion(1)} id="catalog">
              <BovedasCatalogo />
            </div>
            <div className={obtenerClaseSeccion(2)} id="market">
              <MonitorRed />
            </div>
            <div className={obtenerClaseSeccion(3)} id="simulator">
              <GeneradorEntropia />
            </div>
            <div className={obtenerClaseSeccion(4)} id="quote">
              <ConfiguradorPlan />
            </div>
          </div>
        )}
      </main>

      {!enPanel && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
          {[0, 1, 2, 3, 4].map((indice) => (
            <button
              key={indice}
              onClick={() => irASeccion(indice)}
              aria-label={`Ir a la sección ${indice + 1}`}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer focus:outline-none transition-all duration-300 ${
                seccionActiva === indice
                  ? 'bg-neon-cyan shadow-[0_0_8px_#06b6d4] scale-125'
                  : 'bg-white/20 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      <PiePagina />

      <AnimatePresence>
        {loginAbierto && (
          <AccesoSeguro
            alCerrar={() => establecerLoginAbierto(false)}
            alIniciarSesionExitoso={() => {
              establecerLoginAbierto(false);
              establecerEnPanel(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
