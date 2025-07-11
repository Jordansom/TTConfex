import React, { useContext, useCallback, useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { DataContext } from "../../../Context/DataContext.jsx";
import { FaFilter } from "react-icons/fa";
import Congreso from "./Components/Congreso.jsx";

const MisCongresos = () => {
  const navigate = useNavigate();
  const { user } = useContext(DataContext);
  const [congresos, setCongresos] = useState([]);
  const [filtros, setFiltros] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const parseUTCToLocalDate = (isoString) => {
    if (!isoString) return null;
    const utcDate = new Date(isoString);
    return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
  };

  const fetchCongresos = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Congresos/organizador`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario: user.idUsuario }),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error desconocido en el servidor");
      }
      const data = await response.json();
      const dataConFechasLocales = data.map((congreso) => {
        const fechas = congreso.fechasCongreso;
        const fechasLocales = Object.fromEntries(
          Object.entries(fechas).map(([key, value]) => [
            key,
            parseUTCToLocalDate(value),
          ])
        );
        return {
          ...congreso,
          fechasCongreso: fechasLocales,
        };
      });
      setCongresos(dataConFechasLocales);
    } catch (err) {
      console.error("Error en fetchCongresos:", err);
    }
  }, [user, setCongresos]);

  const fetchFilteredCongresos = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Congresos/organizadorFilter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario: user.idUsuario, filtros: filtros }),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error desconocido en el servidor");
      }
      const data = await response.json();
      const dataConFechasLocales = data.map((congreso) => {
        const fechas = congreso.fechasCongreso;
        const fechasLocales = Object.fromEntries(
          Object.entries(fechas).map(([key, value]) => [
            key,
            parseUTCToLocalDate(value),
          ])
        );
        return {
          ...congreso,
          fechasCongreso: fechasLocales,
        };
      });
      setCongresos(dataConFechasLocales);
    } catch (err) {
      setCongresos([]);
      setFiltros([]);
      console.error("Error en fetchCongresos:", err);
    }
  }, [user, setCongresos, setFiltros, filtros]);

  useEffect(() => {
    const fetchCongresosFunc =
      filtros.length === 0 ? fetchCongresos : fetchFilteredCongresos;
    fetchCongresosFunc();
    const interval = setInterval(fetchCongresosFunc, 30000);
    return () => clearInterval(interval);
  }, [filtros]);

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
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
            <div className="mb-3 mb-md-0 px-5 pt-2 px-md-0 ps-md-5">
              <h3 className="custom-font-titleArticle-gold text-center">
                Mis Congresos
              </h3>
            </div>
            <div className="d-flex flex-row justify-content-center justify-content-md-end gap-3">
              <button
                className="btn custom-btn-gold3 fw-bold"
                onClick={() => {
                  if (mostrarFiltros) {
                    setFiltros([]);
                  }
                  setMostrarFiltros(!mostrarFiltros);
                }}
              >
                <FaFilter className="me-2" /> Filtros
              </button>
              <button
                className="btn custom-btn-gold3 fw-bold"
                onClick={() => navigate("/Main/Crear-congreso")}
              >
                Crear Congreso
              </button>
            </div>
          </div>

          {mostrarFiltros && (
            //Aqui contenido
            <p>Hola</p>
          )}

          <div className="row d-flex justify-content-center align-items-center py-md-3 px-md-5">
            {congresos.length === 0 ? (
              <div className="mb-4 mb-md-5 p-3 bg-dark bg-dark2 rounded">
                <div className="row d-flex flex-column align-items-center justify-content-center container-custom">
                  <p className="text-center custom-font-normalArticle">
                    No se encontraron congresos
                  </p>
                </div>
              </div>
            ) : (
              congresos.map((congreso, index) => (
                <div key={congreso.idCongreso} className="row">
                  <Congreso
                    congreso={congreso}
                    isLast={index === congresos.length - 1}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MisCongresos;
