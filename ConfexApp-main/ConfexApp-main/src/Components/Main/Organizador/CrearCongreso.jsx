import React, { useState, useEffect, useContext, useCallback } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../../Context/DataContext.jsx";
import Swal from "sweetalert2";
import { FaDeleteLeft } from "react-icons/fa6";
import { useJsApiLoader } from "@react-google-maps/api";

import InputField from "./Components/InputField.jsx";
import TagInput from "./Components/TagInput.jsx";
import InputFieldDate from "./Components/InputFieldDate.jsx";
import UserInput from "./Components/UserInput.jsx";
import TematicInput from "./Components/TematicInput.jsx";
import UserTematicInput from "./Components/UserTematicInput.jsx";
import Map from "./Components/Map.jsx";

const phoneValidation = (value) =>
  /^\d{10}$/.test(value.trim()) ||
  "*El teléfono debe tener exactamente 10 dígitos.";

const emailValidation = (value) =>
  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value.trim()) ||
  "*Formato de correo inválido.";

const urlValidation = (value) =>
  /^(http?:\/\/)(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/[^\s]*)?$/.test(
    value.trim()
  ) || "*Formato de URL inválido.";

const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const defaultCenter = { lat: 19.432924, lng: -99.131355 };

const GOOGLE_MAPS_LIBRARIES = ["places"];

