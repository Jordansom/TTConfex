import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaSave, FaClock, FaTimes, FaAndroid, FaCopy } from 'react-icons/fa';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import 'animate.css';

const HorariosCongreso = () => {
  const { idCongreso } = useParams();
  const [fechas, setFechas] = useState([]);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('18:00');
  const [intervalo, setIntervalo] = useState(30); // minutos
  const [eventos, setEventos] = useState([]);
  const [editingEvento, setEditingEvento] = useState(null);
  const [salas, setSalas] = useState(['Principal']);
  const [salaActual, setSalaActual] = useState('Principal');
  const [horariosPorSala, setHorariosPorSala] = useState({
    Principal: {
      eventos: [],
      horaInicio: '08:00',
      horaFin: '18:00',
      intervalo: 30
    }
  });
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const datePickerRef = useRef();
  const horaInicioRef = useRef();
  const horaFinRef = useRef();
  const intervaloRef = useRef();

  const [animSalas, setAnimSalas] = useState({});
  const [animFechas, setAnimFechas] = useState({});
  const [animIntervalo, setAnimIntervalo] = useState(false);

  const [eventoCopiado, setEventoCopiado] = useState(null);

  const {
    control,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    cargarHorarios();
  }, [idCongreso]);

  const cargarHorarios = async () => {
    try {
      const response = await fetch(`/Congresos/horarios/${idCongreso}`);
      if (response.ok) {
        const data = await response.json();

        // Evitar duplicados al cargar fechas
        const fechasUnicas = [];
        const fechasStrings = new Set();
        data.horarios.forEach(h => {
          const fechaStr = new Date(h.fecha).toISOString().split('T')[0];
          if (!fechasStrings.has(fechaStr)) {
            fechasUnicas.push(new Date(h.fecha));
            fechasStrings.add(fechaStr);
          }
        });
        setFechas(fechasUnicas);

        if (data.horarios.length > 0) {
          setHoraInicio(data.horarios[0].horaInicio);
          setHoraFin(data.horarios[0].horaFin);
        }

        // Cargar salas
        if (data.salas && data.salas.length > 0) {
          const nombresSalas = data.salas.map(s => s.nombre);
          setSalas(nombresSalas);
          setSalaActual(nombresSalas[0]);
        }

        // Cargar eventos
        setEventos(data.eventos.map(e => ({
          id: e.idEvento,
          fecha: new Date(e.fecha),
          horaInicio: e.horaInicio,
          titulo: e.titulo,
          tipo: e.tipo,
          duracion: e.duracion,
          color: e.color,
          sala: e.sala || 'Principal'
        })));
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  };

  // Función mejorada para agregar salas
  const handleAgregarSala = async () => {
    const { value: nombreSala } = await Swal.fire({
      title: 'Ingrese el nombre de la sala:',
      input: 'text',
      inputPlaceholder: 'Nombre de la sala',
      showCancelButton: true,
      confirmButtonColor: "#9b59b6",
      background: "#6c757d",
      color: "#ffffff"
    });

    if (nombreSala && !salas.includes(nombreSala)) {
      try {
        const response = await fetch(`/Congresos/salas/${idCongreso}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nombreSala: nombreSala }),
          credentials: 'include'
        });

        if (response.ok) {
          setSalas([...salas, nombreSala]);
          setHorariosPorSala(prev => ({
            ...prev,
            [nombreSala]: {
              eventos: [],
              horaInicio: '08:00',
              horaFin: '18:00',
              intervalo: 30
            }
          }));
          setAnimSalas(a => ({ ...a, [nombreSala]: 'animate__fadeInDown' }));
          setTimeout(() => setAnimSalas(a => ({ ...a, [nombreSala]: '' })), 800);
          Swal.fire({
            icon: 'success',
            title: 'Sala agregada',
            text: 'La sala se agregó correctamente',
            timer: 1200,
            showConfirmButton: false
          });
        } else {
          const errorText = await response.text();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al agregar la sala',
            confirmButtonColor: "#9b59b6",
            background: "#6c757d",
            color: "#ffffff",
            timer: 2500,
            showConfirmButton: false
          });
        }
      } catch (error) {
        console.error('Error al agregar sala:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al agregar la sala',
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
          timer: 2500,
          showConfirmButton: false
        });
      }
    }
  };

  // Función para eliminar salas
  const handleEliminarSala = async (salaAEliminar) => {
    if (salas.length <= 1) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede eliminar la última sala',
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
        timer: 2500,
        showConfirmButton: false
      });
      return;
    }

    const eventosEnSala = eventos.filter(e => e.sala === salaAEliminar);
    if (eventosEnSala.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede eliminar una sala que tiene eventos asignados',
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
        timer: 2500,
        showConfirmButton: false
      });
      return;
    }

    setAnimSalas(a => ({ ...a, [salaAEliminar]: 'animate__fadeOutRight' }));
    setTimeout(() => {
      setSalas(salas.filter(sala => sala !== salaAEliminar));
      
      if (salaActual === salaAEliminar) {
        const otrasSalas = salas.filter(sala => sala !== salaAEliminar);
        setSalaActual(otrasSalas[0]);
      }
      
      const nuevosHorarios = { ...horariosPorSala };
      delete nuevosHorarios[salaAEliminar];
      setHorariosPorSala(nuevosHorarios);
    }, 500);
    Swal.fire({
      icon: 'success',
      title: 'Sala eliminada',
      text: 'La sala se eliminó correctamente',
      timer: 1200,
      showConfirmButton: false
    });
  };

  // FECHAS
  const handleAgregarFecha = (fecha) => {
    if (!fecha) return;

    // Crear fecha con hora UTC+0 para evitar el problema del día anterior
    const nuevaFecha = new Date(fecha + 'T00:00:00');
    const nuevaFechaStr = nuevaFecha.toISOString().split('T')[0];
    
    // Verificar duplicados usando la fecha en formato string
    const yaExiste = fechas.some(f => 
      f.toISOString().split('T')[0] === nuevaFechaStr
    );
    
    if (!yaExiste) {
      setFechas(prevFechas => {
        const fechasActualizadas = [...prevFechas, nuevaFecha].sort((a, b) => a.getTime() - b.getTime());
        setAnimFechas(prev => ({ ...prev, [nuevaFechaStr]: 'animate__fadeInDown' }));
        setTimeout(() => setAnimFechas(prev => ({ ...prev, [nuevaFechaStr]: '' })), 800);
        return fechasActualizadas;
      });
      Swal.fire({
        icon: 'success',
        title: 'Fecha agregada',
        text: 'La fecha se agregó correctamente',
        timer: 1200,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Fecha duplicada',
        text: 'Esta fecha ya ha sido agregada',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleEliminarFecha = (fechaAEliminar) => {
    const fechaStr = fechaAEliminar.toISOString().split('T')[0];
    const eventosEnFecha = eventos.filter(e =>
      e.fecha.toISOString().split('T')[0] === fechaStr
    );
    if (eventosEnFecha.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: '¿Eliminar fecha?',
        text: 'Esta fecha tiene eventos programados. ¿Está seguro de eliminarla?',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#b8860b",
        background: "#23272b",
        color: "#fff"
      }).then((result) => {
        if (result.isConfirmed) {
          setAnimFechas(prev => ({ ...prev, [fechaStr]: 'animate__fadeOutRight' }));
          setTimeout(() => {
            setFechas(prevFechas => prevFechas.filter(f =>
              f.toISOString().split('T')[0] !== fechaStr
            ));
            setEventos(eventos.filter(e =>
              e.fecha.toISOString().split('T')[0] !== fechaStr
            ));
          }, 500);
        }
      });
    } else {
      setAnimFechas(prev => ({ ...prev, [fechaStr]: 'animate__fadeOutRight' }));
      setTimeout(() => {
        setFechas(prevFechas => prevFechas.filter(f =>
          f.toISOString().split('T')[0] !== fechaStr
        ));
      }, 500);
    }
  };

  // INTERVALO
  const handleIntervaloChange = (e) => {
    setAnimIntervalo(true);
    setIntervalo(parseInt(e.target.value));
    setTimeout(() => setAnimIntervalo(false), 600);
  };

  // Copiar y pegar eventos
  const handleCopiarEvento = (evento) => {
    setEventoCopiado({
      ...evento,
      id: null
    });
    
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
    
    Toast.fire({
      icon: 'success',
      title: `Evento "${evento.titulo || 'Sin título'}" copiado`,
      background: '#b8860b',
      color: '#fff'
    });
  };

  const handlePegarEvento = (fecha, hora, sala) => {
    if (!eventoCopiado) {
      Swal.fire({
        icon: 'info',
        title: 'No hay evento copiado',
        text: 'Primero copia un evento haciendo clic derecho sobre él',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    // Calculate needed cells
    const celdasNecesarias = eventoCopiado.duracion / intervalo;
    
    // Generate occupied hours
    const horasOcupadas = [];
    let currentTime = new Date(`2000-01-01T${hora}`);
    
    for (let i = 0; i < celdasNecesarias; i++) {
      const horaStr = currentTime.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
      horasOcupadas.push(horaStr);
      currentTime = new Date(currentTime.getTime() + intervalo * 60000);
    }

    // Check for conflicts
    const conflictos = horasOcupadas.some(horaOcupada => {
      return eventos.some(e =>
        e.fecha.getTime() === fecha.getTime() &&
        e.horaInicio === horaOcupada &&
        e.sala === sala
      );
    });

    if (conflictos) {
      Swal.fire({
        icon: 'warning',
        title: 'Espacio insuficiente',
        text: `Este evento necesita ${celdasNecesarias} celdas pero hay conflictos con eventos existentes`,
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    // Verify time limits
    const horaFinalEvento = new Date(`2000-01-01T${hora}`);
    horaFinalEvento.setMinutes(horaFinalEvento.getMinutes() + eventoCopiado.duracion);
    const horaLimite = new Date(`2000-01-01T${horaFin}`);

    if (horaFinalEvento > horaLimite) {
      Swal.fire({
        icon: 'warning',
        title: 'Evento se sale del horario',
        text: `El evento terminaría después de la hora límite (${horaFin})`,
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    // Create new event
    const nuevoEvento = {
      ...eventoCopiado,
      id: Date.now(),
      fecha: fecha,
      horaInicio: hora,
      sala: sala
    };

    setEventos(prevEventos => [...prevEventos, nuevoEvento]);
    
  };

  // Componente para eventos arrastrables
  const EventoDraggable = ({ evento, index, moveEvento }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'evento',
      item: { id: evento.id, index },
      collect: monitor => ({
        isDragging: monitor.isDragging()
      })
    });

    const [, drop] = useDrop({
      accept: 'evento',
      hover(item) {
        if (item.id !== evento.id) {
          moveEvento(item.id, evento.fecha, evento.horaInicio);
        }
      }
    });

    const handleContextMenu = (e) => {
      e.preventDefault();
      handleCopiarEvento(evento);
    };

    return (
      <td
        ref={node => drag(drop(node))}
        rowSpan={evento.duracion / intervalo}
        style={{
          backgroundColor: evento.color,
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          color: '#fff',
          verticalAlign: 'middle'
        }}
        onClick={() => setEditingEvento(evento)}
        onContextMenu={handleContextMenu}
      >
        <div className="p-2">
          <strong>{evento.titulo}</strong>
          <br />
          <small>{evento.tipo}</small>
        </div>
      </td>
    );
  };

  // Función para mover eventos
  const moveEvento = (idEvento, nuevaFecha, nuevaHora) => {
    setEventos(eventos.map(e => {
      if (e.id === idEvento) {
        return { ...e, fecha: nuevaFecha, horaInicio: nuevaHora };
      }
      return e;
    }));
  };

  const handleAgregarEvento = (fecha, hora, sala) => {
    const nuevoEvento = {
      id: Date.now(),
      fecha: fecha,
      horaInicio: hora,
      titulo: '',
      tipo: 'presentacion',
      color: '#b8860b',
      sala: sala,
      duracion: intervalo
    };
    setEventos([...eventos, nuevoEvento]);
    setEditingEvento(nuevoEvento);
  };

  const handleGuardarHorarios = async () => {
    try {
      const horariosPorFecha = fechas.map(fecha => ({
        fecha: fecha.toISOString().split('T')[0],
        horaInicio: horaInicio,
        horaFin: horaFin
      }));

      const eventosFormateados = eventos.map(evento => ({
        titulo: evento.titulo,
        tipo: evento.tipo,
        horaInicio: evento.horaInicio,
        duracion: evento.duracion,
        color: evento.color,
        fecha: evento.fecha.toISOString().split('T')[0],
        sala: evento.sala
      }));

      const salasFormateadas = salas.map(sala => ({
        nombre: sala
      }));

      const response = await fetch(`/Congresos/horarios/${idCongreso}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          horarios: horariosPorFecha,
          eventos: eventosFormateados,
          salas: salasFormateadas
        }),
        credentials: 'include'
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Horarios guardados exitosamente',
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
          timer: 2500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar los horarios',
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
        timer: 2500,
        showConfirmButton: false
      });
    }
  };

  // Move these functions inside the HorariosCongreso component

  // Helper function for checking occupied cells (move inside component)
  const esCeldaOcupadaPorEvento = (fecha, hora, sala) => {
    return eventos.some(evento => {
      if (evento.fecha.getTime() !== fecha.getTime() || evento.sala !== sala) {
        return false;
      }
      
      const eventoInicio = new Date(`2000-01-01T${evento.horaInicio}`);
      const eventoFin = new Date(eventoInicio.getTime() + evento.duracion * 60000);
      const horaActual = new Date(`2000-01-01T${hora}`);
      
      return horaActual >= eventoInicio && horaActual < eventoFin;
    });
  };

  // Cleanup function (move inside component)
  const limpiarEventosInvalidos = () => {
    setEventos(prevEventos => {
      return prevEventos.filter(evento => {
        return evento.fecha && 
               evento.fecha instanceof Date && 
               !isNaN(evento.fecha.getTime()) &&
               evento.horaInicio &&
               evento.sala &&
               evento.titulo !== undefined;
      });
    });
  };

  // Update useEffect with cleanup
  useEffect(() => {
    cargarHorarios().then(() => {
      limpiarEventosInvalidos();
    });
  }, [idCongreso]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        {eventoCopiado && (
          <div 
            className="alert alert-warning d-flex justify-content-between align-items-center mb-3"
            style={{ 
              position: 'sticky', 
              top: '10px', 
              zIndex: 1000,
              backgroundColor: 'rgba(184, 134, 11, 0.9)',
              border: '1px solid #b8860b',
              color: '#000'
            }}
          >
            <span>
              <FaClock className="me-2" />
              <strong>Evento copiado:</strong> {eventoCopiado.titulo || 'Sin título'} 
              <small className="ms-2">({eventoCopiado.tipo})</small>
              <em className="ms-2">- Haz clic en una celda vacía para pegar</em>
            </span>
            <button
              className="btn btn-sm btn-outline-dark"
              onClick={() => {
                setEventoCopiado(null);
              }}
              title="Cancelar copia"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="bg-dark2 p-4 rounded">
          <div className="row mb-4">
            {/* Panel de salas */}
            <div className="col-md-3">
              <div className="card bg-dark">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="text-white mb-0">Salas</h6>
                  <button
                    className="btn btn-sm custom-btn-gold3"
                    onClick={handleAgregarSala}
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {salas.map(sala => (
                      <div
                        key={sala}
                        className={`list-group-item list-group-item-action bg-dark text-white d-flex justify-content-between align-items-center ${salaActual === sala ? 'active' : ''} animate__animated ${animSalas[sala] || ''}`}
                      >
                        <button
                          className="btn btn-link text-white text-start p-0 flex-grow-1"
                          onClick={() => setSalaActual(sala)}
                        >
                          {sala}
                        </button>
                        {salas.length > 1 && (
                          <button
                            className="btn btn-link text-danger p-0 ms-2"
                            onClick={() => handleEliminarSala(sala)}
                            title="Eliminar sala"
                          >
                            <FaTimes size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-9">
              {/* Configuración de fechas y horarios */}
              <div className="mb-4">
                <h5 className="text-white mb-3">Configuración del Horario</h5>
                
                {/* Reemplazar el InputFieldDate con input type="date" */}
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label text-white">Agregar fecha</label>
                    <div className="input-group">
                      <DatePicker
                        ref={datePickerRef}
                        selected={fechaSeleccionada}
                        onChange={(date) => {
                          setFechaSeleccionada(date);
                          if (date) handleAgregarFecha(date.toISOString().split('T')[0]);
                        }}
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                        className="form-control custom-input-gold"
                        placeholderText="Selecciona una fecha"
                        calendarClassName="custom-datepicker"
                      />
                      <span
                        className="input-group-text custom-btn-gold2"
                        style={{ cursor: "pointer" }}
                        onClick={() => datePickerRef.current.setFocus()}
                        tabIndex={0}
                        role="button"
                        aria-label="Abrir calendario"
                      >
                        <FaClock />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Configuración de horarios */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label text-white">Hora Inicio</label>
                    <div className="input-group">
                      <input
                        ref={horaInicioRef}
                        type="time"
                        className="form-control bg-dark text-white border-secondary"
                        style={{
                          backgroundColor: '#1a1a1a',
                          color: 'white',
                          border: '1px solid #444'
                        }}
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                      />
                      <span
                        className="input-group-text bg-dark text-white border-secondary"
                        style={{ cursor: "pointer" }}
                        onClick={() => horaInicioRef.current.focus()}
                      >
                        <FaClock />
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label text-white">Hora Fin</label>
                    <div className="input-group">
                      <input
                        ref={horaFinRef}
                        type="time"
                        className="form-control bg-dark text-white border-secondary"
                        style={{
                          backgroundColor: '#1a1a1a',
                          color: 'white',
                          border: '1px solid #444'
                        }}
                        value={horaFin}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          if (newTime > horaInicio) {
                            setHoraFin(newTime);
                          } else {
                            Swal.fire({
                              icon: 'error',
                              title: 'Error',
                              text: 'La hora final debe ser posterior a la hora inicial',
                              timer: 2000,
                              showConfirmButton: false
                            });
                          }
                        }}
                      />
                      <span
                        className="input-group-text bg-dark text-white border-secondary"
                        style={{ cursor: "pointer" }}
                        onClick={() => horaFinRef.current.focus()}
                      >
                        <FaClock />
                      </span>
                    </div>
                  </div>
                  <div className={`col-12 col-md-4 ${animIntervalo ? 'animate__animated animate__pulse' : ''}`}>
                    <label className="form-label text-white">Intervalo (min)</label>
                    <div className="input-group">
                      <select
                        ref={intervaloRef}
                        className="form-control bg-dark text-white border-secondary"
                        style={{
                          backgroundColor: '#1a1a1a',
                          color: 'white',
                          border: '1px solid #444'
                        }}
                        value={intervalo}
                        onChange={handleIntervaloChange}
                      >
                        <option value="15">15 minutos</option>
                        <option value="30">30 minutos</option>
                        <option value="45">45 minutos</option>
                        <option value="60">1 hora</option>
                      </select>
                      <span
                        className="input-group-text bg-dark text-white border-secondary"
                        style={{ cursor: "pointer" }}
                        onClick={() => intervaloRef.current.focus()}
                      >
                        <FaClock />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lista de fechas seleccionadas */}
                <div className="d-flex flex-wrap gap-2">
                  {fechas.map((fecha, index) => {
                    const fechaStr = fecha.toISOString().split('T')[0];
                    return (
                      <div
                        key={fechaStr}
                        className={`badge bg-dark p-2 d-flex align-items-center badge-anim animate__animated ${animFechas[fechaStr] || ''}`}
                      >
                        {fecha.toLocaleDateString('es-MX', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                        <button
                          className="btn btn-link btn-sm text-white p-0 ms-2"
                          onClick={() => handleEliminarFecha(fecha)}
                          title="Eliminar fecha"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* Indicador de evento copiado */}
          {/* Tabla de horarios */}
          {fechas.length > 0 && (
            <div className="table-responsive">
              <table className="table table-dark table-bordered">
                <thead>
                  <tr>
                    <th style={{ backgroundColor: '#000', color: '#fff' }}>Hora</th>
                    {fechas.map((fecha, index) => (
                      <th 
                        key={index}
                        style={{ backgroundColor: '#000', color: '#fff', minWidth: '200px' }}
                      >
                        {fecha.toLocaleDateString('es-MX', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generateTimeSlots(horaInicio, horaFin, intervalo).map((slot) => (
                    <tr key={slot.value}>
                      <td style={{ backgroundColor: '#000', color: '#fff', whiteSpace: 'nowrap' }}>
                        {slot.label}
                      </td>
                      {fechas.map((fecha) => {
                        const eventoInicia = eventos.find(e =>
                          e.fecha.getTime() === fecha.getTime() &&
                          e.horaInicio === slot.value &&
                          e.sala === salaActual
                        );
                        
                        const estaOcupada = esCeldaOcupadaPorEvento(fecha, slot.value, salaActual);
                        
                        if (eventoInicia) {
                          return (
                            <EventoDraggable
                              key={`${fecha.getTime()}-${slot.value}`}
                              evento={eventoInicia}
                              index={eventos.indexOf(eventoInicia)}
                              moveEvento={moveEvento}
                            />
                          );
                        } else if (estaOcupada) {
                          return null;
                        } else {
                          return (
                            <td
                              key={`${fecha.getTime()}-${slot.value}`}
                              style={{
                                backgroundColor: eventoCopiado ? 'rgba(184, 134, 11, 0.05)' : '#000',
                                cursor: 'pointer',
                                border: eventoCopiado ? '1px solid rgba(184, 134, 11, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                                position: 'relative'
                              }}
                              onClick={() => {
                                if (eventoCopiado) {
                                  handlePegarEvento(fecha, slot.value, salaActual);
                                } else {
                                  handleAgregarEvento(fecha, slot.value, salaActual);
                                }
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                if (eventoCopiado) {
                                  handlePegarEvento(fecha, slot.value, salaActual);
                                } else {
                                  Swal.fire({
                                    icon: 'info',
                                    title: 'No hay evento copiado',
                                    text: 'Primero copia un evento haciendo clic derecho sobre él',
                                    timer: 2000,
                                    showConfirmButton: false
                                  });
                                }
                              }}
                            >
                              {eventoCopiado && (
                                <div 
                                  style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '2px',
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#b8860b',
                                    borderRadius: '50%',
                                    opacity: 0.6
                                  }}
                                />
                              )}
                            </td>
                          );
                        }
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal con fondo oscuro */}
          {editingEvento && (
            <div className="modal show" style={{ display: 'block' }}>
              <div className="modal-dialog">
                <div className="modal-content" style={{ backgroundColor: '#1a1a1a' }}>
                  <div className="modal-header border-secondary">
                    <h5 className="modal-title text-white">Editar Evento</h5>
                    <button 
                      type="button" 
                      className="btn-close btn-close-white" 
                      onClick={() => setEditingEvento(null)} 
                    />
                  </div>
                  <div className="modal-body">
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary mb-3"
                      placeholder="Título del evento"
                      value={editingEvento.titulo}
                      onChange={(e) => setEditingEvento({
                        ...editingEvento,
                        titulo: e.target.value
                      })}
                    />
                    <select
                      className="form-control bg-dark text-white border-secondary mb-3"
                      value={editingEvento.tipo}
                      onChange={(e) => setEditingEvento({
                        ...editingEvento,
                        tipo: e.target.value
                      })}
                    >
                      <option value="presentacion">Presentación</option>
                      <option value="receso">Receso</option>
                      <option value="otro">Otro</option>
                    </select>
                    <input
                      type="number"
                      className="form-control bg-dark text-white border-secondary mb-3"
                      placeholder="Duración (minutos)"
                      value={editingEvento.duracion}
                      onChange={(e) => setEditingEvento({
                        ...editingEvento,
                        duracion: parseInt(e.target.value)
                      })}
                      step={intervalo}
                    />
                    <div className="d-flex align-items-center">
                      <label className="text-white me-2">Color:</label>
                      <input
                        type="color"
                        className="form-control form-control-color"
                        value={editingEvento.color}
                        onChange={(e) => setEditingEvento({
                          ...editingEvento,
                          color: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-gold">
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setEventos(eventos.filter(e => e.id !== editingEvento.id));
                        setEditingEvento(null);
                      }}
                    >
                      <FaTrash className="me-2" />
                      Eliminar
                    </button>
                    <button
                      className="btn custom-btn-gold"
                      onClick={() => {
                        setEventos(eventos.map(e => 
                          e.id === editingEvento.id ? editingEvento : e
                        ));
                        setEditingEvento(null);
                      }}
                    >
                      <FaSave className="me-2" />
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón guardar */}
          <div className="text-end mt-4">
            <button
              className="btn custom-btn-gold3"
              onClick={handleGuardarHorarios}
            >
              <FaSave className="me-2" />
              Guardar Horarios
            </button>
          </div>

          
        </div>
      </div>
    </DndProvider>
  );
};

// Keep generateTimeSlots outside since it doesn't depend on component state
const generateTimeSlots = (inicio, fin, intervalo) => {
  const slots = [];
  let current = new Date(`2000-01-01T${inicio}`);
  const endTime = new Date(`2000-01-01T${fin}`);

  while (current < endTime) {
    const timeStr = current.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    
    const next = new Date(current.getTime() + intervalo * 60000);
    const nextTimeStr = next.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    
    slots.push({ 
      label: `${timeStr}-${nextTimeStr}`, 
      value: timeStr 
    });
    current = next;
  }
  return slots;
};

export default HorariosCongreso;