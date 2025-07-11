import React, { useState, useEffect, useContext, useCallback } from "react";
import { DataContext } from "../../../Context/DataContext.jsx";
import Swal from "sweetalert2";

const AdminOrganizadores = () => {
  const { user } = useContext(DataContext);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Admin/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idAdmin: user.idUsuario }),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error desconocido en el servidor");
      }
      const data = await response.json();
      setUsuarios(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Ocurrió un error...",
        text: err.message || "Hubo un problema al buscar los usuarios.",
        confirmButtonText: "Reintentar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
    }
  }, [user, setUsuarios]);

  const fetchFilteredUsuarios = useCallback(async () => {
    try {
      const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Admin/filteredUsuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idAdmin: user.idUsuario,
          identificadorUsuario: busqueda,
        }),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error desconocido en el servidor");
      }
      const data = await response.json();
      setUsuarios([data]);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Ocurrió un error...",
        text: err.message || "Hubo un problema al buscar el usuario.",
        confirmButtonText: "Reintentar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
    }
  }, [busqueda, setUsuarios, setBusqueda]);

  useEffect(() => {
    if (busqueda.length < 5) {
      fetchUsuarios();
      const interval = setInterval(fetchUsuarios, 30000);
      return () => clearInterval(interval);
    }
  }, [usuarios, busqueda]);

  const toggleOrganizador = useCallback(
    async (idUsuario, organizador) => {
      try {
        const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Admin/toggleOrganizador", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idAdmin: user.idUsuario,
            identificadorUsuario: idUsuario,
            organizador: organizador,
          }),
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Error desconocido en el servidor");
        }
        busqueda.length < 5 ? fetchUsuarios() : fetchFilteredUsuarios();
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: `Usuario ${
            !organizador ? "promovido a" : "removido como"
          } organizador`,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        });
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al actualizar el rol",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        });
      }
    },
    [user, busqueda, fetchUsuarios, fetchFilteredUsuarios]
  );

  return (
    <>
      <div className="w-100 d-flex justify-content-center">
        <div
          className="custom-scrollbar text-start w-100 p-0 px-3"
          style={{
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-md-5 pt-2 w-100">
            <div className="col-auto mb-3 mb-md-0 ps-sm-5">
              <h3
                className="custom-font-titleArticle-gold text-center"
                style={{ width: "min-content" }}
              >
                Administrar Organizadores
              </h3>
            </div>
            <div className="col d-flex justify-content-center justify-content-md-end w-100">
              <div
                className="h-100 w-100"
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "stretch",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.07)",
                    border: "2px solid #B8860B",
                    borderRadius: "30px 0 0 30px",
                    display: "flex",
                    padding: "10px",
                    marginRight: "-2px",
                  }}
                >
                  <input
                    id="Search"
                    autoComplete="off"
                    type="text"
                    className="fw-bold custom-input-trasnparent text-center"
                    style={{
                      border: "none",
                      boxShadow: "none",
                      background: "transparent",
                      outline: "none",
                      width: "100%",
                      height: "100%",
                      fontFamily: "Jura, sans-serif",
                      fontSize: "clamp(15px, 3vw, 22px)",
                      padding: "5px",
                      color: "#fff",
                      borderRadius: "30px 0 0 0",
                      textAlign: "center",
                      alignSelf: "flex-start",
                      display: "flex",
                      alignItems: "flex-start",
                    }}
                    placeholder="Buscar por nombre o correo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && busqueda.trim().length >= 5) {
                        e.preventDefault();
                        fetchFilteredUsuarios();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline-light custom-btn-gold2 fw-bold"
                  style={{
                    borderRadius: "0 30px 30px 0",
                    padding: "0px 18px",
                    borderLeft: "none",
                    marginLeft: 0,
                    height: "auto",
                    alignSelf: "stretch",
                  }}
                  onClick={() => {
                    fetchFilteredUsuarios();
                  }}
                  disabled={busqueda.trim().length < 5}
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
          <div className="row d-flex justify-content-center align-items-center py-md-3 px-3">
            <div className="mb-4 mb-md-5 p-3 bg-dark bg-dark2 rounded">
              <div className="row d-flex align-items-center justify-content-center h-100 w-100 px-2">
                <div className="table-responsive mt-2">
                  <table className="table table-dark table-hover custom-font-subtitleArticle-gold custom-font-normalArticle w-100 h-100">
                    <thead
                      style={{ verticalAlign: "middle", textAlign: "center" }}
                    >
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Nombre de Usuario</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody
                      style={{ verticalAlign: "middle", textAlign: "center" }}
                    >
                      {usuarios.map((usuario) => (
                        <tr key={usuario.idUsuario} className="w-100 h-100">
                          <td>
                            {`${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`}
                          </td>
                          <td>{usuario.correo}</td>
                          <td>{usuario.nombreUsuario}</td>
                          <td className="w-100 h-100">
                            <div className="d-flex justify-content-center align-items-center w-100 h-100">
                              <button
                                type="button"
                                className={`btn btn-${
                                  usuario.organizador ? "danger" : "success"
                                } btn-sm d-flex justify-content-center align-items-center p-2 fw-bold`}
                                onClick={() =>
                                  toggleOrganizador(
                                    usuario.idUsuario,
                                    usuario.organizador
                                  )
                                }
                              >
                                {usuario.organizador
                                  ? "Quitar Organizador"
                                  : "Hacer Organizador"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOrganizadores;
