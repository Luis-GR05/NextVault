# NextVault

Bóveda cifrada de conocimiento cero que funciona entera en el navegador.

- **Cifrado real**: AES-256-GCM y PBKDF2-SHA-256 con la API WebCrypto. La contraseña maestra nunca se guarda; deriva la clave que envuelve la clave de datos.
- **Fragmentación con redundancia**: cada archivo cifrado se parte en fragmentos y cada fragmento se copia en varios nodos. Se puede desconectar un nodo, vaciar su disco o corromper un fragmento; la auditoría lo detecta por SHA-256 y la reparación lo restaura desde una copia sana.
- **Gestor de credenciales** cifrado con la misma clave, con generador de contraseñas y aviso de claves débiles o repetidas.
- **Portada a pantalla completa**: catálogo de bóvedas, monitor de red con cifrado en vivo, generador de entropía con el movimiento del puntero y configurador de plan.
- **Clave de recuperación**, cambio de contraseña, cambio de perfil, bloqueo automático por inactividad y borrado completo.

En esta edición los «nodos» son almacenes independientes dentro de IndexedDB, en el propio navegador: no hay servidor. Borrar los datos del sitio borra la bóveda.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run lint
```

WebCrypto necesita un contexto seguro: `localhost` o HTTPS.

## Estructura

```
src/
  App.jsx              pantallas completas de la portada o panel privado
  hooks/usePantallas   navegación por rueda, teclado y gesto táctil
  vistas/              Portada, Bovedas, MonitorRed, Entropia, Configurador, Acceso
  panel/               Panel, Archivos, Subida, Credenciales, Nodos, Seguridad
  ui/                  Cabecera, Dial, Generador
  contexto/            sesión, claves en memoria y acciones
  lib/cripto.js        derivar, cifrar, envolver claves, generadores
  lib/almacen.js       IndexedDB (solo datos ya cifrados)
  lib/boveda.js        guardar, recuperar, auditar, reparar, credenciales
  lib/perfiles.js      bóvedas Alpha, Obsidian, Zero-Gravity y Cold Armour, y cuota del plan
```
