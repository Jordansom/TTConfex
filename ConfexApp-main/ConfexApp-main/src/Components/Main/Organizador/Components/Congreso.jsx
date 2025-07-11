import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DataContext } from "../../../../Context/DataContext.jsx";

const Congreso = ({ congreso, isLast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(DataContext);

  // Solo habilita "Editar Congreso" si el usuario es organizador y está en MisCongresos
  const isMisCongresos = location.pathname.includes("/Mis-congresos");
  const puedeEditar = user?.organizador && isMisCongresos;

  return (
    <div
      className={`p-3 bg-dark bg-dark2 rounded ${
        isLast ? "" : "mb-4 mb-md-5"
      } w-100 d-flex justify-content-center align-items-center`}
      style={{
        border: "2px solid #B8860B",
        boxShadow: "0 0 15px rgba(184, 134, 11, 0.5)",
      }}
    >
      <div className="row d-flex flex-column align-items-center justify-content-center container-custom w-100">
        <div className="row d-flex align-items-center justify-content-center px-2 px-md-4 custom-responsive-row">
          <div className="col-4 col-md-3 d-flex align-items-center justify-content-center px-0 h-100 mb-2 mb-md-0">
            <img
              src={
                congreso.fotoCongresoUrl
                  ? `https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net${congreso.fotoCongresoUrl}`
                  : "https://cdn-icons-png.flaticon.com/512/1077/1077063.png"
              }
              alt="Congreso"
              className="custom-profile-img img-fluid"
            />
          </div>
          <div className="col d-flex align-items-center justify-content-center px-0 pe-md-2">
            <div className="col h-100 pb-3">
              <div className="d-flex justify-content-center justify-content-md-start align-items-center">
                <h3 className="custom-font-subtitleArticle2-gold mt-2 ms-0 ms-md-1 text-center">
                  {congreso.nombreCongreso || "Nombre del congreso"}
                </h3>
              </div>
              <p className="custom-font-normalArticle ms-md-4 mb-1 text-center text-md-start">
                <strong>Convocatoria:</strong>{" "}
                {congreso.fechasCongreso?.convocatoriaInicio
                  ? new Date(
                      congreso.fechasCongreso.convocatoriaInicio
                    ).toLocaleString(undefined, {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "N/A"}{" "}
                -{" "}
                {congreso.fechasCongreso?.convocatoriaFin
                  ? new Date(
                      congreso.fechasCongreso.convocatoriaFin
                    ).toLocaleString(undefined, {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "N/A"}
              </p>
              <p className="custom-font-normalArticle ms-md-4 mb-1 text-center text-md-start">
                <strong>Evento:</strong>{" "}
                {congreso.fechasCongreso?.eventoInicio
                  ? new Date(
                      congreso.fechasCongreso.eventoInicio
                    ).toLocaleString(undefined, {
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
                  ? new Date(congreso.fechasCongreso.eventoFin).toLocaleString(
                      undefined,
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }
                    )
                  : "N/A"}
              </p>
              <p className="custom-font-normalArticle ms-md-4 mb-1 text-center text-md-start">
                <strong>Temáticas:</strong>{" "}
                {congreso.tematicas?.tematicas?.length > 0
                  ? congreso.tematicas.tematicas.map((t) => t.nombre).join(", ")
                  : ""}
                {congreso.tematicas?.tematicasExtra?.length > 0
                  ? ", " + congreso.tematicas.tematicasExtra.join(", ")
                  : ""}
              </p>
              <div className="custom-font-normalArticle ms-md-4 mb-1 text-center text-md-start">
                <strong>Ubicación:</strong>{" "}
                {congreso.ubicacion ? (
                  <>
                    <p className="mb-0">
                      Latitud: {congreso.ubicacion.latitud} Longitud:{" "}
                      {congreso.ubicacion.longitud}
                    </p>
                    <p className="mb-0">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${congreso.ubicacion.latitud},${congreso.ubicacion.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none text-light"
                      >
                        Ver ubicación en Google Maps
                      </a>
                    </p>
                  </>
                ) : (
                  <p className="mb-0">Buscando ubicación...</p>
                )}
              </div>
            </div>
          </div>
          <div className="row col-md-3 d-flex justify-content-center align-items-stretch col-custom-md-3 px-0 py-md-5 h-100">
            <div className="col-auto row-md d-flex align-items-center justify-content-start justify-content-md-center w-50 w-md-100-force">
              <button
                className="custom-btn-gold w-100 btnc"
                disabled={!puedeEditar}
                onClick={() =>
                  puedeEditar &&
                  navigate(`/Main/Crear-congreso?id=${congreso.idCongreso}`)
                }
              >
                Editar Congreso
              </button>
            </div>
            <div className="col-auto row-md d-flex align-items-center justify-content-end justify-content-md-center w-50 w-md-100-force">
              <button
                className="custom-btn-gold w-100 btnc"
                onClick={() => navigate(`/Main/Congreso/${congreso.idCongreso}`)}
              >
                Visualizar Congreso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Congreso;
