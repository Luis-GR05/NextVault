import React, { useEffect, useRef } from 'react';

export default function FondoRed() {
  const lienzoRef = useRef(null);

  useEffect(() => {
    const lienzo = lienzoRef.current;
    if (!lienzo) return;

    const ctx = lienzo.getContext('2d');
    let nodos = [];
    let conexiones = [];
    let impulsos = [];
    let idAnimacion;
    let ancho = 0;
    let alto = 0;

    const prefiereReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function redimensionar() {
      ancho = lienzo.width = window.innerWidth;
      alto = lienzo.height = window.innerHeight;
    }

    function inicializarRed() {
      redimensionar();
      nodos = [];
      conexiones = [];
      impulsos = [];
      const cantidad = Math.min(Math.floor((ancho * alto) / 25000), 55);

      for (let i = 0; i < cantidad; i++) {
        nodos.push({
          x: Math.random() * ancho,
          y: Math.random() * alto,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 2 + 1
        });
      }

      for (let i = 0; i < nodos.length; i++) {
        let objetivos = [];
        for (let j = i + 1; j < nodos.length; j++) {
          const dx = nodos[i].x - nodos[j].x;
          const dy = nodos[i].y - nodos[j].y;
          const distancia = Math.sqrt(dx * dx + dy * dy);
          if (distancia < 140) {
            objetivos.push({ indice: j, dist: distancia });
          }
        }
        objetivos.sort((a, b) => a.dist - b.dist);
        objetivos.slice(0, 3).forEach((t) => {
          conexiones.push({ de: i, para: t.indice });
        });
      }
    }

    function dispararImpulso(indiceConexion) {
      if (impulsos.length > 30) return;
      const conexion = conexiones[indiceConexion];
      if (!conexion) return;
      impulsos.push({
        indiceConexion,
        progreso: 0,
        velocidad: Math.random() * 0.015 + 0.008
      });
    }

    function dibujarRed() {
      ctx.clearRect(0, 0, ancho, alto);
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.04)';
      ctx.lineWidth = 1;

      conexiones.forEach((conn) => {
        const p1 = nodos[conn.de];
        const p2 = nodos[conn.para];
        if (!p1 || !p2) return;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      if (Math.random() < 0.08 && conexiones.length > 0) {
        dispararImpulso(Math.floor(Math.random() * conexiones.length));
      }

      for (let i = impulsos.length - 1; i >= 0; i--) {
        const imp = impulsos[i];
        const conn = conexiones[imp.indiceConexion];
        if (!conn) {
          impulsos.splice(i, 1);
          continue;
        }
        const p1 = nodos[conn.de];
        const p2 = nodos[conn.para];
        if (!p1 || !p2) {
          impulsos.splice(i, 1);
          continue;
        }
        imp.progreso += imp.velocidad;

        if (imp.progreso >= 1) {
          impulsos.splice(i, 1);
          continue;
        }

        const xActual = p1.x + (p2.x - p1.x) * imp.progreso;
        const yActual = p1.y + (p2.y - p1.y) * imp.progreso;

        ctx.beginPath();
        ctx.arc(xActual, yActual, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      nodos.forEach((nodo) => {
        nodo.x += nodo.vx;
        nodo.y += nodo.vy;

        if (nodo.x < 0) nodo.x = ancho;
        if (nodo.x > ancho) nodo.x = 0;
        if (nodo.y < 0) nodo.y = alto;
        if (nodo.y > alto) nodo.y = 0;

        ctx.beginPath();
        ctx.arc(nodo.x, nodo.y, nodo.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.fill();
      });

      if (!prefiereReducido) {
        idAnimacion = requestAnimationFrame(dibujarRed);
      }
    }

    inicializarRed();
    if (!prefiereReducido) {
      dibujarRed();
    } else {
      ctx.clearRect(0, 0, ancho, alto);
    }

    const manejarCambioDimension = () => {
      cancelAnimationFrame(idAnimacion);
      inicializarRed();
      if (!prefiereReducido) dibujarRed();
    };

    const manejarClick = (e) => {
      if (nodos.length === 0) return;
      let masCercano = 0;
      let distMinima = Infinity;
      for (let i = 0; i < nodos.length; i++) {
        const dx = nodos[i].x - e.clientX;
        const dy = nodos[i].y - e.clientY;
        const dist = dx * dx + dy * dy;
        if (dist < distMinima) {
          distMinima = dist;
          masCercano = i;
        }
      }
      conexiones.forEach((conn, idx) => {
        if (conn.de === masCercano || conn.para === masCercano) {
          dispararImpulso(idx);
        }
      });
    };

    window.addEventListener('resize', manejarCambioDimension);
    window.addEventListener('click', manejarClick);

    return () => {
      window.removeEventListener('resize', manejarCambioDimension);
      window.removeEventListener('click', manejarClick);
      cancelAnimationFrame(idAnimacion);
    };
  }, []);

  return (
    <canvas
      ref={lienzoRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30"
      aria-hidden="true"
    />
  );
}
