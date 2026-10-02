export default function PiePagina() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-obsidian/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-10 flex flex-col md:flex-row gap-6 md:items-end justify-between text-sm text-slate-400">
        <div className="max-w-xl">
          <p className="font-heading text-white text-lg font-bold mb-2">NextVault</p>
          <p>
            Cifrado AES-256-GCM y derivación PBKDF2-SHA-256 con la API WebCrypto del navegador. En esta edición los nodos
            son almacenes independientes dentro de IndexedDB: nada se envía a ningún servidor y borrar los datos del
            navegador borra la bóveda.
          </p>
        </div>
        <p className="text-xs text-slate-500 md:text-right">
          © 2026 NextVault. Proyecto de demostración.<br />Fotografías de Unsplash.
        </p>
      </div>
    </footer>
  );
}
