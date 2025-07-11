import React, { useContext, useCallback, useState, useEffect } from "react";
import { Outlet, useOutletContext, useNavigate } from "react-router-dom";
import { DataContext } from "../../../Context/DataContext.jsx";
import { FaFilter, FaQrcode } from "react-icons/fa";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import CongresoRegistrador from "./CongresoRegistrador.jsx";

const BACKEND_URL = `${process.env.REACT_APP_API_URL}`;
const MisRegistros = () => {
  const navigate = useNavigate();
  const { user } = useContext(DataContext);
  const { isSidebarOpen } = useOutletContext();
  const [congresos, setCongresos] = useState([]);
  const [filtros, setFiltros] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const parseUTCToLocalDate = (isoString) => {
    if (!isoString) return null;
    const utcDate = new Date(isoString);
    return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
  };

  const fetchCongresos = useCallback(async () => {
    let success = false;
    while (!success) {
      try {
        console.log("Sending request with user ID:", user.idUsuario); // Debug log

        const response = await fetch(`https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Congresos/buscarRegistrador`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ 
            idUsuario: user.idUsuario 
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", errorText); // Debug log
          throw new Error(`Error al obtener los congresos: ${errorText}`);
        }

        const data = await response.json();
        console.log("Received data:", data); // Debug log
        setCongresos(data);
        success = true;
      } catch (err) {
        console.error("Error en fetchCongresos:", err);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }, [user]);

  const fetchFilteredCongresos = useCallback(async () => {
    let success = false;
    while (!success) {
      try {
        const response = await fetch(`https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Congresos/registradorFilter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idUsuario: user.idUsuario, filtros: filtros }),
        });
        if (!response.ok)
          throw new Error(
            "Error al obtener los congresos con los filtros aplicados."
          );
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
        success = true;
      } catch (err) {
        setCongresos([]);
        setFiltros([]);
        console.error("Error en fetchCongresos:", err);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }, [user, setCongresos, setFiltros, filtros]);

  useEffect(() => {
    const fetchCongresosFunc =
      filtros.length === 0 ? fetchCongresos : fetchFilteredCongresos;
    fetchCongresosFunc();
    const interval = setInterval(fetchCongresosFunc, 30000);
    return () => clearInterval(interval);
  }, [filtros]);

  const handleRegistroAsistencia = (idCongreso) => {
    navigate(`/Main/Registro-congreso/${idCongreso}`);
  };

  return (
    <>
      <Outlet />
      <div className="container">
        <div className="row mb-5">
          <div
            className={`col d-flex align-items-center ${
              isSidebarOpen ? "main-content-padding" : "main-content-padding2"
            }`}
          >
            <h3 className="custom-font-titleArticle-gold">
              <MdOutlineQrCodeScanner className="me-2" />
              Mis Registros
            </h3>
          </div>
          <div className="col d-flex justify-content-end align-items-center">
            <button
              className="btn custom-btn-gold3 fw-bold me-5"
              onClick={() => {
                if (mostrarFiltros) {
                  setFiltros([]);
                }
                setMostrarFiltros(!mostrarFiltros);
              }}
            >
              <FaFilter className="me-2" /> Filtro
            </button>
          </div>
        </div>

        {mostrarFiltros && (
          <div className="mb-4 p-3 bg-light rounded">
            <h5>Filtros disponibles</h5>
            <p className="text-muted">
              Los filtros se implementarán en una futura actualización.
            </p>
          </div>
        )}

        <div className="mb-5 p-3 bg-dark bg-dark2 rounded">
          <div className="row me-1 ms-1 mt-3">
            {congresos.length === 0 ? (
              <div className="text-center text-white py-5">
                <MdOutlineQrCodeScanner size={64} className="mb-3 text-muted" />
                <p className="mb-0">No se encontraron congresos asignados</p>
                <small className="text-muted">
                  Contacta al organizador si crees que deberías tener congresos asignados
                </small>
              </div>
            ) : (
              congresos.map((congreso) => (
                <div key={congreso.idCongreso} className="row mb-3">
                  <CongresoRegistrador 
                    congreso={congreso} 
                    onRegistroAsistencia={handleRegistroAsistencia}
                  />
                </div>
              ))
            )
            }
          </div>
        </div>
      </div>
    </>
    );
};

export default MisRegistros;