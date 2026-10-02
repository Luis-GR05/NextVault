/** Dial de combinación: gira una posición con cada pantalla. Es el único ornamento de la interfaz. */
export default function Dial({ indice }) {
  const marcas = Array.from({ length: 100 }, (_, i) => i);
  const giro = -indice * (360 / 10) - 18;
  return (
    <div className="pointer-events-none fixed top-1/2 right-0 -translate-y-1/2 translate-x-[42%] w-[min(96vh,920px)] aspect-square opacity-80 max-lg:hidden" aria-hidden="true">
      <svg viewBox="-500 -500 1000 1000" className="w-full h-full">
        <circle r="492" fill="none" stroke="var(--linea)" />
        <g style={{ transform: `rotate(${giro}deg)`, transition: 'transform 1.4s cubic-bezier(0.22,1,0.36,1)' }}>
          {marcas.map((i) => (
            <line key={i} x1="0" y1={-470} x2="0" y2={i % 10 === 0 ? -428 : i % 5 === 0 ? -444 : -456} stroke={i % 10 === 0 ? 'var(--color-hueso)' : 'var(--linea-fuerte)'} strokeWidth={i % 10 === 0 ? 2 : 1} transform={`rotate(${i * 3.6})`} />
          ))}
          {marcas.filter((i) => i % 10 === 0).map((i) => (
            <text key={i} y={-392} textAnchor="middle" fill="var(--color-niebla)" fontFamily="var(--font-mono)" fontSize="24" transform={`rotate(${i * 3.6})`}>{String(i).padStart(2, '0')}</text>
          ))}
        </g>
        <circle r="360" fill="none" stroke="var(--linea)" />
        <g style={{ transform: `rotate(${-giro * 0.5}deg)`, transition: 'transform 1.8s cubic-bezier(0.22,1,0.36,1)' }}>
          {Array.from({ length: 36 }, (_, i) => <line key={i} x1="0" y1={-350} x2="0" y2={-336} stroke="var(--linea-fuerte)" transform={`rotate(${i * 10})`} />)}
          <circle r="230" fill="none" stroke="var(--linea)" strokeDasharray="2 10" />
        </g>
        <path d="M-498 0 l-26 -13 v26 z" fill="var(--color-laton)" />
      </svg>
    </div>
  );
}
