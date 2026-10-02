import { motion } from 'framer-motion';

const FOTO = 'https://images.unsplash.com/photo-1680992046626-418f7e910589?auto=format&fit=crop&q=70&w=1400';
const PASOS = [
  ['Tu contraseña se convierte en clave', 'PBKDF2-SHA-256 la estira con cientos de miles de iteraciones y una sal aleatoria. La contraseña no se guarda en ningún sitio.'],
  ['El archivo se cifra antes de guardarse', 'AES-256-GCM con un vector de inicialización nuevo para cada archivo. El nombre y el tamaño también van cifrados.'],
  ['Se parte y se reparte', 'El cifrado se divide en fragmentos y cada fragmento se copia en varios nodos. Ningún nodo tiene el archivo entero.'],
  ['Se reconstruye y se comprueba', 'Al abrirlo se reúnen los fragmentos de los nodos disponibles, se verifica su huella SHA-256 y se descifra en memoria.'],
];

export default function ComoFunciona() {
  return (
    <section id="como" className="relative max-w-7xl mx-auto px-5 md:px-10 py-20 md:py-28 grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
      <div className="lg:sticky lg:top-28">
        <h2 className="titular">Cuatro pasos, todos en tu dispositivo</h2>
        <div className="mt-8 relative rounded-3xl overflow-hidden border border-white/8 aspect-[4/3] bg-elevated">
          <img src={FOTO} alt="Bastidor de servidores en una sala a oscuras" loading="lazy" className="w-full h-full object-cover opacity-80"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-neon-violet/20 mix-blend-multiply" />
          <p className="absolute bottom-0 inset-x-0 p-6 text-sm text-slate-200 max-w-md">
            Un servidor que solo ve fragmentos cifrados no puede leer, filtrar ni entregar lo que guardas.
          </p>
        </div>
      </div>

      <ol className="flex flex-col">
        {PASOS.map(([titulo, texto], i) => (
          <motion.li key={titulo} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-[auto_1fr] gap-x-6 py-8 border-b border-white/8 first:border-t">
            <span className="font-heading font-extrabold text-5xl leading-none degradado">{i + 1}</span>
            <div>
              <h3 className="font-heading text-white text-2xl font-bold tracking-tight">{titulo}</h3>
              <p className="mt-2 text-slate-400 max-w-md">{texto}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
