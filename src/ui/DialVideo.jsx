import { useEffect, useRef, useState } from 'react';
import Dial from './Dial';

const DURACION_GIRO = 1400;
const suavizar = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Dial de combinación en vídeo: cada pantalla lleva el vídeo a un punto concreto y el dial gira hasta él.
 * Si el vídeo no puede cargarse, se muestra el dial vectorial.
 */
export default function DialVideo({ indice, total }) {
  const video = useRef(null);
  const animacion = useRef(null);
  const [fallo, establecerFallo] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v || fallo) return undefined;

    const girar = () => {
      if (!v.duration) return;
      const destino = (indice / Math.max(total - 1, 1)) * (v.duration - 0.05);
      const origen = v.currentTime;
      const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducido) { v.currentTime = destino; return; }

      const inicio = performance.now();
      cancelAnimationFrame(animacion.current);
      const paso = (ahora) => {
        const t = Math.min((ahora - inicio) / DURACION_GIRO, 1);
        if (!v.seeking) v.currentTime = origen + (destino - origen) * suavizar(t);
        if (t < 1) animacion.current = requestAnimationFrame(paso);
        else if (!v.seeking) v.currentTime = destino;
      };
      animacion.current = requestAnimationFrame(paso);
    };

    if (v.readyState >= 1) girar();
    else v.addEventListener('loadedmetadata', girar, { once: true });
    return () => { cancelAnimationFrame(animacion.current); v.removeEventListener('loadedmetadata', girar); };
  }, [indice, total, fallo]);

  if (fallo) return <Dial indice={indice} />;

  return (
    <div className={`dial-video ${indice === 0 ? '' : 'tenue'} pointer-events-none fixed top-1/2 right-0 -translate-y-1/2 h-[112vh] aspect-[866/1440] max-lg:hidden`} aria-hidden="true">
      <video ref={video} src="/video/dial.mp4" poster="/video/dial-poster.webp" muted playsInline preload="auto"
        disablePictureInPicture tabIndex={-1} onError={() => establecerFallo(true)} className="w-full h-full object-cover" />
    </div>
  );
}
