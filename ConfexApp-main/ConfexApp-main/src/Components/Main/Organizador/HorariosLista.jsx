import React, { useContext, useCallback, useState, useEffect } from "react";
import { Outlet, useOutletContext, useNavigate } from "react-router-dom";
import { DataContext } from "../../../Context/DataContext.jsx";

const BACKEND_URL =`${process.env.REACT_APP_API_URL}`
const HorariosLista = () => {
  const navigate = useNavigate();
  const { user } = useContext(DataContext);
  const { isSidebarOpen } = useOutletContext();
  const [congresos, setCongresos] = useState([]);

  const parseUTCToLocalDate = (isoString) => {
    if (!isoString) return null;
    const utcDate = new Date(isoString);
    return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
  };

  const fetchCongresos = useCallback(async () => {
    let success = false;
    while (!success) {
      try {
        const response = await fetch(`${BACKEND_URL}/Congresos/organizador`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idUsuario: user.idUsuario }),
        });
        if (!response.ok) throw new Error("Error al obtener los congresos");
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

        // Auto-inicializar fechas para congresos sin horarios
        for (const congreso of dataConFechasLocales) {
          await inicializarFechasCongreso(congreso.idCongreso, congreso.fechasCongreso);
        }

        setCongresos(dataConFechasLocales);
        success = true;
      } catch (err) {
        console.error("Error en fetchCongresos:", err);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }, [user, setCongresos]);

  const inicializarFechasCongreso = async (idCongreso, fechasCongreso) => {
    try {
      // Verificar si ya tiene horarios configurados
      const response = await fetch(`${BACKEND_URL}/Congresos/horarios/${idCongreso}`);
      if (response.ok) {
        const data = await response.json();

        // Si no tiene horarios, crear las fechas automáticamente
        if (data.horarios.length === 0 && fechasCongreso.eventoInicio && fechasCongreso.eventoFin) {
          const horariosPorFecha = [];
          const fechaInicio = new Date(fechasCongreso.eventoInicio);
          const fechaFin = new Date(fechasCongreso.eventoFin);

          for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
            horariosPorFecha.push({
              fecha: d.toISOString().split('T')[0],
              horaInicio: '08:00',
              horaFin: '18:00'
            });
          }

          await fetch(`${BACKEND_URL}/Congresos/horarios/${idCongreso}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              horarios: horariosPorFecha,
              eventos: [],
              salas: [{ nombre: 'Principal' }]
            }),
            credentials: 'include'
          });
        }
      }
    } catch (error) {
      console.error('Error al inicializar fechas:', error);
    }
  };

  useEffect(() => {
    fetchCongresos();
    const interval = setInterval(fetchCongresos, 30000);
    return () => clearInterval(interval);
  }, [fetchCongresos]);

  const handleEditarHorario = (idCongreso) => {
    navigate(`/Main/Horarios/${idCongreso}`);
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
            <h3 className="custom-font-titleArticle-gold">Horarios de Congresos</h3>
          </div>
        </div>

        <div className="mb-5 p-3 bg-dark bg-dark2 rounded">
          <div className="row me-1 ms-1 mt-3">
            {congresos.length === 0 ? (
              <p className="text-center text-white">
                No se encontraron congresos
              </p>
            ) : (
              congresos.map((congreso) => (
                <div key={congreso.idCongreso} className="row mb-3">
                  <div className="col">
                    <div className="card bg-dark text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="card-title mb-0">{congreso.nombreCongreso}</h5>
                          <button
                            className="btn custom-btn-gold3"
                            onClick={() => handleEditarHorario(congreso.idCongreso)}
                          >
                            Editar Horario
                          </button>
                        </div>
                        <p className="card-text mt-2">
                          {congreso.fechasCongreso.eventoInicio?.toLocaleDateString()} - {congreso.fechasCongreso.eventoFin?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
              
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HorariosLista;