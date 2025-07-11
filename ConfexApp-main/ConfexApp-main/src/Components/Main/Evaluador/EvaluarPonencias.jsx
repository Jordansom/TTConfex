import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { DataContext } from "../../../Context/DataContext.jsx";
import Swal from "sweetalert2";

// Cambia la URL base según entorno
const BACKEND_URL =
  window.location.hostname.includes("azurestaticapps.net")
    ? `${process.env.REACT_APP_API_URL}`
    : "http://localhost:8080";

// Componente para el círculo de estado visual
const EstadoCirculo = ({ estado }) => {
  let color = "rgba(0,0,0,0.15)";
  if (estado === "aceptado") color = "#28a745";
  else if (estado === "rechazado") color = "#dc3545";
  else if (estado === "devuelto") color = "#ffc107";
  // sin revisar: transparente o gris claro
  return (
    <span
      title={estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : "Sin revisar"}
      style={{
        display: "inline-block",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: color,
        border: "2px solid #ccc",
        marginRight: 8,
        verticalAlign: "middle",
      }}
    />
  );
};

const EvaluarPonencias = () => {
  const { idCongreso } = useParams();
  const { user } = useContext(DataContext);
  const [ponencias, setPonencias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener dictamenes de las ponencias
  useEffect(() => {
    fetch(`${BACKEND_URL}/Congresos/evaluador/ponencias?idCongreso=${idCongreso}&idUsuario=${user.idUsuario}`)
      .then((res) => res.json())
      .then(async (data) => {
        // Para cada ponencia, consulta el dictamen (puedes optimizar con un endpoint batch si lo tienes)
        const ponenciasConEstado = await Promise.all(
          data.map(async (p) => {
            try {
              const res = await fetch(`${BACKEND_URL}/Congresos/dictamen?idCongreso=${idCongreso}&idPonencia=${p.idPonencia}`);
              if (res.ok) {
                const dictamen = await res.json();
                return { ...p, estado: dictamen.veredicto };
              }
            } catch {}
            return { ...p, estado: null };
          })
        );
        setPonencias(Array.isArray(ponenciasConEstado) ? ponenciasConEstado : []);
      })
      .catch(() => setPonencias([]))
      .finally(() => setLoading(false));
  }, [idCongreso, user.idUsuario]);

  const handleEvaluar = async (idEvaluarPonencia, decision) => {
    let comentario = "";
    if (decision === "rechazado" || decision === "devuelto") {
      const { value } = await Swal.fire({
        title: decision === "rechazado" ? "Motivo de rechazo" : "Motivo de devolución",
        input: "textarea",
        inputLabel: "Agrega un comentario para el ponente (opcional)",
        inputPlaceholder: "Escribe aquí el motivo o sugerencias...",
        inputAttributes: {
          "aria-label": "Comentario para el ponente",
        },
        showCancelButton: true,
        confirmButtonText: "Enviar",
        cancelButtonText: "Cancelar",
        background: "#23272b",
        color: "#fff",
      });
      if (value === undefined) return; // Cancelado
      comentario = value || "";
    }

    const res = await fetch(`${BACKEND_URL}/Congresos/evaluador/evaluar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idEvaluarPonencia, decision, comentario }),
    });
    if (res.ok) {
      Swal.fire("¡Éxito!", "Evaluación registrada.", "success");
      setPonencias((prev) =>
        prev.map((p) => (p.idEvaluarPonencia === idEvaluarPonencia ? { ...p, estado: decision } : p))
      );
    } else {
      Swal.fire("Error", "No se pudo registrar la evaluación.", "error");
    }
  };

  // Función para visualizar o descargar la ponencia
  const handleVerPonencia = (idPonencia, download = false) => {
    const url = `${BACKEND_URL}/Congresos/ponencia/pdf/${idPonencia}${download ? "?download=1" : ""}`;
    window.open(url, "_blank");
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container mt-4">
      <h3 className="custom-font-titleArticle-gold text-center mb-4">
        Ponencias asignadas para evaluación
      </h3>
      {ponencias.length === 0 ? (
        <p className="custom-font-normalArticle text-center">
          No tienes ponencias asignadas para evaluar.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-hover rounded shadow custom-font-normalArticle">
            <thead>
              <tr>
                <th style={{ minWidth: 40 }}></th>
                <th>Título</th>
                <th>Autor</th>
                <th>PDF</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ponencias.map((p) => (
                <tr key={p.idEvaluarPonencia}>
                  <td>
                    <EstadoCirculo estado={p.estado} />
                  </td>
                  <td className="fw-bold">{p.titulo}</td>
                  <td>{p.autor}</td>
                  <td>
                    <button
                      onClick={() => handleVerPonencia(p.idPonencia, false)}
                      className="btn btn-outline-primary btn-sm me-2"
                    >
                      Visualizar
                    </button>
                    <button
                      onClick={() => handleVerPonencia(p.idPonencia, true)}
                      className="btn btn-outline-success btn-sm"
                    >
                      Descargar
                    </button>
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        className="btn custom-btn-gold3"
                        onClick={() => handleEvaluar(p.idEvaluarPonencia, "aceptado")}
                        style={{ minWidth: 90 }}
                      >
                        Aceptar
                      </button>
                      <button
                        className="btn custom-btn-gold3"
                        onClick={() => handleEvaluar(p.idEvaluarPonencia, "rechazado")}
                        style={{ minWidth: 90 }}
                      >
                        Rechazar
                      </button>
                      <button
                        className="btn custom-btn-gold3"
                        onClick={() => handleEvaluar(p.idEvaluarPonencia, "devuelto")}
                        style={{ minWidth: 90 }}
                      >
                        Devolver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EvaluarPonencias;
