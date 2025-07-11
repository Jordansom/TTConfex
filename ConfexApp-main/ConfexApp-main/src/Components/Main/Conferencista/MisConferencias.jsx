import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../../Context/DataContext.jsx";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";
import { PDFDownloadLink } from "@react-pdf/renderer";
import GafetePDF from "../GafeteWrapper.jsx";
import QRCode from "qrcode";
import CongresoImage from "./CongresoImage.jsx";

const BACKEND_URL = `${process.env.REACT_APP_API_URL}`;

const MisConferencias = () => {
  const { user } = useContext(DataContext);
  const [congresos, setCongresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrBase64, setQrBase64] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.idUsuario) return;
    fetch(`${BACKEND_URL}/Congresos/congresos-conferencista?idUsuario=${user.idUsuario}`)
      .then((res) => res.json())
      .then((data) => {
        setCongresos(Array.isArray(data) ? data : []);
      })
      .catch(() => setCongresos([]))
      .finally(() => setLoading(false));
      console.log('buscando conferencias para el usuario:', user.idUsuario); // Add this debug line
  }, [user.idUsuario]);

  useEffect(() => {
    if (!user?.idUsuario) return;
    const qrData = JSON.stringify({
      id: user.idUsuario,
      nombre: user.nombre,
      apellidoPaterno: user.apellidoPaterno,
      apellidoMaterno: user.apellidoMaterno,
      rol: "Conferencista"
    });
    QRCode.toDataURL(qrData).then(setQrBase64);
  }, [user]);

  const handleDejarConferencia = async (idCongreso) => {
  const confirm = await Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas dejar de ser conferencista en este congreso?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, salir",
    cancelButtonText: "Cancelar",
    background: "#6c757d",
    color: "#fff",
  });
  
  if (confirm.isConfirmed) {
    const deleteUrl = `${BACKEND_URL}/Congresos/eliminarConferencista?idCongreso=${idCongreso}&idUsuario=${user.idUsuario}`;
    console.log('DELETE URL:', deleteUrl); // Add this debug line
    
    try {
      const res = await fetch(deleteUrl, { 
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          // Add any required headers for your API
        }
      });
      
      console.log('Response status:', res.status); // Add this debug line
      console.log('Response headers:', res.headers); // Add this debug line
      
      if (res.ok) {
        Swal.fire("Eliminado", "Has dejado de ser conferencista en este congreso.", "success");
        setCongresos(congresos.filter((c) => c.idCongreso !== idCongreso));
      } else {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        Swal.fire("Error", `No se pudo eliminar tu registro. Status: ${res.status}`, "error");
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Swal.fire("Error", "Error de conexión al servidor.", "error");
    }
  }
};
  // Función mejorada para obtener la URL de la imagen del congreso (para el PDF)
  const getCongresoImageUrl = (congreso) => {
    if (congreso.idCongreso) {
      return `${BACKEND_URL}/Congresos/fotoCongreso/${congreso.idCongreso}`;
    }
    
    if (!congreso.fotoCongresoUrl) {
      return "https://cdn-icons-png.flaticon.com/512/1077/1077063.png";
    }
    
    // Si ya es una URL completa, la devolvemos tal como está
    if (congreso.fotoCongresoUrl.startsWith("http")) {
      return congreso.fotoCongresoUrl;
    }
    
    // Si es una ruta relativa, agregamos el BACKEND_URL
    return `${BACKEND_URL}${congreso.fotoCongresoUrl}`;
  };


  const getGafeteData = (congreso) => ({
    user: {
      idUsuario: user.idUsuario,
      nombre: user.nombre,
      apellidoPaterno: user.apellidoPaterno,
      apellidoMaterno: user.apellidoMaterno,
      correo: user.correo,
      telefono: user.telefono,
      // La foto del congreso sustituye a la del usuario
      fotoUsuarioUrl: congreso.fotoCongresoUrl ? `/Congresos/fotoCongreso/${congreso.idCongreso}` : null,
      roles: ["Conferencista"],
    },
    congresoNombre: congreso.nombreCongreso,
    congresoLogoUrl: getCongresoImageUrl(congreso),
    qrCodeDataUrl: qrBase64,
    watermarkType: "logo",
    rol: "Conferencista",
  });

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="w-100 d-flex justify-content-center">
      <div className="custom-scrollbar text-start w-100 p-0 px-3" style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
          <div className="mb-3 mb-md-0 px-5 pt-2 px-md-0 ps-md-5">
            <h3 className="custom-font-titleArticle-gold text-center">
              Conferencias donde soy Conferencista
            </h3>
          </div>
        </div>
        <div className="row d-flex justify-content-center align-items-center py-md-3 px-md-5">
          {congresos.length === 0 ? (
            <div className="mb-4 mb-md-5 p-3 bg-dark bg-dark2 rounded">
              <div className="row d-flex flex-column align-items-center justify-content-center container-custom">
                <p className="text-center custom-font-normalArticle">
                  No estás registrado como Conferencista en ningún congreso.
                </p>
              </div>
            </div>
          ) : (
            congresos.map((congreso) => (
              <div key={congreso.idCongreso} className="row">
                <div 
                  className="mb-4 mb-md-5 p-3 bg-dark bg-dark2 rounded"
                  style={{
                    border: "2px solid #B8860B",
                    boxShadow: "0 0 15px rgba(184, 134, 11, 0.5)",
                  }}
                >
                  <div className="row d-flex align-items-center justify-content-center container-custom">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100">
                      <div className="d-flex flex-column flex-md-row align-items-center gap-3 mb-3 mb-md-0">
                        <div className="d-flex justify-content-center">
                          <CongresoImage
                            congreso={congreso}
                            className="custom-profile-img img-fluid"
                            style={{ 
                              width: "80px", 
                              height: "80px", 
                              objectFit: "cover",
                              borderRadius: "8px"
                            }}
                            alt={`Logo del congreso ${congreso.nombreCongreso || 'Congreso'}`}
                          />
                        </div>
                        <div className="text-center text-md-start">
                          <h5 className="custom-font-subtitleArticle2-gold mb-2">
                            {congreso.nombreCongreso || "Nombre del congreso"}
                          </h5>
                          {congreso.tematicas && congreso.tematicas.tematicas?.length > 0 && (
                            <p className="custom-font-normalArticle mb-2">
                              <strong>Temáticas:</strong> {congreso.tematicas.tematicas.map(t => t.nombre).join(", ")}
                            </p>
                          )}
                          <p className="custom-font-normalArticle mb-1">
                            <strong>Evento:</strong>{" "}
                            {congreso.fechasCongreso?.eventoInicio
                              ? new Date(congreso.fechasCongreso.eventoInicio).toLocaleString(undefined, {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })
                              : "N/A"}{" "}
                            -{" "}
                            {congreso.fechasCongreso?.eventoFin
                              ? new Date(congreso.fechasCongreso.eventoFin).toLocaleString(undefined, {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })
                              : "N/A"}
                          </p>
                          {congreso.ubicacion && (
                            <div className="custom-font-normalArticle">
                              <strong>Ubicación:</strong>{" "}
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${congreso.ubicacion.latitud},${congreso.ubicacion.longitud}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none text-light"
                                style={{ color: "#B8860B" }}
                              >
                                Ver en Google Maps
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="d-flex flex-column flex-md-row gap-2 align-items-center">
                        <button
                          className="btn custom-btn-gold3"
                          onClick={() => navigate(`/Main/Congreso/${congreso.idCongreso}`)}
                        >
                          Visualizar Congreso
                        </button>
                        <PDFDownloadLink
                          document={
                            <GafetePDF
                              {...getGafeteData(congreso)}
                            />
                          }
                          fileName={`Gafete_${congreso.nombreCongreso || 'Congreso'}.pdf`}
                        >
                          {({ loading }) => (
                            <button 
                              className={`btn ${loading ? 'custom-btn-gold2' : 'custom-btn-gold3'}`} 
                              disabled={loading}
                            >
                              {loading ? 'Generando Gafete...' : 'Descargar Gafete'}
                            </button>
                          )}
                        </PDFDownloadLink>
                        <button
                          className="btn custom-btn-gold3"
                          title="Dejar conferencia"
                          onClick={() => handleDejarConferencia(congreso.idCongreso)}
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MisConferencias;
