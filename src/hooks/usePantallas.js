import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Navegación por pantallas completas con rueda, teclado y gesto táctil.
 * Si una pantalla tiene más contenido que alto, primero se desplaza por dentro y solo cambia al llegar al borde.
 */
export function usePantallas(total, activo) {
  const [indice, establecerIndice] = useState(0);
  const bloqueo = useRef(false);
  const contenedor = useRef(null);
  const toque = useRef(null);

  const ir = useCallback((n) => {
    if (n < 0 || n >= total || bloqueo.current) return;
    establecerIndice((actual) => {
      if (actual === n) return actual;
      bloqueo.current = true;
      setTimeout(() => { bloqueo.current = false; }, 850);
      return n;
    });
  }, [total]);

  useEffect(() => {
    if (!activo) return undefined;
    const vista = () => contenedor.current?.querySelector('.pantalla.activa');
    const enBorde = (dir) => {
      const v = vista(); if (!v) return true;
      return dir > 0 ? v.scrollTop + v.clientHeight >= v.scrollHeight - 2 : v.scrollTop <= 0;
    };
    const cambiar = (dir) => establecerIndice((i) => {
      const n = i + dir;
      if (n < 0 || n >= total || bloqueo.current) return i;
      bloqueo.current = true; setTimeout(() => { bloqueo.current = false; }, 850);
      return n;
    });
    // desplazar: con teclado, si queda contenido por ver se avanza dentro de la pantalla antes de cambiar.
    const mover = (dir, desplazar = false) => {
      if (enBorde(dir)) cambiar(dir);
      else if (desplazar) vista()?.scrollBy({ top: dir * vista().clientHeight * 0.8, behavior: 'smooth' });
    };

    const alRueda = (e) => { if (Math.abs(e.deltaY) > 16) mover(e.deltaY > 0 ? 1 : -1); };
    const alTecla = (e) => {
      if (e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); mover(1, true); }
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); mover(-1, true); }
      else if (e.key === 'Home') establecerIndice(0);
      else if (e.key === 'End') establecerIndice(total - 1);
    };
    const alTocar = (e) => { toque.current = e.touches[0].clientY; };
    const alSoltar = (e) => {
      if (toque.current === null) return;
      const d = toque.current - e.changedTouches[0].clientY; toque.current = null;
      if (Math.abs(d) > 60 && !e.target.closest('input[type=range], .sin-gesto')) mover(d > 0 ? 1 : -1);
    };
    window.addEventListener('wheel', alRueda, { passive: true });
    window.addEventListener('keydown', alTecla);
    window.addEventListener('touchstart', alTocar, { passive: true });
    window.addEventListener('touchend', alSoltar, { passive: true });
    return () => {
      window.removeEventListener('wheel', alRueda); window.removeEventListener('keydown', alTecla);
      window.removeEventListener('touchstart', alTocar); window.removeEventListener('touchend', alSoltar);
    };
  }, [activo, total]);

  return { indice, ir, contenedor };
}