const CrearCongreso = () => {
  const navigate = useNavigate();
  const { user } = useContext(DataContext);
  const [img, setImg] = useState("");
  const [fotoCongreso, setFotoCongreso] = useState(null);
  const [tematicas, setTematicas] = useState([]);
  const [usuariosLista, setUsuariosLista] = useState([]);
  const [userIdentifier, setUserIdentifier] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(defaultCenter);
  const [archivoConvocatoria, setArchivoConvocatoria] = useState(null);
  const [archivoURL, setArchivoURL] = useState(null);
  const [step, setStep] = useState(1);

  const roles = [
    { value: "e", label: "Evaluador" },
    { value: "r", label: "Registrador" },
    { value: "c", label: "Conferencista" },
    { value: "erc", label: "Todos" },
  ];

  const {
    handleSubmit,
    setValue,
    getValues,
    control,
    trigger,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const convocatoriaInicio = useWatch({ control, name: "convocatoriaInicio" });
  const convocatoriaFin = useWatch({ control, name: "convocatoriaFin" });
  const evaluacionInicio = useWatch({ control, name: "evaluacionInicio" });
  const evaluacionFin = useWatch({ control, name: "evaluacionFin" });
  const dictamenInicio = useWatch({ control, name: "dictamenInicio" });
  const dictamenFin = useWatch({ control, name: "dictamenFin" });
  const eventoInicio = useWatch({ control, name: "eventoInicio" });
  const tematicasSeleccionadas = useWatch({ control, name: "tematicas" }) || [];

  const fetchTematicas = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Congresos/tematicas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error desconocido en el servidor");
      }
      const data = await response.json();
      setTematicas(data);
    } catch (err) {
      console.error("Error en fetchTematicas:", err);
    }
  }, [setTematicas]);

  useEffect(() => {
    fetchTematicas();
    const interval = setInterval(fetchTematicas, 30000);
    return () => clearInterval(interval);
  }, []);

  function getNextDayMidnight(date) {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  }

  const handleImageUpload = (e) => {
    const foto = e.target.files[0];
    if (!foto) return;
    const maxSizeMB = 2;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (foto.size > maxSizeBytes) {
      Swal.fire({
        icon: "error",
        title: "Archivo demasiado grande",
        text: `La imagen no debe superar los ${maxSizeMB} MB.`,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
      return;
    }
    setFotoCongreso(foto);
    const reader = new FileReader();
    reader.onload = () => {
      setImg(reader.result);
      setValue("fotoCongresoBase64", reader.result);
    };
    reader.readAsDataURL(foto);
  };

  const handleArchivoConvocatoria = async (e, onChange) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSizeMB = 50;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.type !== "application/pdf") {
      alert("Por favor selecciona un archivo PDF válido.");
      return;
    }
    if (file.size > maxSizeBytes) {
      alert(`El archivo no debe superar los ${maxSizeMB}MB.`);
      return;
    }
    setArchivoConvocatoria(file);
    const url = URL.createObjectURL(file);
    setArchivoURL(url);
    onChange(file);
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (!["e", "erc"].includes(rolSeleccionado)) {
      setValue("tematicasEvaluador", []);
    }
  }, [rolSeleccionado, setValue]);

  const buscarUsuario = useCallback(async () => {
    if (!userIdentifier.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ingrese un correo o nombre de usuario para buscar",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
      return;
    }
    try {
      const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/User/buscar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: userIdentifier }),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error desconocido en el servidor");
      }
      const usuario = await response.json();

      const yaRegistrado = usuariosLista.find(
        (u) => u.idUsuario === usuario.idUsuario
      );
      const esEvaluador = rolSeleccionado.includes("e");
      const esRegistrador = rolSeleccionado.includes("r");
      const esConferencista = rolSeleccionado.includes("c");
      const tematicasEvaluador = getValues("tematicasEvaluador") || [];
      const nuevasTematicas = tematicasEvaluador.map((t) => t.value);

      if (yaRegistrado) {
        const yaTieneRol =
          (esRegistrador && yaRegistrado.registrador) ||
          (esConferencista && yaRegistrado.conferencista);

        if (yaTieneRol) {
          throw new Error("El usuario ya está registrado con ese rol.");
        }

        const tematicasExistentes = yaRegistrado.tematicasEvaluador || [];

        if (esEvaluador && yaRegistrado.evaluador) {
          const tematicasNuevasUnicas = nuevasTematicas.filter(
            (t) => !tematicasExistentes.includes(t)
          );
          if (tematicasNuevasUnicas.length === 0) {
            throw new Error(
              "El usuario ya está registrado como evaluador con esas temáticas."
            );
          }
          const actualizados = usuariosLista.map((u) =>
            u.idUsuario === usuario.idUsuario
              ? {
                  ...u,
                  evaluador: true,
                  registrador: u.registrador || esRegistrador,
                  conferencista: u.conferencista || esConferencista,
                  tematicasEvaluador: [
                    ...tematicasExistentes,
                    ...tematicasNuevasUnicas,
                  ],
                }
              : u
          );
          setUsuariosLista(actualizados);
          Swal.fire({
            icon: "info",
            title: "Temáticas actualizadas",
            html: `El usuario ya era evaluador. Se agregaron las siguientes temáticas nuevas:<br><strong>${tematicasNuevasUnicas.join(
              ", "
            )}</strong>`,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#9b59b6",
            background: "#6c757d",
            color: "#ffffff",
          });
        } else {
          const actualizados = usuariosLista.map((u) =>
            u.idUsuario === usuario.idUsuario
              ? {
                  ...u,
                  evaluador: u.evaluador || esEvaluador,
                  registrador: u.registrador || esRegistrador,
                  conferencista: u.conferencista || esConferencista,
                  tematicasEvaluador: esEvaluador
                    ? [...(u.tematicasEvaluador || []), ...nuevasTematicas]
                    : u.tematicasEvaluador || [],
                }
              : u
          );
          setUsuariosLista(actualizados);
          Swal.fire({
            icon: "success",
            title: "Usuario actualizado",
            text: "El usuario ha sido actualizado con nuevos roles o temáticas.",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#9b59b6",
            background: "#6c757d",
            color: "#ffffff",
          });
        }
      } else {
        setUsuariosLista([
          ...usuariosLista,
          {
            idUsuario: usuario.idUsuario,
            nombre: `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`,
            correo: usuario.correo,
            nombreUsuario: usuario.nombreUsuario,
            evaluador: esEvaluador,
            registrador: esRegistrador,
            conferencista: esConferencista,
            tematicasEvaluador: esEvaluador ? nuevasTematicas : [],
          },
        ]);
      }
      Swal.fire({
        icon: "success",
        title: "Usuario agregado",
        text: "El usuario ha sido agregado a la lista",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
      setValue("staff", null);
      setValue("tematicasEvaluador", []);
      setRolSeleccionado("");
      setUserIdentifier("");
      setValue("UserIdentifier", "");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Ocurrió un error...",
        text: err.message || "Hubo un problema al agregar el usuario.",
        confirmButtonText: "Reintentar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
    }
  }, [
    userIdentifier,
    usuariosLista,
    rolSeleccionado,
    getValues,
    setValue,
    setUsuariosLista,
    setRolSeleccionado,
    setUserIdentifier,
  ]);

  const eliminarUsuario = (idUsuario) => {
    setUsuariosLista(usuariosLista.filter((u) => u.idUsuario !== idUsuario));
  };

  const convertDatesToUTC = (data) => {
    const fieldsToConvert = [
      "convocatoriaInicio",
      "convocatoriaFin",
      "evaluacionInicio",
      "evaluacionFin",
      "dictamenInicio",
      "dictamenFin",
      "eventoInicio",
      "eventoFin",
    ];
    const converted = { ...data };
    fieldsToConvert.forEach((field) => {
      const value = data[field];
      converted[field] = value ? new Date(value).toISOString() : null;
    });
    return converted;
  };

  const validarStep1 = async () => {
    const valido = await trigger([
      "fotoCongresoBase64",
      "nombreCongreso",
      "correoContacto",
      "telefonoContacto",
      "sitioWeb",
    ]);
    if (valido) setStep(2);
  };

  const validarStep2 = async () => {
    const valido = await trigger([
      "horasMinimas",
      "convocatoriaInicio",
      "convocatoriaFin",
      "evaluacionInicio",
      "evaluacionFin",
      "dictamenInicio",
      "dictamenFin",
      "eventoInicio",
      "eventoFin",
    ]);
    if (valido) setStep(3);
  };

  const validarStep3 = async () => {
    const valido = await trigger(["tematicas", "tematicasExtra"]);
    if (valido) setStep(4);
  };

  const validarStep4 = async () => {
    const valido = await trigger(["ubicacion"]);
    if (valido) setStep(5);
  };

  const validarStep5 = async () => {
    const valido = await trigger([
      "UserIdentifier",
      "staff",
      "tematicasEvaluador",
    ]);
    if (valido) setStep(6);
  };

  const onSubmit = useCallback(
    async (data) => {
      try {
        if (!user.idUsuario) {
          throw new Error("No hay usuario autenticado");
        }
        const payload = convertDatesToUTC(data);
        const formData = new FormData();
        if (archivoConvocatoria) {
          formData.append("archivo", archivoConvocatoria);
        }
        if (fotoCongreso) {
          formData.append("foto", fotoCongreso);
        }
        const congresoData = {
          idUsuario: user.idUsuario,
          nombreCongreso: data.nombreCongreso,
          horasMinimas: data.horasMinimas,
          correoContacto: data.correoContacto,
          telefonoContacto: data.telefonoContacto,
          sitioWeb: data.sitioWeb,
          fechasCongreso: {
            convocatoriaInicio: payload.convocatoriaInicio,
            convocatoriaFin: payload.convocatoriaFin,
            evaluacionInicio: payload.evaluacionInicio,
            evaluacionFin: payload.evaluacionFin,
            dictamenInicio: payload.dictamenInicio,
            dictamenFin: payload.dictamenFin,
            eventoInicio: payload.eventoInicio,
            eventoFin: payload.eventoFin,
          },
          tematicas: {
            tematicas: tematicasSeleccionadas?.map((t) => t.value) || [],
            tematicasExtra: data.tematicasExtra || [],
          },
          ubicacion: {
            latitud: selectedLocation.lat,
            longitud: selectedLocation.lng,
          },
          staff: usuariosLista,
        };
        formData.append(
          "data",
          new Blob([JSON.stringify(congresoData)], { type: "application/json" })
        );

        const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/Congresos/altaCongreso", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Error desconocido en el servidor");
        }
        Swal.fire({
          icon: "success",
          title: "¡Congreso creado!",
          text: "El congreso se ha creado exitosamente.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        }).then(() => {
          navigate("/Main/Mis-congresos");
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Ocurrió un error...",
          text: error.message || "Hubo un problema al crear el congreso.",
          confirmButtonText: "Reintentar",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        });
      }
    },
    [
      user,
      selectedLocation,
      usuariosLista,
      archivoConvocatoria,
      fotoCongreso,
      tematicasSeleccionadas,
      navigate,
      convertDatesToUTC,
    ]
  );

  return (
    <div className="w-100 d-flex justify-content-center">
      <div
        className="custom-scrollbar text-start w-100 p-0 px-3"
        style={{
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 mb-md-0 pt-2 ps-sm-5">
          <h3 className="custom-font-titleArticle-gold text-center">
            Crear congreso
          </h3>
        </div>
        <div className="row d-flex justify-content-center align-items-center py-md-3 px-md-5">
          <div className="p-3 bg-dark bg-dark2 rounded w-100 d-flex justify-content-center align-items-center">
            <div className="col d-flex align-items-center justify-content-center container-custom w-100 h-100">
              <form onSubmit={handleSubmit(onSubmit)} className="w-100 h-100">
                {step === 1 ? (
                  <>
                    <div className="col d-flex flex-column align-items-center justify-content-center justify-content-md-start w-100 h-100">
                      <div className="row d-flex justify-content-center justify-content-md-start align-items-center w-100">
                        <h3 className="custom-font-subtitleArticle2-gold d-flex justify-content-center justify-content-md-start align-items-center text-center">
                          Información general
                        </h3>
                      </div>
                      <div className="col d-flex flex-column flex-md-row align-items-center justify-content-center w-100 h-100 mt-md-3 px-3">
                        <div className="row col-md-4 d-flex align-items-center justify-content-center h-100 mb-3 mt-3 mt-md-0 mb-md-0 containerbtn">
                          <Controller
                            name="fotoCongresoBase64"
                            control={control}
                            rules={{
                              required: "La foto del congreso es obligatoria",
                            }}
                            defaultValue=""
                            render={({ field: { onChange } }) => (
                              <>
                                <div className="d-flex flex-column justify-content-center align-items-center p-0 btnc2">
                                  {img ? (
                                    <img
                                      src={img}
                                      alt="Vista previa"
                                      className="custom-profile-img img-fluid"
                                      style={{
                                        width: "220px",
                                        height: "220px",
                                        objectFit: "cover",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        document
                                          .getElementById("fotoCongreso")
                                          .click()
                                      }
                                    />
                                  ) : (
                                    <button
                                      type="button"
                                      className="custom-btn-gold2 py-3 px-3 fw-bold d-flex justify-content-center align-items-center w-100 h-100"
                                      style={{
                                        background: "rgba(255, 255, 255, 0.07)",
                                      }}
                                      onClick={() =>
                                        document
                                          .getElementById("fotoCongreso")
                                          .click()
                                      }
                                    >
                                      Subir foto del congreso
                                    </button>
                                  )}
                                  <input
                                    type="file"
                                    autoComplete="off"
                                    id="fotoCongreso"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                      handleImageUpload(e);
                                      onChange(e);
                                    }}
                                  />
                                  {errors.fotoCongresoBase64 && (
                                    <small className="custom-font-Extrasmall fw-bold">
                                      {errors.fotoCongresoBase64.message}
                                    </small>
                                  )}
                                </div>
                              </>
                            )}
                          />
                        </div>
                        <div className="row col-md d-flex align-items-center justify-content-center w-100 h-100">
                          <div className="row p-0 mb-3">
                            <InputField
                              label="Nombre del Congreso"
                              name="nombreCongreso"
                              control={control}
                              errors={errors}
                              validationRules={{
                                required:
                                  "El nombre del congreso es obligatorio.",
                                maxLength: {
                                  value: 120,
                                  message: "*La longitud máxima es de 120.",
                                },
                                minLength: {
                                  value: 10,
                                  message: "*La longitud mínima es de 10.",
                                },
                              }}
                            />
                          </div>
                          <div className="row p-0 mb-3">
                            <InputField
                              label="(Opcional) Correo de contacto"
                              name="correoContacto"
                              control={control}
                              errors={errors}
                              validationRules={{
                                validate: (value) =>
                                  value === "" || emailValidation(value),
                              }}
                            />
                          </div>
                          <div className="row p-0 mb-3">
                            <InputField
                              label="(Opcional) Teléfono de contacto"
                              type="tel"
                              name="telefonoContacto"
                              control={control}
                              errors={errors}
                              validationRules={{
                                validate: (value) =>
                                  value === "" || phoneValidation(value),
                              }}
                            />
                          </div>
                          <div className="row p-0">
                            <InputField
                              label="(Opcional) Sitio Web externo"
                              name="sitioWeb"
                              control={control}
                              errors={errors}
                              validationRules={{
                                validate: (value) =>
                                  value === "" || urlValidation(value),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mt-4 d-flex justify-content-center justify-content-md-end gap-3 w-100">
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                            onClick={() => navigate("/Main/Mis-congresos")}
                          >
                            Cancelar
                          </button>
                        </div>
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                            onClick={validarStep1}
                          >
                            Continuar
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : step === 2 ? (
                  <>
                    <div className="col d-flex flex-column align-items-center justify-content-center justify-content-md-start w-100 h-100">
                      <div className="row d-flex justify-content-center justify-content-md-start align-items-center w-100">
                        <h3 className="custom-font-subtitleArticle2-gold d-flex justify-content-center justify-content-md-start align-items-center text-center">
                          Periodos del evento
                        </h3>
                      </div>
                      <div className="row d-flex align-items-center justify-content-center h-100 mb-3 mt-3 mb-md-0 w-100 px-2">
                        <InputField
                          label="Horas mínimas de asistencia"
                          name="horasMinimas"
                          type="number"
                          control={control}
                          errors={errors}
                          validationRules={{
                            required:
                              "Las horas mínimas de asistencia para la generación de constancias es obligatoria.",
                            min: {
                              value: 1,
                              message:
                                "*Las horas mínimas deben ser al menos 1.",
                            },
                          }}
                          inputProps={{ min: 1 }}
                        />
                      </div>
                      <div className="row d-flex flex-column flex-md-row align-items-center justify-content-center w-100 h-100 mt-md-3">
                        <div className="row d-flex align-items-center justify-content-center w-100 h-100 p-0 gap-3 gap-md-0 mb-3">
                          <div className="col-md-6">
                            <InputFieldDate
                              label="Inicio de la convocatoria"
                              name="convocatoriaInicio"
                              control={control}
                              errors={errors}
                              minDate={new Date()}
                              disabled={false}
                              restrictTimeToNow={true}
                              rules={{
                                required:
                                  "La fecha de inicio de la convocatoria es obligatoria.",
                              }}
                            />
                          </div>
                          <div className="col-md-6">
                            <InputFieldDate
                              label="Fin de la convocatoria"
                              name="convocatoriaFin"
                              control={control}
                              errors={errors}
                              minDate={
                                convocatoriaInicio
                                  ? getNextDayMidnight(convocatoriaInicio)
                                  : new Date()
                              }
                              disabled={!convocatoriaInicio}
                              rules={{
                                required:
                                  "La fecha de fin de la convocatoria es obligatoria.",
                              }}
                            />
                          </div>
                        </div>
                        <div className="row d-flex align-items-center justify-content-center w-100 h-100 p-0 gap-3 gap-md-0 mb-3">
                          <div className="col-md-6">
                            <InputFieldDate
                              label="Inicio de evaluaciones"
                              name="evaluacionInicio"
                              control={control}
                              errors={errors}
                              minDate={
                                convocatoriaFin
                                  ? getNextDayMidnight(convocatoriaFin)
                                  : null
                              }
                              disabled={!convocatoriaFin}
                              rules={{
                                required:
                                  "La fecha de inicio de las evaluaciones es obligatoria.",
                              }}
                            />
                          </div>
                          <div className="col-md-6">
                            <InputFieldDate
                              label="Fin de las evaluaciones"
                              name="evaluacionFin"
                              control={control}
                              errors={errors}
                              minDate={
                                evaluacionInicio
                                  ? getNextDayMidnight(evaluacionInicio)
                                  : null
                              }
                              disabled={!evaluacionInicio}
                              rules={{
                                required:
                                  "La fecha de fin de las evaluaciones es obligatoria.",
                              }}
                            />
                          </div>
                        </div>
                        <div className="row d-flex align-items-center justify-content-center w-100 h-100 p-0 gap-3 gap-md-0 mb-3">
                          <div className="col-md-6">
                            <InputFieldDate
                              label="Inicio del dictamen"
                              name="dictamenInicio"
                              control={control}
                              errors={errors}
                              minDate={
                                evaluacionFin
                                  ? getNextDayMidnight(evaluacionFin)
                                  : null
                              }
                              disabled={!evaluacionFin}
                              rules={{
                                required:
                                  "La fecha de inicio del dictamen es obligatoria.",
                              }}
                            />
                          </div>
                          <div className="col-md-6">
                            <InputFieldDate
                              label="Fin del dictamen"
                              name="dictamenFin"
                              control={control}
                              errors={errors}
                              minDate={
                                dictamenInicio
                                  ? getNextDayMidnight(dictamenInicio)
                                  : null
                              }
                              disabled={!dictamenInicio}
                              rules={{
                                required:
                                  "La fecha de fin del dictamen es obligatoria.",
                              }}
                            />
                          </div>
                        </div>
                        <div className="row d-flex align-items-center justify-content-center w-100 h-100 p-0 gap-3 gap-md-0">
                          <div className="col-md-6">
                            <InputFieldDate
                              label="Inicio del evento"
                              name="eventoInicio"
                              control={control}
                              errors={errors}
                              minDate={
                                dictamenFin
                                  ? getNextDayMidnight(dictamenFin)
                                  : null
                              }
                              disabled={!dictamenFin}
                              rules={{
                                required:
                                  "La fecha de inicio del evento es obligatoria.",
                              }}
                            />
                          </div>
                          <div className="col-md-6">
                            <InputFieldDate
                              label="Fin del evento"
                              name="eventoFin"
                              control={control}
                              errors={errors}
                              minDate={
                                eventoInicio
                                  ? getNextDayMidnight(eventoInicio)
                                  : null
                              }
                              disabled={!eventoInicio}
                              rules={{
                                required:
                                  "La fecha de fin del evento es obligatoria.",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mt-4 d-flex justify-content-center justify-content-md-end gap-3 w-100">
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                            onClick={() => setStep(1)}
                          >
                            Volver
                          </button>
                        </div>
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                            onClick={validarStep2}
                          >
                            Continuar
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : step === 3 ? (
                  <>
                    <div className="col d-flex flex-column align-items-center justify-content-center justify-content-md-start w-100 h-100">
                      <div className="row d-flex justify-content-center justify-content-md-start align-items-center w-100">
                        <h3 className="custom-font-subtitleArticle2-gold d-flex justify-content-center justify-content-md-start align-items-center text-center">
                          Temáticas del evento
                        </h3>
                      </div>
                      <div className="row d-flex align-items-center justify-content-center h-100 mb-3 mt-3 mb-md-0 w-100 px-2">
                        <div className="form-floating mb-3">
                          <TematicInput
                            name="tematicas"
                            label="Selecciona las temáticas del congreso"
                            control={control}
                            errors={errors}
                            tematicas={tematicas}
                          />
                        </div>
                      </div>
                      <div className="row d-flex align-items-center justify-content-center h-100 mb-3 mt-3 mb-md-0 w-100 px-2">
                        <TagInput
                          control={control}
                          name="tematicasExtra"
                          errors={errors}
                          label="(Opcional) Temáticas específicas"
                          minLength={5}
                        />
                      </div>
                      <div className="row mt-4 d-flex justify-content-center justify-content-md-end gap-3 w-100">
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                            onClick={() => setStep(2)}
                          >
                            Volver
                          </button>
                        </div>
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                            onClick={validarStep3}
                          >
                            Continuar
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : step === 4 ? (
                  <>
                    <div className="col d-flex flex-column align-items-center justify-content-center justify-content-md-start w-100 h-100">
                      <div className="row d-flex justify-content-center justify-content-md-start align-items-center w-100">
                        <h3 className="custom-font-subtitleArticle2-gold d-flex justify-content-center justify-content-md-start align-items-center text-center">
                          Ubicación del evento
                        </h3>
                      </div>
                      <div className="row d-flex align-items-center justify-content-center h-100 mb-3 mt-3 mb-md-0 w-100 px-2">
                        <div className="col p-0">
                          {isLoaded && (
                            <Controller
                              name="ubicacion"
                              control={control}
                              defaultValue={selectedLocation}
                              render={({ field: { onChange } }) => (
                                <>
                                  <Map
                                    selectedLocation={selectedLocation}
                                    setSelectedLocation={(location) => {
                                      setSelectedLocation(location);
                                      onChange(location);
                                    }}
                                  />
                                  <div className="text-center custom-font-normal mt-2">
                                    <small>
                                      Latitud: {selectedLocation.lat.toFixed(6)}
                                      , Longitud:{" "}
                                      {selectedLocation.lng.toFixed(6)}
                                    </small>
                                  </div>
                                </>
                              )}
                            />
                          )}
                        </div>
                      </div>
                      <div className="row mt-4 d-flex justify-content-center justify-content-md-end gap-3 w-100">
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                            onClick={() => setStep(3)}
                          >
                            Volver
                          </button>
                        </div>
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                            onClick={validarStep4}
                          >
                            Continuar
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : step === 5 ? (
                  <>
                    <div className="col d-flex flex-column align-items-center justify-content-center justify-content-md-start w-100 h-100">
                      <div className="row d-flex justify-content-center justify-content-md-start align-items-center w-100">
                        <h3 className="custom-font-subtitleArticle2-gold d-flex justify-content-center justify-content-md-start align-items-center text-center">
                          Selección del Staff
                        </h3>
                      </div>
                      <div className="row d-flex align-items-center justify-content-center h-100 mb-3 mt-3 w-100 px-2">
                        <Controller
                          name="UserIdentifier"
                          control={control}
                          defaultValue=""
                          render={({ field: { onChange, value, ref } }) => (
                            <div className="form-floating">
                              <input
                                name="UserIdentifier"
                                id="UserIdentifier"
                                type="text"
                                autoComplete="off"
                                className="form-control custom-input-gold text-center fw-bold h-100"
                                placeholder="Buscar por correo o nombre de usuario"
                                value={value}
                                ref={ref}
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  onChange(inputValue);
                                  setUserIdentifier(inputValue);
                                  if (!inputValue) {
                                    setValue("staff", "");
                                    setValue("tematicasEvaluador", []);
                                    setRolSeleccionado("");
                                  }
                                }}
                              />
                            </div>
                          )}
                        />
                      </div>
                      <div className="row d-flex align-items-center justify-content-center h-100 mb-3 mt-3 w-100 px-2">
                        <UserInput
                          control={control}
                          name="staff"
                          errors={errors}
                          setRolSeleccionado={setRolSeleccionado}
                          roles={roles}
                        />
                      </div>
                      {(rolSeleccionado === "e" ||
                        rolSeleccionado === "erc") && (
                        <div className="row d-flex align-items-center justify-content-center h-100 mb-3 mt-3 w-100 px-2">
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <UserTematicInput
                              control={control}
                              name="tematicasEvaluador"
                              errors={errors}
                              tematicas={tematicasSeleccionadas}
                              rolSeleccionado={rolSeleccionado}
                            />
                          </div>
                        </div>
                      )}
                      <div className="row d-flex align-items-center justify-content-center h-100 mb-3 mt-3 w-100 px-2">
                        <button
                          type="button"
                          className="btn btn-outline-light custom-btn-gold2 fw-bold w-100 d-md-inline-block mt-2 mt-md-0"
                          style={{
                            borderRadius: "30px",
                            height: "100%",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() => {
                            const rolValido = roles.find(
                              (rol) =>
                                rol.label === rolSeleccionado ||
                                rol.value === rolSeleccionado
                            );
                            const requiereTematicas = ["e", "erc"].includes(
                              rolSeleccionado
                            );
                            const tematicasValidas =
                              !requiereTematicas ||
                              tematicasSeleccionadas.length > 0;

                            if (
                              rolValido &&
                              userIdentifier.trim() &&
                              tematicasValidas
                            ) {
                              buscarUsuario();
                            }
                          }}
                          disabled={
                            !roles.some(
                              (rol) =>
                                rol.label === rolSeleccionado ||
                                rol.value === rolSeleccionado
                            ) ||
                            userIdentifier.trim().length === 0 ||
                            (["e", "erc"].includes(rolSeleccionado) &&
                              tematicasSeleccionadas.length === 0)
                          }
                        >
                          Agregar
                        </button>
                      </div>
                      <div className="row d-flex align-items-center justify-content-center h-100 w-100 px-2">
                        <div className="table-responsive mt-2">
                          <table className="table table-dark table-hover custom-font-subtitleArticle-gold custom-font-normalArticle w-100 h-100">
                            <thead
                              style={{
                                verticalAlign: "middle",
                                textAlign: "center",
                              }}
                            >
                              <tr>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Nombre de usuario</th>
                                <th>Roles</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody
                              className="w-100 h-100"
                              style={{
                                verticalAlign: "middle",
                                textAlign: "center",
                              }}
                            >
                              {usuariosLista.map((usuario) => (
                                <tr
                                  key={usuario.idUsuario}
                                  className="w-100 h-100"
                                >
                                  <td>{usuario.nombre}</td>
                                  <td>{usuario.correo}</td>
                                  <td>{usuario.nombreUsuario}</td>
                                  <td>
                                    <div className="d-flex flex-column">
                                      {usuario.evaluador && (
                                        <div>
                                          <strong>Evaluador de:</strong>{" "}
                                          {(usuario.tematicasEvaluador || [])
                                            .map((id) => {
                                              const tematica = tematicas.find(
                                                (t) => t.idTematica === id
                                              );
                                              return tematica
                                                ? tematica.nombre
                                                : `ID ${id}`;
                                            })
                                            .join(", ")}
                                        </div>
                                      )}
                                      {usuario.registrador && (
                                        <div>
                                          <strong>Registrador</strong>
                                        </div>
                                      )}
                                      {usuario.conferencista && (
                                        <div>
                                          <strong>Conferencista</strong>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="w-100 h-100">
                                    <div className="d-flex justify-content-center align-items-center w-100 h-100">
                                      <button
                                        type="button"
                                        className="btn btn-danger d-flex justify-content-center align-items-center p-2"
                                        style={{
                                          width: "60%",
                                          height: "50%",
                                          borderRadius: "50%",
                                        }}
                                        onClick={() =>
                                          eliminarUsuario(usuario.idUsuario)
                                        }
                                      >
                                        <FaDeleteLeft
                                          style={{
                                            height: "80%",
                                            width: "80%",
                                            marginLeft: "-5px",
                                          }}
                                        />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="row mt-4 d-flex justify-content-center justify-content-md-end gap-3 w-100">
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                            onClick={() => setStep(4)}
                          >
                            Volver
                          </button>
                        </div>
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                            onClick={validarStep5}
                          >
                            Continuar
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col d-flex flex-column align-items-center justify-content-center justify-content-md-start w-100 h-100">
                      <div className="row d-flex justify-content-center justify-content-md-start align-items-center w-100">
                        <h3 className="custom-font-subtitleArticle2-gold d-flex justify-content-center justify-content-md-start align-items-center text-center">
                          Subir convocatoria
                        </h3>
                      </div>
                      <div className="row d-flex align-items-center justify-content-center h-100 mb-3 mt-3 mb-md-0 w-100 px-2">
                        <div className="form-floating w-100">
                          <Controller
                            name="archivoConvocatoria"
                            control={control}
                            defaultValue={null}
                            render={({ field: { onChange, ref } }) => (
                              <>
                                {archivoURL ? (
                                  <div className="row d-flex align-items-center justify-content-center h-100 w-100">
                                    <iframe
                                      src={`${archivoURL}#toolbar=1&navpanes=0&scrollbar=1`}
                                      title="Vista previa del PDF"
                                      className="w-100 mb-3"
                                      style={{
                                        height: "50dvh",
                                        border: "1px solid #ccc",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        document
                                          .getElementById("archivoConvocatoria")
                                          .click()
                                      }
                                    />
                                    <button
                                      type="button"
                                      className="custom-btn-gold2 fw-bold w-100 d-flex justify-content-center align-items-center"
                                      onClick={() =>
                                        document
                                          .getElementById("archivoConvocatoria")
                                          .click()
                                      }
                                    >
                                      Subir convocatoria (Max. 50MB)
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    className="custom-btn-gold2 fw-bold w-100 d-flex justify-content-center align-items-center"
                                    onClick={() =>
                                      document
                                        .getElementById("archivoConvocatoria")
                                        .click()
                                    }
                                  >
                                    Subir convocatoria (Max. 50MB)
                                  </button>
                                )}
                                <input
                                  type="file"
                                  id="archivoConvocatoria"
                                  name="archivoConvocatoria"
                                  accept="application/pdf"
                                  autoComplete="off"
                                  style={{ display: "none" }}
                                  ref={ref}
                                  onChange={(e) =>
                                    handleArchivoConvocatoria(e, onChange)
                                  }
                                />
                              </>
                            )}
                          />
                        </div>
                      </div>
                      <div className="row mt-4 d-flex justify-content-center justify-content-md-end gap-3 w-100">
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                            onClick={() => setStep(5)}
                          >
                            Volver
                          </button>
                        </div>
                        <div className="col-auto">
                          <button
                            type="submit"
                            className="btn btn-outline-light custom-btn-gold fw-bold"
                          >
                            Crear Congreso
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearCongreso;
