// Perfiles de bóveda: cambian de verdad cómo se cifra y se reparte cada archivo.
export const PERFILES = {
  alfa: {
    clave: 'alfa', nombre: 'Alpha', lema: 'Equilibrada, para el día a día',
    fragmentos: 4, copias: 2, iteraciones: 310000, comprimir: false,
    descripcion: 'Cada archivo se cifra con AES-256-GCM, se parte en cuatro fragmentos y cada fragmento se guarda en dos nodos distintos. Sobrevive a la pérdida de un nodo cualquiera.',
    medidas: [['Redundancia', 55], ['Velocidad', 80], ['Coste de derivación', 50], ['Ahorro de espacio', 40]],
  },
  obsidian: {
    clave: 'obsidian', nombre: 'Obsidian', lema: 'Máxima resistencia',
    fragmentos: 8, copias: 3, iteraciones: 600000, comprimir: false,
    descripcion: 'Ocho fragmentos, tres copias de cada uno y 600.000 iteraciones de PBKDF2 para derivar la clave. Aguanta la caída de dos nodos a la vez y encarece al máximo un ataque a tu contraseña.',
    medidas: [['Redundancia', 95], ['Velocidad', 50], ['Coste de derivación', 100], ['Ahorro de espacio', 15]],
  },
  gravity: {
    clave: 'gravity', nombre: 'Zero-Gravity', lema: 'La más rápida',
    fragmentos: 2, copias: 2, iteraciones: 210000, comprimir: false,
    descripcion: 'Dos fragmentos por archivo y derivación ligera: abre y guarda antes que ninguna. Mantiene dos copias de cada fragmento, así que sigue tolerando la pérdida de un nodo.',
    medidas: [['Redundancia', 50], ['Velocidad', 100], ['Coste de derivación', 35], ['Ahorro de espacio', 40]],
  },
  cold: {
    clave: 'cold', nombre: 'Cold Armour', lema: 'Archivo a largo plazo',
    fragmentos: 6, copias: 3, iteraciones: 600000, comprimir: true,
    descripcion: 'Comprime con gzip antes de cifrar y guarda tres copias de cada uno de los seis fragmentos. Pensada para documentos que casi nunca abres y que no puedes perder.',
    medidas: [['Redundancia', 90], ['Velocidad', 40], ['Coste de derivación', 100], ['Ahorro de espacio', 85]],
  },
};

export const NOMBRES_NODO = ['Fráncfort', 'Reikiavik', 'Singapur', 'São Paulo', 'Montreal', 'Zúrich', 'Sídney', 'Tokio', 'Dublín', 'Ciudad del Cabo', 'Seúl', 'Oslo'];

export const configuracionInicial = (perfil = 'alfa') => ({
  perfil, nodos: Math.max(6, PERFILES[perfil].copias + 3), copias: PERFILES[perfil].copias,
});
