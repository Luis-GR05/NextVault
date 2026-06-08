import React from 'react';

export default function PiePagina() {
  return (
    <footer className="w-full py-6 bg-obsidian/90 border-t border-white/5 z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 gap-4 text-xs text-slate-500 font-medium">
      <p>
        &copy; 2026 NextVault Systems Inc. Todas las bóvedas están descentralizadas y los metadatos cifrados por conocimiento cero.
      </p>
      <ul className="flex gap-6 list-none">
        <li>
          <a href="#" className="hover:text-neon-cyan transition-colors duration-200 no-underline">
            Especificaciones
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-neon-cyan transition-colors duration-200 no-underline">
            Whitepaper
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-neon-cyan transition-colors duration-200 no-underline">
            Soporte de Red
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-neon-cyan transition-colors duration-200 no-underline">
            Auditorías HSM
          </a>
        </li>
      </ul>
    </footer>
  );
}
