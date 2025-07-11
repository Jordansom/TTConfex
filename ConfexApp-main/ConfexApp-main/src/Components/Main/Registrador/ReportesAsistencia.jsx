import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { FaUpload, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaSave, FaCheck, FaTimes } from 'react-icons/fa';
import { DataContext } from '../../../Context/DataContext.jsx';
import Papa from 'papaparse';
import Swal from 'sweetalert2';

const ReportesAsistencia = () => {
  const { idCongreso } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(DataContext);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [registrosExistentes, setRegistrosExistentes] = useState([]);
  const [usuariosNoEncontrados, setUsuariosNoEncontrados] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingHoras, setEditingHoras] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const BACKEND_URL = `${process.env.REACT_APP_API_URL}`;
  useEffect(() => {
    if (!user.registrador) {
      navigate('/Main');
    }
  }, [user, navigate]);

  const fetchRegistrosExistentes = async (idsUsuarios) => {
    try {
      const response = await fetch(`${BACKEND_URL}/Congresos/registrador/asistencia/${idCongreso}/registros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idsUsuarios }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al obtener registros existentes');
      }

      const data = await response.json();
      setRegistrosExistentes(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const processedData = results.data.map(row => ({
          id: parseInt(row.ID),
          nombre: row.Nombre,
          apellidoPaterno: row['Apellido Paterno'],
          apellidoMaterno: row['Apellido Materno'],
          horasAcumuladas: parseFloat(row['Horas Acumuladas'] || '0')
        }));

        // Verificar asistentes existentes
        const idsUsuarios = processedData.map(row => row.id);
        const response = await fetch(`${BACKEND_URL}/Congresos/registrador/asistencia/${idCongreso}/verificar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idsUsuarios }),
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const asistentesExistentes = processedData.filter(row => 
            data.asistentesExistentes.includes(row.id)
          );
          const noRegistrados = processedData.filter(row => 
            !data.asistentesExistentes.includes(row.id)
          );

          setCsvData(asistentesExistentes);
          setUsuariosNoEncontrados(noRegistrados);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al verificar asistentes',
            confirmButtonColor: "#9b59b6",
            background: "#6c757d",
            color: "#ffffff",
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      error: (error) => {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al procesar el archivo',
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const handleEditHoras = (row) => {
    setEditingId(row.id);
    setEditingHoras(row.horasAcumuladas.toString());
  };

  const handleSaveHoras = (id) => {
    const newHoras = parseFloat(editingHoras);
    if (isNaN(newHoras)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingrese un número válido',
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    setCsvData(prevData => 
      prevData.map(row => 
        row.id === id ? { ...row, horasAcumuladas: newHoras } : row
      )
    );
    setEditingId(null);
    setEditingHoras('');
  };

  const handleDeleteRegistro = (id) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Está seguro?',
      text: '¿Desea eliminar este registro?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: "#9b59b6",
      cancelButtonColor: "#6c757d",
      background: "#6c757d",
      color: "#ffffff"
    }).then((result) => {
      if (result.isConfirmed) {
        setCsvData(prevData => prevData.filter(row => row.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El registro ha sido eliminado',
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleSubmitAsistencias = async () => {
    try {
      setLoading(true);
      const asistencias = csvData.map(row => ({
        idUsuario: row.id,
        horas: row.horasAcumuladas
      }));

      const response = await fetch(`${BACKEND_URL}/Congresos/registrador/asistencia/${idCongreso}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asistencias),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Asistencias registradas exitosamente',
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
        timer: 1500,
        showConfirmButton: false
      });
      navigate('/Main/Mis-registros');
      
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al guardar las asistencias',
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Agregar función para registrar un nuevo asistente
  const handleRegistrarAsistente = async (usuario) => {
    try {
      const response = await fetch(`${BACKEND_URL}/Congresos/registrador/asistencia/${idCongreso}/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idUsuario: usuario.id,
          horas: usuario.horasAcumuladas
        }),
        credentials: 'include'
      });

      if (response.ok) {
        setUsuariosNoEncontrados(prev => 
          prev.filter(u => u.id !== usuario.id)
        );
        setCsvData(prev => [...prev, usuario]);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Usuario registrado exitosamente',
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al registrar usuario',
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const filteredData = (data) => {
    return data.filter(row => {
      const searchLower = searchTerm.toLowerCase();
      return (
        row.nombre?.toLowerCase().includes(searchLower) ||
        row.apellidoPaterno?.toLowerCase().includes(searchLower) ||
        row.apellidoMaterno?.toLowerCase().includes(searchLower) ||
        row.id?.toString().includes(searchLower)
      );
    });
  };

  return (
    <>
      <Outlet />
      <div className="container">
        <div className="row mb-5">
          <div className={`col d-flex align-items-center ${
            isSidebarOpen ? "main-content-padding" : "main-content-padding2"
          }`}>
            <button 
              className="btn btn-outline-secondary me-3" 
              onClick={() => navigate('/Main/Mis-registros')}
            >
              <FaArrowLeft className="me-2" />
            </button>
            <h3 className="custom-font-titleArticle-gold mb-0">
              Registros de Asistencia
            </h3>
          </div>
          <div className="col d-flex justify-content-end align-items-center">
            <button
              className="btn custom-btn-gold3 fw-bold me-3"
              onClick={() => window.open('/app/confex.apk')}
            >
              Descargar App
            </button>
            <button 
              className="btn custom-btn-gold3 fw-bold me-5"
              onClick={handleSubmitAsistencias}
              disabled={loading}
            >
              <FaSave className="me-2" />
              {loading ? 'Guardando...' : 'Guardar Asistencias'}
            </button>
          </div>
        </div>

        <div className="mb-5 p-3 bg-dark bg-dark2 rounded">
          <div className="row g-3 mb-4">
            <div className="col-md-9">
              <label className="form-label custom-font-normal">Archivo CSV de Asistencia</label>
              <div className="input-group">
                <input
                  type="file"
                  accept=".csv"
                  className="custom-input-gold"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label custom-font-normal">Buscar</label>
              <div className="input-group">
                <span className="input-group-text custom-btn-gold2"><FaSearch /></span>
                <input
                  type="text"
                  className="custom-input-gold"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {csvData.length > 0 ? (
            <>
              <h5 className="custom-font-subtitle-gold mb-3">Registros a Procesar</h5>
              <div className="table-responsive">
                <table className="table table-dark table-hover">
                  <thead>
                    <tr className="custom-font-subtitleArticle-gold">
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Apellidos</th>
                      <th>Horas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="custom-font-normalArticle">
                    {filteredData(csvData).map(row => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.nombre}</td>
                        <td>{`${row.apellidoPaterno} ${row.apellidoMaterno}`}</td>
                        <td>
                          {editingId === row.id ? (
                            <div className="input-group input-group-sm">
                              <input
                                type="number"
                                className="custom-input-gold"
                                value={editingHoras}
                                onChange={(e) => setEditingHoras(e.target.value)}
                                step="0.5"
                              />
                              <button 
                                className="custom-btn-gold"
                                onClick={() => handleSaveHoras(row.id)}
                              >
                                <FaCheck />
                              </button>
                              <button 
                                className="custom-btn-gold"
                                onClick={() => setEditingId(null)}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ) : (
                            row.horasAcumuladas
                          )}
                        </td>
                        <td>
                          <button 
                            className="custom-btn-gold me-2"
                            onClick={() => handleEditHoras(row)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="custom-btn-gold"
                            onClick={() => handleDeleteRegistro(row.id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {usuariosNoEncontrados.length > 0 && (
                <div className="mt-4">
                  <div className="custom-alert-gold">
                    <h5 className="alert-heading custom-font-subtitle-gold">Usuarios No Registrados como Asistentes</h5>
                    <div className="table-responsive">
                      <table className="table table-dark table-hover">
                        <thead>
                          <tr className="custom-font-subtitleArticle-gold">
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellidos</th>
                            <th>Horas</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="custom-font-normalArticle">
                          {filteredData(usuariosNoEncontrados).map(row => (
                            <tr key={row.id}>
                              <td>{row.id}</td>
                              <td>{row.nombre}</td>
                              <td>{`${row.apellidoPaterno} ${row.apellidoMaterno}`}</td>
                              <td>{row.horasAcumuladas}</td>
                              <td>
                                <button 
                                  className="custom-btn-gold"
                                  onClick={() => handleRegistrarAsistente(row)}
                                >
                                  Registrar como Asistente
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <FaUpload size={64} className="mb-3 text-gold" />
              <p className="mb-0 custom-font-normal">No hay registros cargados</p>
              <small className="custom-font-Extrasmall">
                Sube un archivo CSV para comenzar
              </small>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportesAsistencia;

