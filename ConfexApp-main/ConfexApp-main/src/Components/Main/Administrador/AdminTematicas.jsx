import React, { useState, useEffect, useContext, useCallback } from "react";
import { DataContext } from "../../../Context/DataContext.jsx";
import Swal from "sweetalert2";

const AdminTematicas = () => {
  const { user } = useContext(DataContext);
  const [tematicas, setTematicas] = useState([]);
  const [nuevaTematica, setNuevaTematica] = useState("");
  const [tematicaEditando, setTematicaEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const fetchTematicas = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Congresos/tematicas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error desconocido en el servidor");
      }
      const data = await response.json();
      if (tematicaEditando !== null) {
        setTematicas((prevTematicas) => {
          return data.map((nueva) => {
            const anterior = prevTematicas.find(
              (t) => t.idTematica === nueva.idTematica
            );
            if (nueva.idTematica === tematicaEditando && anterior) {
              return { ...nueva, nombre: anterior.nombre };
            }
            return nueva;
          });
        });
      } else {
        setTematicas(data);
      }
    } catch (err) {
      console.error("Error en fetchTematicas:", err);
    }
  }, [setTematicas, tematicaEditando]);

  useEffect(() => {
    fetchTematicas();
    const interval = setInterval(fetchTematicas, 30000);
    return () => clearInterval(interval);
  }, []);

  const agregarTematica = useCallback(async () => {
    if (!nuevaTematica.trim()) {
      mostrarError("El nombre de la temática no puede estar vacío");
      return;
    }

    try {
      const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Admin/nuevaTematica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idAdmin: user.idUsuario,
          nombre: nuevaTematica,
        }),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error desconocido en el servidor");
      }
      setNuevaTematica("");
      fetchTematicas();
      Swal.fire({
        icon: "success",
        title: "¡Nueva temática agregada!",
        text: "La temática se ha agregado exitosamente.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Ocurrió un error...",
        text: error.message || "Hubo un problema al agregar la temática.",
        confirmButtonText: "Reintentar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
    }
  }, [nuevaTematica, setNuevaTematica, fetchTematicas]);

  const actualizarTematica = useCallback(
    async (idTematica, nuevoNombre) => {
      try {
        const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Admin/editarTematica", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idAdmin: user.idUsuario,
            idTematica: idTematica,
            nombre: nuevoNombre,
          }),
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Error desconocido en el servidor");
        }
        setTematicaEditando(null);
        fetchTematicas();
        Swal.fire({
          icon: "success",
          title: "¡Temática editada!",
          text: "La temática se ha editado correctamente.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Ocurrió un error...",
          text: error.message || "Hubo un problema al editar la temática.",
          confirmButtonText: "Reintentar",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        });
      }
    },
    [setTematicaEditando, fetchTematicas]
  );

  const eliminarTematica = useCallback(
    async (idTematica) => {
      try {
        const result = await Swal.fire({
          title: "¿Estás seguro?",
          text: "Esta acción no se puede deshacer",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          background: "#6c757d",
          color: "#ffffff",
        });
        if (result.isConfirmed) {
          const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Admin/eliminarTematica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idAdmin: user.idUsuario,
              idTematica: idTematica,
            }),
          });
          if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || "Error desconocido en el servidor");
          }
          fetchTematicas();
          Swal.fire({
            icon: "success",
            title: "¡Temática eliminada!",
            text: "La temática se ha eliminado correctamente.",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#9b59b6",
            background: "#6c757d",
            color: "#ffffff",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Ocurrió un error...",
          text: error.message || "Hubo un problema al eliminar la temática.",
          confirmButtonText: "Reintentar",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        });
      }
    },
    [fetchTematicas]
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
                Administrar Temáticas
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
                <input
                  id="Search"
                  autoComplete="off"
                  type="text"
                  className="form-control custom-input-gold text-center fw-bold"
                  placeholder="Buscar temática..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="row d-flex justify-content-center align-items-center mb-3 w-100">
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
                    id="Add"
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
                    placeholder="Agregar nueva temática..."
                    value={nuevaTematica}
                    onChange={(e) => setNuevaTematica(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        nuevaTematica.trim().length > 0
                      ) {
                        e.preventDefault();
                        agregarTematica();
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
                    agregarTematica();
                  }}
                  disabled={nuevaTematica.trim().length < 1}
                >
                  Agregar
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
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody
                      style={{ verticalAlign: "middle", textAlign: "center" }}
                    >
                      {tematicas
                        .filter((t) =>
                          t.nombre
                            .toLowerCase()
                            .includes(busqueda.toLowerCase())
                        )
                        .map((tematica) => (
                          <tr key={tematica.idTematica} className="w-100 h-100">
                            <td>{tematica.idTematica}</td>
                            <td className="w-100 h-100">
                              <div className="d-flex justify-content-center align-items-center w-100 h-100">
                                {tematicaEditando === tematica.idTematica ? (
                                  <input
                                    type="text"
                                    className="form-control custom-input-gold text-center fw-bold"
                                    value={tematica.nombre}
                                    onChange={(e) =>
                                      setTematicas(
                                        tematicas.map((t) =>
                                          t.idTematica === tematica.idTematica
                                            ? { ...t, nombre: e.target.value }
                                            : t
                                        )
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        actualizarTematica(
                                          tematica.idTematica,
                                          tematica.nombre
                                        );
                                      }
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  tematica.nombre
                                )}
                              </div>
                            </td>
                            <td className="w-100 h-100">
                              <div className="col d-flex justify-content-center align-items-center w-100 h-100 gap-3">
                                <button
                                  type="button"
                                  className="btn btn-warning btn-sm d-flex justify-content-center align-items-center p-2 fw-bold"
                                  onClick={() =>
                                    tematicaEditando === tematica.idTematica
                                      ? actualizarTematica(
                                          tematica.idTematica,
                                          tematica.nombre
                                        )
                                      : setTematicaEditando(tematica.idTematica)
                                  }
                                >
                                  {tematicaEditando === tematica.idTematica
                                    ? "Guardar"
                                    : "Editar"}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm d-flex justify-content-center align-items-center p-2 fw-bold"
                                  onClick={() =>
                                    eliminarTematica(tematica.idTematica)
                                  }
                                >
                                  Eliminar
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

export default AdminTematicas;
