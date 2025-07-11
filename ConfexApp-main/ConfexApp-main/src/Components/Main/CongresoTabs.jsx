import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { DataContext } from "../../Context/DataContext.jsx";
import Swal from "sweetalert2";

// Tabs
const tabs = [
  "Información General",
  "Periodos del Congreso",
  "Ubicación",
  "Staff",
  "Convocatoria",
  "Pronentes"
];

const MAPS_API_KEY = "GooglekeyHere"; // Reemplaza con tu clave de API de Google Maps
const GOOGLE_MAPS_LIBRARIES = ["places"];

const TabContent = ({ activeTab, congreso, isLoaded, user, navigate }) => {
  if (!congreso) return null;
  switch (activeTab) {
    case 0:
      // --- NUEVO: Acciones reales para los botones con SweetAlert2 ---
      const handleAgregarAsistente = async () => {
        if (!user?.idUsuario) {
          await Swal.fire({
            icon: "warning",
            title: "Inicia sesión",
            text: "Debes iniciar sesión para registrarte como asistente.",
            confirmButtonColor: "#b8860b",
            background: "#23272b",
            color: "#fff"
          });
          return;
        }
        const res = await fetch(`${process.env.REACT_APP_API_URL}/Congresos/registrador/asistencia/${congreso.idCongreso}/registrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idUsuario: user.idUsuario }),
        });
        if (res.ok) {
          await Swal.fire({
            icon: "success",
            title: "¡Registro exitoso!",
            text: "Te has registrado como asistente.",
            confirmButtonColor: "#b8860b",
            background: "#23272b",
            color: "#fff"
          });
        } else {
          const msg = await res.text();
          await Swal.fire({
            icon: "error",
            title: "No se pudo registrar",
            text: msg,
            confirmButtonColor: "#b8860b",
            background: "#23272b",
            color: "#fff"
          });
        }
      };

      const handleSubirPonencia = async () => {
        if (!user?.idUsuario) {
          await Swal.fire({
            icon: "warning",
            title: "Inicia sesión",
            text: "Debes iniciar sesión para participar como ponente.",
            confirmButtonColor: "#b8860b",
            background: "#23272b",
            color: "#fff"
          });
          return;
        }
        // Seleccionar temática
        const tematicas = Array.isArray(congreso.tematicas?.tematicas)
          ? congreso.tematicas.tematicas
          : [];
        if (tematicas.length === 0) {
          await Swal.fire({
            icon: "info",
            title: "Sin temáticas",
            text: "Este congreso no tiene temáticas disponibles.",
            confirmButtonColor: "#b8860b",
            background: "#23272b",
            color: "#fff"
          });
          return;
        }
        const { value: idTematica } = await Swal.fire({
          title: "Selecciona la temática",
          input: "select",
          inputOptions: Object.fromEntries(
            tematicas.map((t) => [t.idTematica, t.nombre])
          ),
          inputPlaceholder: "Selecciona una temática",
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#b8860b",
          background: "#23272b",
          color: "#fff",
          inputValidator: (value) => !value && "Debes seleccionar una temática"
        });
        if (!idTematica) return;

        // Seleccionar archivo
        const { value: file } = await Swal.fire({
          title: "Selecciona tu ponencia",
          input: "file",
          inputAttributes: {
            accept: "application/pdf",
            "aria-label": "Sube tu ponencia en PDF"
          },
          confirmButtonText: "Subir",
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#b8860b",
          background: "#23272b",
          color: "#fff"
        });

        if (file) {
          if (file.type !== "application/pdf") {
            await Swal.fire({
              icon: "error",
              title: "Archivo inválido",
              text: "Solo se permiten archivos PDF.",
              confirmButtonColor: "#b8860b",
              background: "#23272b",
              color: "#fff"
            });
            return;
          }
          if (file.size > 50 * 1024 * 1024) {
            await Swal.fire({
              icon: "error",
              title: "Archivo demasiado grande",
              text: "El archivo excede los 50MB.",
              confirmButtonColor: "#b8860b",
              background: "#23272b",
              color: "#fff"
            });
            return;
          }
          const formData = new FormData();
          formData.append("idCongreso", congreso.idCongreso);
          formData.append("idUsuario", user.idUsuario);
          formData.append("idTematica", idTematica);
          formData.append("archivo", file);
          const res = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Congresos/subirPonencia", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            await Swal.fire({
              icon: "success",
              title: "¡Ponencia subida correctamente!",
              text: "Tu ponencia ha sido registrada o actualizada.",
              confirmButtonColor: "#b8860b",
              background: "#23272b",
              color: "#fff"
            });
          } else {
            const msg = await res.text();
            await Swal.fire({
              icon: "error",
              title: "No se pudo subir la ponencia",
              text: msg,
              confirmButtonColor: "#b8860b",
              background: "#23272b",
              color: "#fff"
            });
          }
        }
      };

      return (
        <div>
          <h4 className="custom-font-subtitleArticle2-gold">{congreso.nombreCongreso}</h4>
          <p className="custom-font-normalArticle"><b>Correo de contacto:</b> {congreso.correoContacto || "N/A"}</p>
          <p className="custom-font-normalArticle"><b>Teléfono:</b> {congreso.telefonoContacto || "N/A"}</p>
          <p className="custom-font-normalArticle"><b>Sitio Web:</b> {congreso.sitioWeb ? <a href={congreso.sitioWeb} target="_blank" rel="noopener noreferrer">{congreso.sitioWeb}</a> : "N/A"}</p>
          <p className="custom-font-normalArticle"><b>Temáticas:</b> {(congreso.tematicas?.tematicas || []).map(t => t.nombre).join(", ")}</p>
          <p className="custom-font-normalArticle"><b>Temáticas extra:</b> {(congreso.tematicas?.tematicasExtra || []).join(", ")}</p>
          {/* Botones de registro como asistente y ponente */}
          <div className="mt-4 d-flex gap-3">
            <button
              className="btn custom-btn-gold3"
              onClick={handleAgregarAsistente}
            >
              Registrarse como Asistente
            </button>
            <button
              className="btn custom-btn-gold3"
              onClick={handleSubirPonencia}
            >
              Participar como Ponente
            </button>
          </div>
        </div>
      );
    case 1:
      return (
        <div>
          <p className="custom-font-normalArticle"><b>Convocatoria:</b> {new Date(congreso.fechasCongreso.convocatoriaInicio).toLocaleString()} - {new Date(congreso.fechasCongreso.convocatoriaFin).toLocaleString()}</p>
          <p className="custom-font-normalArticle"><b>Evaluación:</b> {new Date(congreso.fechasCongreso.evaluacionInicio).toLocaleString()} - {new Date(congreso.fechasCongreso.evaluacionFin).toLocaleString()}</p>
          <p className="custom-font-normalArticle"><b>Dictamen:</b> {new Date(congreso.fechasCongreso.dictamenInicio).toLocaleString()} - {new Date(congreso.fechasCongreso.dictamenFin).toLocaleString()}</p>
          <p className="custom-font-normalArticle"><b>Evento:</b> {new Date(congreso.fechasCongreso.eventoInicio).toLocaleString()} - {new Date(congreso.fechasCongreso.eventoFin).toLocaleString()}</p>
        </div>
      );
    case 2:
      // Mapa solo visualización, sin cuadro de búsqueda ni edición
      return (
        <div style={{ height: "350px", width: "100%" }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={{
                lat: congreso.ubicacion.latitud,
                lng: congreso.ubicacion.longitud,
              }}
              zoom={16}
              options={{
                disableDefaultUI: true,
                draggable: false,
                clickableIcons: false,
                gestureHandling: "none",
                keyboardShortcuts: false,
                scrollwheel: false,
                disableDoubleClickZoom: true,
                styles: [
                  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                  {
                    featureType: "administrative.locality",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#d59563" }],
                  },
                  {
                    featureType: "poi",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#d59563" }],
                  },
                  {
                    featureType: "poi.park",
                    elementType: "geometry",
                    stylers: [{ color: "#263c3f" }],
                  },
                  {
                    featureType: "poi.park",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#6b9a76" }],
                  },
                  {
                    featureType: "road",
                    elementType: "geometry",
                    stylers: [{ color: "#38414e" }],
                  },
                  {
                    featureType: "road",
                    elementType: "geometry.stroke",
                    stylers: [{ color: "#212a37" }],
                  },
                  {
                    featureType: "road",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#9ca5b3" }],
                  },
                  {
                    featureType: "road.highway",
                    elementType: "geometry",
                    stylers: [{ color: "#746855" }],
                  },
                  {
                    featureType: "road.highway",
                    elementType: "geometry.stroke",
                    stylers: [{ color: "#1f2835" }],
                  },
                  {
                    featureType: "road.highway",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#f3d19c" }],
                  },
                  {
                    featureType: "transit",
                    elementType: "geometry",
                    stylers: [{ color: "#2f3948" }],
                  },
                  {
                    featureType: "transit.station",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#d59563" }],
                  },
                  {
                    featureType: "water",
                    elementType: "geometry",
                    stylers: [{ color: "#17263c" }],
                  },
                  {
                    featureType: "water",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#515c6d" }],
                  },
                  {
                    featureType: "water",
                    elementType: "labels.text.stroke",
                    stylers: [{ color: "#17263c" }],
                  },
                ],
              }}
            >
              <Marker
                position={{
                  lat: congreso.ubicacion.latitud,
                  lng: congreso.ubicacion.longitud,
                }}
                draggable={false}
              />
            </GoogleMap>
          ) : (
            <div>Cargando mapa...</div>
          )}
        </div>
      );
    case 3:
      return (
        <div>
          <h5 className="custom-font-subtitleArticle2-gold">Staff</h5>
          <ul>
            {congreso.staff?.map((s, i) => (
              <li key={i} className="custom-font-normalArticle">
                {s.nombre} {s.apellidoPaterno} {s.apellidoMaterno} -{" "}
                {s.evaluador && "Evaluador "}
                {s.registrador && "Registrador "}
                {s.conferencista && "Conferencista "}
                {s.ponente && "Ponente "}
              </li>
            ))}
          </ul>
        </div>
      );
    case 4:
      return (
        <div>
          <h5 className="custom-font-subtitleArticle2-gold">Convocatoria</h5>
          <p className="custom-font-normalArticle">
            {/* Aquí podrías mostrar un link o preview del PDF si lo tienes */}
            No hay convocatoria disponible para visualizar.
          </p>
        </div>
      );
    case 5:
      return (
        <div>
          <h5 className="custom-font-subtitleArticle2-gold">Memoria</h5>
          <p className="custom-font-normalArticle">Contenido pendiente.</p>
        </div>
      );
    default:
      return null;
  }
};

const CongresoTabs = () => {
  const { idCongreso } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [congreso, setCongreso] = useState(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const { user } = useContext(DataContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Congresos/${idCongreso}`)
      .then((res) => res.json())
      .then((data) => setCongreso(data))
      .catch(() => setCongreso(null));
  }, [idCongreso]);

  return (
    <div className="w-100 d-flex justify-content-center">
      <div className="custom-scrollbar text-start w-100 p-0 px-3" style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
          <div className="mb-3 mb-md-0 px-5 pt-2 px-md-0 ps-md-5">
            <h3 className="custom-font-titleArticle-gold text-center">
              Detalles del Congreso
            </h3>
          </div>
        </div>
        <nav className="tabs-nav mb-4 d-flex flex-row flex-wrap gap-2">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`tab-button btn custom-btn-gold3 mx-1 ${activeTab === index ? "active" : ""}`}
              onClick={() => setActiveTab(index)}
              style={{ minWidth: 120 }}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="tab-content bg-dark bg-dark2 p-4 rounded shadow-sm mb-4">
          <TabContent
            activeTab={activeTab}
            congreso={congreso}
            isLoaded={isLoaded}
            user={user}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
};

export default CongresoTabs;