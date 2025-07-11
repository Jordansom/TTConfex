import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../../Context/DataContext.jsx";
import { useNavigate } from "react-router-dom";

const CongresosEvaluador = () => {
  const { user } = useContext(DataContext);
  const [congresos, setCongresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.idUsuario) return;

    fetch(`${process.env.REACT_APP_API_URL}/Congresos/congresos-evaluador?idUsuario=${user.idUsuario}`)
      .then((res) => res.json())
      .then((data) => setCongresos(Array.isArray(data) ? data : []))
      .catch(() => setCongresos([]))
      .finally(() => setLoading(false));
  }, [user.idUsuario]);

  const hoy = new Date();

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="w-100 d-flex justify-content-center">
      <div className="custom-scrollbar text-start w-100 p-0 px-3" style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
          <div className="mb-3 mb-md-0 px-5 pt-2 px-md-0 ps-md-5">
            <h3 className="custom-font-titleArticle-gold text-center">
              Congresos donde soy Evaluador
            </h3>
          </div>
        </div>
        <div className="row d-flex justify-content-center align-items-center py-md-3 px-md-5">
          {congresos.length === 0 ? (
            <div className="mb-4 mb-md-5 p-3 bg-dark bg-dark2 rounded">
              <div className="row d-flex flex-column align-items-center justify-content-center container-custom">
                <p className="text-center custom-font-normalArticle">
                  No eres evaluador en ningún congreso.
                </p>
              </div>
            </div>
          ) : (
            congresos.map((congreso) => {
              const inicio = new Date(congreso.fechasCongreso.evaluacionInicio);
              const fin = new Date(congreso.fechasCongreso.evaluacionFin);
              const puedeEvaluar = hoy >= inicio && hoy <= fin;
              return (
                <div key={congreso.idCongreso} className="row">
                  <div className="mb-4 mb-md-5 p-3 bg-dark bg-dark2 rounded">
                    <div className="row d-flex align-items-center justify-content-center container-custom">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100">
                        <div>
                          <h5 className="custom-font-subtitleArticle2-gold">{congreso.nombreCongreso}</h5>
                          <p className="custom-font-normalArticle">
                            <b>Evaluación:</b>{" "}
                            {new Date(congreso.fechasCongreso.evaluacionInicio).toLocaleDateString()} -{" "}
                            {new Date(congreso.fechasCongreso.evaluacionFin).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="d-flex gap-2 mt-3 mt-md-0">
                          <button
                            className="btn custom-btn-gold3"
                            onClick={() => navigate(`/Main/Congreso/${congreso.idCongreso}`)}
                          >
                            Visualizar Congreso
                          </button>
                          <button
                            className="btn custom-btn-gold3"
                            disabled={!puedeEvaluar}
                            onClick={() => {
                              if (puedeEvaluar) {
                                navigate(`/Main/Evaluar-ponencias/${congreso.idCongreso}`);
                              }
                            }}
                          >
                            Evaluar Ponencias
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CongresosEvaluador;
