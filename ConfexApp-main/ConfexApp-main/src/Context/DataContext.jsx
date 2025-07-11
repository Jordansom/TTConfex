import React, { createContext, useState } from "react";

export const DataContext = createContext();

export function DataContextProvider(props) {
  const [user, setUser] = useState({
    idUsuario: 0,
    nombre: null,
    apellidoPaterno: null,
    apellidoMaterno: null,
    nombreUsuario: null,
    correo: null,
    administrador: null,
    organizador: null,
    evaluador: null,
    conferencista: null,
    ponente: null,
    registrador: null,
    telefono: null,
    fotoUsuarioUrl: null,
  });

  return (
    <DataContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {props.children}
    </DataContext.Provider>
  );
}
