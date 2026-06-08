import React, { createContext, useContext, useState, useEffect } from 'react';

const ContextoSeguridad = createContext();

export function ProveedorSeguridad({ children }) {
  const [usuario, establecerUsuario] = useState(null);
  const [llaveMaestra, establecerLlaveMaestra] = useState('');
  const [archivosBoveda, establecerArchivosBoveda] = useState([]);
  const [configuracionBoveda, establecerConfiguracionBoveda] = useState({
    nodos: 8,
    copias: 2,
    tipoBoveda: 'Vault Alpha v4',
    precioBase: 650
  });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('nextvault_usuario');
    const llaveGuardada = localStorage.getItem('nextvault_llave');
    const archivosGuardados = localStorage.getItem('nextvault_archivos');
    
    if (usuarioGuardado) {
      establecerUsuario(JSON.parse(usuarioGuardado));
    }
    if (llaveGuardada) {
      establecerLlaveMaestra(llaveGuardada);
    }
    if (archivosGuardados) {
      establecerArchivosBoveda(JSON.parse(archivosGuardados));
    }
  }, []);

  const iniciarSesion = (correo, contrasena) => {
    const nuevoUsuario = { correo };
    establecerUsuario(nuevoUsuario);
    localStorage.setItem('nextvault_usuario', JSON.stringify(nuevoUsuario));
    return true;
  };

  const registrarUsuario = (correo, contrasena) => {
    const nuevoUsuario = { correo };
    establecerUsuario(nuevoUsuario);
    localStorage.setItem('nextvault_usuario', JSON.stringify(nuevoUsuario));
    return true;
  };

  const cerrarSesion = () => {
    establecerUsuario(null);
    establecerLlaveMaestra('');
    establecerArchivosBoveda([]);
    localStorage.removeItem('nextvault_usuario');
    localStorage.removeItem('nextvault_llave');
    localStorage.removeItem('nextvault_archivos');
  };

  const actualizarLlaveMaestra = (nuevaLlave) => {
    establecerLlaveMaestra(nuevaLlave);
    localStorage.setItem('nextvault_llave', nuevaLlave);
  };

  const actualizarConfiguracion = (nuevaConfig) => {
    establecerConfiguracionBoveda((anterior) => ({
      ...anterior,
      ...nuevaConfig
    }));
  };

  const registrarArchivo = (archivo) => {
    establecerArchivosBoveda((anteriores) => {
      const actualizados = [...anteriores, archivo];
      localStorage.setItem('nextvault_archivos', JSON.stringify(actualizados));
      return actualizados;
    });
  };

  const actualizarEstadoArchivo = (archivoId, nuevoEstado) => {
    establecerArchivosBoveda((anteriores) => {
      const actualizados = anteriores.map((f) => 
        f.id === archivoId ? { ...f, estado: nuevoEstado } : f
      );
      localStorage.setItem('nextvault_archivos', JSON.stringify(actualizados));
      return actualizados;
    });
  };

  const eliminarArchivo = (archivoId) => {
    establecerArchivosBoveda((anteriores) => {
      const actualizados = anteriores.filter((f) => f.id !== archivoId);
      localStorage.setItem('nextvault_archivos', JSON.stringify(actualizados));
      return actualizados;
    });
  };

  return (
    <ContextoSeguridad.Provider
      value={{
        usuario,
        llaveMaestra,
        archivosBoveda,
        configuracionBoveda,
        iniciarSesion,
        registrarUsuario,
        cerrarSesion,
        actualizarLlaveMaestra,
        actualizarConfiguracion,
        registrarArchivo,
        actualizarEstadoArchivo,
        eliminarArchivo
      }}
    >
      {children}
    </ContextoSeguridad.Provider>
  );
}

export function useSeguridad() {
  const contexto = useContext(ContextoSeguridad);
  if (!contexto) {
    throw new Error('useSeguridad debe ser utilizado dentro de un ProveedorSeguridad');
  }
  return contexto;
}
