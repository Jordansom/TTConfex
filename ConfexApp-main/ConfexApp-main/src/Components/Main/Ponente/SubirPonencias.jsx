import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../../Context/DataContext.jsx";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SubirPonencias = () => {
  const { user } = useContext(DataContext);
  const [congresos, setCongresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/Congresos/congresos-ponente?idUsuario=${user.idUsuario}`)
      .then((res) => res.json())
      .then(setCongresos)
      .catch(() => setCongresos([]))
      .finally(() => setLoading(false));
  }, [user.idUsuario]);

  const handleEliminar = async (idCongreso) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas dejar de participar como ponente? Esto eliminará tu ponencia.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#6c757d",
      color: "#fff",
    });
    if (confirm.isConfirmed) {
      const res = await fetch(
        `https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Congresos/eliminarPonencia?idCongreso=${idCongreso}&idUsuario=${user.idUsuario}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        Swal.fire("Eliminado", "Has dejado de participar como ponente.", "success");
        setCongresos(congresos.filter((c) => c.idCongreso !== idCongreso));
      } else {
        Swal.fire("Error", "No se pudo eliminar tu participación.", "error");
      }
    }
  };

  const handleUploadOrUpdate = async (congreso) => {
    // Seleccionar temática
    const { value: idTematica } = await Swal.fire({
      title: 'Selecciona la temática',
      input: 'select',
      inputOptions: Object.fromEntries(
        (congreso.tematicas || []).map(t => [t.idTematica, t.nombre])
      ),
      inputPlaceholder: 'Selecciona una temática',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      background: "#6c757d",
      color: "#fff",
      inputValidator: (value) => !value && 'Debes seleccionar una temática'
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
      background: "#6c757d",
      color: "#fff"
    });

    if (file) {
      if (file.type !== "application/pdf") {
        Swal.fire("Error", "Solo se permiten archivos PDF.", "error");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        Swal.fire("Error", "El archivo excede los 50MB.", "error");
        return;
      }

      const formData = new FormData();
      formData.append("idCongreso", congreso.idCongreso);
      formData.append("idUsuario", user.idUsuario);
      formData.append("idTematica", idTematica);
      formData.append("archivo", file);

      const res = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Congresos/subirPonencia", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        Swal.fire("¡Éxito!", "Ponencia subida correctamente.", "success");
      } else {
        Swal.fire("Error", "No se pudo subir la ponencia.", "error");
      }
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="w-100 d-flex justify-content-center">
      <div className="custom-scrollbar text-start w-100 p-0 px-3" style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
          <div className="mb-3 mb-md-0 px-5 pt-2 px-md-0 ps-md-5">
            <h3 className="custom-font-titleArticle-gold text-center">
              Mis Ponencias
            </h3>
          </div>
        </div>
        <div className="row d-flex justify-content-center align-items-center py-md-3 px-md-5">
          {congresos.length === 0 ? (
            <div className="mb-4 mb-md-5 p-3 bg-dark bg-dark2 rounded">
              <div className="row d-flex flex-column align-items-center justify-content-center container-custom">
                <p className="text-center custom-font-normalArticle">
                  No participas como ponente en ningún congreso.
                </p>
              </div>
            </div>
          ) : (
            congresos.map((congreso) => (
              <div key={congreso.idCongreso} className="row">
                <div className="mb-4 mb-md-5 p-3 bg-dark bg-dark2 rounded">
                  <div className="row d-flex align-items-center justify-content-center container-custom">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100">
                      <div>
                        <h5 className="custom-font-subtitleArticle2-gold">
                          {congreso.nombreCongreso}
                        </h5>
                        <p className="custom-font-normalArticle">
                          <b>Convocatoria:</b>{" "}
                          {new Date(congreso.fechasCongreso.convocatoriaInicio).toLocaleDateString()} -{" "}
                          {new Date(congreso.fechasCongreso.convocatoriaFin).toLocaleDateString()}
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
                          onClick={() => handleUploadOrUpdate(congreso)}
                        >
                          Subir/Actualizar Ponencia
                        </button>
                        <button
                          className="btn custom-btn-gold3"
                          onClick={() => handleEliminar(congreso.idCongreso)}
                        >
                          Dejar de participar
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

export default SubirPonencias;
