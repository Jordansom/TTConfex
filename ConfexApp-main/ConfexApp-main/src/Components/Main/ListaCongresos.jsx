import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../Context/DataContext.jsx";
import Congreso from "./Organizador/Components/Congreso.jsx";

const ListaCongresos = () => {
  const [congresos, setCongresos] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(DataContext);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/Congresos/todos`)
      .then((res) => res.json())
      .then((data) => {
        const hoy = new Date();
        const filtrados = data.filter((c) => {
          const inicio = new Date(c.fechasCongreso.convocatoriaInicio);
          const fin = new Date(c.fechasCongreso.eventoFin);
          return hoy >= inicio && hoy <= fin;
        });
        setCongresos(filtrados);
      })
      .catch(() => setCongresos([]));
  }, []);

  return (
    <div className="w-100 d-flex justify-content-center">
      <div className="custom-scrollbar text-start w-100 p-0 px-3" style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
          <div className="mb-3 mb-md-0 px-5 pt-2 px-md-0 ps-md-5">
            <h3 className="custom-font-titleArticle-gold text-center">
              Congresos Disponibles
            </h3>
          </div>
        </div>
        <div className="row d-flex justify-content-center align-items-center py-md-3 px-md-5">
          {congresos.length === 0 ? (
            <div className="mb-4 mb-md-5 p-3 bg-dark bg-dark2 rounded">
              <div className="row d-flex flex-column align-items-center justify-content-center container-custom">
                <p className="text-center custom-font-normalArticle">
                  No hay congresos disponibles en este momento.
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
  );
};

export default ListaCongresos;

