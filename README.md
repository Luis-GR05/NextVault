# NextVault

Bóveda cifrada de conocimiento cero que funciona entera en el navegador.

- **Cifrado real**: AES-256-GCM y PBKDF2-SHA-256 con la API WebCrypto. La contraseña maestra nunca se guarda; deriva la clave que envuelve la clave de datos.
- **Fragmentación con redundancia**: cada archivo cifrado se parte en fragmentos y cada fragmento se copia en varios nodos. Se puede desconectar un nodo, vaciar su disco o corromper un fragmento; la auditoría lo detecta por SHA-256 y la reparación lo restaura desde una copia sana.
- **Gestor de credenciales** cifrado con la misma clave, con generador de contraseñas y aviso de claves débiles o repetidas.
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
  lib/cripto.js      primitivas: derivar, cifrar, envolver claves, generador
  lib/almacen.js     IndexedDB (solo datos ya cifrados)
  lib/boveda.js      guardar, recuperar, auditar, reparar, credenciales
  lib/perfiles.js    perfiles Alpha, Obsidian, Zero-Gravity y Cold Armour
  contexto/          sesión, claves en memoria y acciones
  componentes/       portada y panel (archivos, credenciales, nodos, seguridad)
```
