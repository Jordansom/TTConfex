import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { DataContext } from "../../../Context/DataContext.jsx";
import { MdOutlineQrCodeScanner, MdArrowBack, MdPeople, MdEvent } from "react-icons/md";
import { FaCalendarAlt, FaClock, FaUsers } from "react-icons/fa";

const RegistroCongreso = () => {
  const { idCongreso } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(DataContext);
  const { isSidebarOpen } = useOutletContext();
  
  const [congreso, setCongreso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCongreso = async () => {
      try {
        // Aquí harías la llamada para obtener los detalles del congreso específico
        // Por ahora, simularemos la carga
        setLoading(true);
        
        // Simulación de carga (reemplazar con llamada real a la API)
        setTimeout(() => {
          setCongreso({
            idCongreso: idCongreso,
            nombreCongreso: "Congreso de Ejemplo",
            fechasCongreso: {
              eventoInicio: new Date(),
              eventoFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            horasMinimas: 8
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Error al cargar el congreso");
        setLoading(false);
      }
    };

    fetchCongreso();
  }, [idCongreso]);

  const handleBack = () => {
    navigate("/Main/Mis-registros");
  };

  const formatDate = (date) => {
    if (!date) return "No definida";
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container">
        <div className={`d-flex justify-content-center align-items-center ${
          isSidebarOpen ? "main-content-padding" : "main-content-padding2"
        }`} style={{ minHeight: "50vh" }}>
          <div className="text-center">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3">Cargando información del congreso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className={`${isSidebarOpen ? "main-content-padding" : "main-content-padding2"}`}>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error</h4>
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={handleBack}>
              Volver a Mis Registros
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={`${isSidebarOpen ? "main-content-padding" : "main-content-padding2"}`}>
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <button
              className="btn btn-outline-secondary mb-3"
              onClick={handleBack}
            >
              <MdArrowBack className="me-2" />
              Volver a Mis Registros
            </button>
            <h2 className="custom-font-titleArticle-gold">
              <MdOutlineQrCodeScanner className="me-2" />
              Registro de Asistencia
            </h2>
          </div>
        </div>

        {/* Información del Congreso */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-dark text-white">
              <div className="card-header">
                <h5 className="card-title text-warning mb-0">
                  <MdEvent className="me-2" />
                  {congreso?.nombreCongreso}
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p className="card-text">
                      <FaCalendarAlt className="me-2 text-warning" />
                      <strong>Inicio:</strong> {formatDate(congreso?.fechasCongreso?.eventoInicio)}
                    </p>
                    <p className="card-text">
                      <FaCalendarAlt className="me-2 text-warning" />
                      <strong>Fin:</strong> {formatDate(congreso?.fechasCongreso?.eventoFin)}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="card-text">
                      <FaClock className="me-2 text-warning" />
                      <strong>Horas mínimas:</strong> {congreso?.horasMinimas || "No definidas"}
                    </p>
                    <p className="card-text">
                      <FaUsers className="me-2 text-warning" />
                      <strong>Registrador:</strong> {user.nombre} {user.apellidoPaterno}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Registro */}
        <div className="row">
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <MdPeople className="me-2" />
                  Opciones de Registro
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <MdOutlineQrCodeScanner size={48} className="text-warning mb-3" />
                        <h6 className="card-title">Escanear QR</h6>
                        <p className="card-text text-muted">
                          Escanea el código QR de los asistentes para registrar su asistencia
                        </p>
                        <button className="btn btn-warning">
                          Iniciar Escáner QR
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <FaUsers size={48} className="text-info mb-3" />
                        <h6 className="card-title">Registro Manual</h6>
                        <p className="card-text text-muted">
                          Registra manualmente la asistencia buscando por nombre o email
                        </p>
                        <button className="btn btn-info">
                          Registro Manual
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card bg-secondary text-white">
              <div className="card-body">
                <h6 className="card-title">Estadísticas de Hoy</h6>
                <div className="row text-center">
                  <div className="col-3">
                    <h4>0</h4>
                    <small>Registros Hoy</small>
                  </div>
                  <div className="col-3">
                    <h4>0</h4>
                    <small>Total Asistentes</small>
                  </div>
                  <div className="col-3">
                    <h4>0</h4>
                    <small>Última Hora</small>
                  </div>
                  <div className="col-3">
                    <h4>0%</h4>
                    <small>Capacidad</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroCongreso;