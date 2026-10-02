import { useEffect, useRef } from 'react';

/** Malla de nodos de fondo: puntos que derivan, se enlazan por cercanía y se apartan del cursor. */
export default function FondoRed() {
  const lienzo = useRef(null);

  useEffect(() => {
    const c = lienzo.current;
    const ctx = c.getContext('2d');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ancho = 0, alto = 0, nodos = [], cuadro = 0;
    const raton = { x: -999, y: -999 };

    const iniciar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = window.innerWidth; alto = window.innerHeight;
      c.width = ancho * dpr; c.height = alto * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const total = Math.min(70, Math.floor((ancho * alto) / 26000));
      nodos = Array.from({ length: total }, (_, i) => ({
        x: Math.random() * ancho, y: Math.random() * alto,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.8, tono: i % 5 === 0 ? '236,72,153' : i % 3 === 0 ? '34,211,238' : '139,92,246',
      }));
    };

    const pintar = () => {
      ctx.clearRect(0, 0, ancho, alto);
      for (const n of nodos) {
        if (!quieto) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > ancho) n.vx *= -1;
          if (n.y < 0 || n.y > alto) n.vy *= -1;
          const dx = n.x - raton.x, dy = n.y - raton.y, d = Math.hypot(dx, dy);
          if (d < 140 && d > 0) { n.x += (dx / d) * (140 - d) * 0.02; n.y += (dy / d) * (140 - d) * 0.02; }
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.tono},0.55)`; ctx.fill();
      }
      for (let i = 0; i < nodos.length; i++) {
        for (let j = i + 1; j < nodos.length; j++) {
          const a = nodos[i], b = nodos[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 150) {
            ctx.strokeStyle = `rgba(139,92,246,${(1 - d / 150) * 0.16})`;
            ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      if (!quieto) cuadro = requestAnimationFrame(pintar);
    };

    const alMover = (e) => { raton.x = e.clientX; raton.y = e.clientY; };
    const alRedimensionar = () => { cancelAnimationFrame(cuadro); iniciar(); pintar(); };
    const alVisibilidad = () => { cancelAnimationFrame(cuadro); if (!document.hidden) pintar(); };
    iniciar(); pintar();
    window.addEventListener('resize', alRedimensionar);
    window.addEventListener('pointermove', alMover, { passive: true });
    document.addEventListener('visibilitychange', alVisibilidad);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener('resize', alRedimensionar);
      window.removeEventListener('pointermove', alMover);
      document.removeEventListener('visibilitychange', alVisibilidad);
    };
  }, []);

  return <canvas ref={lienzo} className="fixed inset-0 w-full h-full z-0 pointer-events-none" aria-hidden="true" />;
}
