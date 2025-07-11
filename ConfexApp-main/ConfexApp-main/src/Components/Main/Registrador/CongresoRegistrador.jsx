import React, { useState } from "react";
import { FaCalendarAlt, FaUsers, FaClock, FaQrcode } from "react-icons/fa";
import { MdOutlineQrCodeScanner, MdEvent } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const CongresoRegistrador = ({ congreso, onRegistroAsistencia }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      
      return date.toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error en formato de fecha";
    }
  };

  const getEstadoCongreso = () => {
    const hoy = new Date();
    const { fechasCongreso } = congreso;
    
    try {
      if (fechasCongreso?.eventoInicio && fechasCongreso?.eventoFin) {
        const inicio = new Date(fechasCongreso.eventoInicio);
        const fin = new Date(fechasCongreso.eventoFin);
        
        // Normalize all dates to start of day for comparison
        const normalizedHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const normalizedInicio = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
        const normalizedFin = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());

        console.log('Fechas comparadas:', {
          hoy: normalizedHoy,
          inicio: normalizedInicio,
          fin: normalizedFin
        });

        if (normalizedHoy < normalizedInicio) {
          return { estado: "PRÓXIMO", clase: "badge-warning" };
        } else if (normalizedHoy >= normalizedInicio && normalizedHoy <= normalizedFin) {
          return { estado: "EN CURSO", clase: "badge-success" };
        } else {
          return { estado: "FINALIZADO", clase: "badge-secondary" };
        }
      }
      return { estado: "SIN FECHAS", clase: "badge-dark" };
    } catch (error) {
      console.error('Error al procesar fechas:', error);
      return { estado: "ERROR", clase: "badge-danger" };
    }
  };

  const { estado, clase } = getEstadoCongreso();
  const puedeRegistrar = estado === "EN CURSO";

  const handleImageError = () => {
    setImageError(true);
  };

  const handleRegistroAsistencia = () => {
    navigate(`/Main/Registro-asistencia/${congreso.idCongreso}`);
  };

  const handleReportes = () => {
    navigate(`/Main/Reportes/${congreso.idCongreso}`);
  };

  return (
    <div className="col-12 mb-4">
      <div className="card bg-dark text-white border-secondary h-100">
        <div className="row g-0 h-100">
          {/* Imagen del congreso */}
          <div className="col-md-4">
            <div className="position-relative h-100" style={{ minHeight: "200px" }}>
              {congreso.fotoCongresoBase64 && !imageError ? (
                <img
                  src={`data:${congreso.fotoCongresoBase64}`}
                  className="img-fluid rounded-start h-100 w-100"
                  alt={congreso.nombreCongreso}
                  style={{ objectFit: "cover" }}
                  onError={handleImageError}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 bg-secondary rounded-start">
                  <MdEvent size={64} className="text-muted" />
                </div>
              )}
              <span className={`badge ${clase} position-absolute top-0 start-0 m-2`}>
                {estado}
              </span>
            </div>
          </div>

          {/* Información del congreso */}
          <div className="col-md-8">
            <div className="card-body d-flex flex-column h-100">
              <div className="flex-grow-1">
                <h5 className="card-title text-warning mb-3">
                  {congreso.nombreCongreso}
                </h5>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <p className="card-text mb-2">
                      <FaCalendarAlt className="me-2 text-warning" />
                      <strong>Inicio:</strong> {formatDate(congreso.fechasCongreso.eventoInicio)}
                    </p>
                    <p className="card-text mb-2">
                      <FaCalendarAlt className="me-2 text-warning" />
                      <strong>Fin:</strong> {formatDate(congreso.fechasCongreso.eventoFin)}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="card-text mb-2">
                      <FaClock className="me-2 text-warning" />
                      <strong>Horas mínimas:</strong> {congreso.horasMinimas || "No definidas"}
                    </p>
                  </div>
                </div>

                {/* Temáticas */}
                {congreso.tematicas && (
                  <div className="mb-3">
                    <p className="card-text mb-2">
                      <strong>Temáticas:</strong>
                    </p>
                    <div className="d-flex flex-wrap gap-1">
                      {congreso.tematicas.tematicas && congreso.tematicas.tematicas.slice(0, 3).map((tematica, index) => (
                        <span key={index} className="badge bg-secondary">
                          {tematica.nombre}
                        </span>
                      ))}
                      {congreso.tematicas.tematicasExtra && congreso.tematicas.tematicasExtra.slice(0, 2).map((tematica, index) => (
                        <span key={`extra-${index}`} className="badge bg-info">
                          {tematica}
                        </span>
                      ))}
                      {(congreso.tematicas.tematicas?.length > 3 || congreso.tematicas.tematicasExtra?.length > 2) && (
                        <span className="badge bg-dark">...</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Staff info */}
                {congreso.staff && congreso.staff.length > 0 && (
                  <p className="card-text mb-3">
                    <FaUsers className="me-2 text-warning" />
                    <strong>Personal:</strong> {congreso.staff.length} miembro(s)
                  </p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="d-flex gap-2 mt-3">
                <button
                  className={`btn ${puedeRegistrar ? 'btn-warning' : 'btn-outline-warning'} d-flex align-items-center`}
                  onClick={handleRegistroAsistencia}
                  disabled={!puedeRegistrar}
                  title={puedeRegistrar ? "Registrar asistencia" : "El congreso debe estar en curso para registrar asistencia"}
                >
                  <MdOutlineQrCodeScanner className="me-2" />
                  Registrar Asistencia
                </button>
                
                <button
                  className="btn btn-outline-info d-flex align-items-center"
                  onClick={handleReportes}
                  title="Gestionar reportes de asistencia"
                >
                  <FaUsers className="me-2" />
                  Gestionar Reportes
                </button>
              </div>
              
              {/* Información adicional */}
              <div className="mt-3">
                <small className="text-muted">
                  {puedeRegistrar ? (
                    <><FaQrcode className="me-1" /> Listo para registrar asistencia</>
                  ) : estado === "PRÓXIMO" ? (
                    <>El congreso aún no ha comenzado</>
                  ) : estado === "FINALIZADO" ? (
                    <>Congreso finalizado - Solo consulta disponible</>
                  ) : (
                    <>Estado del congreso no definido</>
                  )}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongresoRegistrador;