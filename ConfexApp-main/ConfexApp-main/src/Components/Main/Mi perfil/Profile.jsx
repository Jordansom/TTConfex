import React, { useContext, useCallback, useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { DataContext } from "../../../Context/DataContext.jsx";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import QRCode from "qrcode";
import { pdf } from "@react-pdf/renderer";
import GafetePDF from "../GafetePDF.jsx";

const InputField = ({
  label,
  name,
  type = "text",
  register,
  errors,
  validationRules,
}) => (
  <div className="form-floating mb-4 mb-md-0">
    <input
      type={type}
      {...register(name, validationRules)}
      className="form-control custom-input-gold text-center fw-bold"
      placeholder={label}
      autoComplete="off"
    />
    {errors[name] && (
      <small className="custom-font-Extrasmall fw-bold">
        {errors[name].message}
      </small>
    )}
  </div>
);

const phoneValidation = (value) => {
  if (!value || value.trim() === "") return true;
  return (
    /^\d{10}$/.test(value.trim()) ||
    "*El teléfono debe tener exactamente 10 dígitos."
  );
};

const emailValidation = (value) => {
  if (!value || value.trim() === "") return true;
  return (
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value.trim()) ||
    "*Formato de correo inválido."
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(DataContext);
  const [img, setImg] = useState("");
  const [fotoUsuario, setFotoUsuario] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const generateQR = async () => {
      if (!user.idUsuario) {
        setQrCodeDataUrl("");
        return;
      }
      const qrData = JSON.stringify({
        id: user.idUsuario,
        nombre: user.nombre || "",
        apellidoPaterno: user.apellidoPaterno || "",
        apellidoMaterno: user.apellidoMaterno || "",
      });
      try {
        const dataUrl = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 200,
          color: {
            dark: "#000",
            light: "#FFF",
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        setQrCodeDataUrl("");
      }
    };
    generateQR();
  }, [user]);

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
    setFotoUsuario(foto);
    const reader = new FileReader();
    reader.onload = () => {
      setImg(reader.result);
      setValue("fotoUsuarioBase64", reader.result);
    };
    reader.readAsDataURL(foto);
  };

  const handleDownloadGafete = useCallback(async () => {
    if (!user.idUsuario) {
      Swal.fire({
        icon: "error",
        title: "No hay datos de usuario",
        text: "No se puede generar el gafete sin datos de usuario.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
      return;
    }
    try {
      Swal.fire({
        title: "Generando gafete...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: "#6c757d",
        color: "#ffffff",
      });
      if (!qrCodeDataUrl) {
        throw new Error("No se pudo generar el código QR");
      }
      const blob = await pdf(
        <GafetePDF user={user} qrCodeDataUrl={qrCodeDataUrl} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gafete_${user.idUsuario}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "¡Gafete generado!",
        text: "El gafete se ha descargado correctamente.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
    } catch (error) {
      console.error("Error al generar el gafete:", error);
      Swal.fire({
        icon: "error",
        title: "Error al generar el gafete",
        text: error.message || "Ocurrió un error al generar el gafete.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
    }
  }, [user, qrCodeDataUrl]);

  const handleDelete = useCallback(async () => {
    Swal.fire({
      title: `Eliminar cuenta`,
      text: `Ingrese su contraseña para confirmar la eliminación:`,
      input: "password",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#9b59b6",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancel",
      background: "#6c757d",
      color: "#ffffff",
      preConfirm: (password) => {
        if (!password || password.trim() === "") {
          Swal.showValidationMessage("Debe ingresar una contraseña.");
        }
        return password;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const password = result.value;
          const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/User/delete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idUsuario: user.idUsuario,
              password: password,
            }),
          });

          if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || "Error desconocido en el servidor");
          }

          Swal.fire({
            title: "Su cuenta ha sido eliminada",
            text: `Lamentamos que se vaya...`,
            icon: "success",
            background: "#6c757d",
            color: "#ffffff",
            showConfirmButton: false,
            timer: 2000,
            didClose: () => {
              setUser({
                idUsuario: 0,
                nombre: null,
                apellidoPaterno: null,
                apellidoMaterno: null,
                nombreUsuario: null,
                correo: null,
                administrador: null,
                organizador: null,
                evaluador: null,
                conferencista: null,
                ponente: null,
                registrador: null,
                telefono: null,
                fotoUsuarioUrl: null,
              });
              navigate("/", { replace: true });
            },
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Ocurrio un error...",
            text: err.message || "Hubo un problema al eliminar la cuenta.",
            confirmButtonText: "Reintentar",
            confirmButtonColor: "#9b59b6",
            background: "#6c757d",
            color: "#ffffff",
          });
        }
      }
    });
  }, [navigate, user, setUser]);

  const handleGeneralSubmit = useCallback(
    async (data) => {
      if (
        data.nombre === "" &&
        data.fotoUsuarioBase64 === "" &&
        data.apellidoPaterno === "" &&
        data.apellidoMaterno === "" &&
        data.nombreUsuario === "" &&
        data.telefono === ""
      ) {
        return;
      }
      try {
        const cleanedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            value === "" ? null : value,
          ])
        );
        const updateData = {
          ...cleanedData,
          idUsuario: user.idUsuario,
        };
        delete updateData.fotoUsuarioBase64;
        const formData = new FormData();
        if (fotoUsuario) {
          formData.append("foto", fotoUsuario);
        }
        formData.append(
          "data",
          new Blob([JSON.stringify(updateData)], { type: "application/json" })
        );
        const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/User/update", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Error desconocido en el servidor");
        }
        const userData = await response.json();
        reset();
        setImg("");
        setFotoUsuario(null);
        setUser({
          idUsuario: userData.idUsuario,
          nombre: userData.nombre,
          apellidoPaterno: userData.apellidoPaterno,
          apellidoMaterno: userData.apellidoMaterno,
          nombreUsuario: userData.nombreUsuario,
          correo: userData.correo,
          administrador: userData.administrador,
          organizador: userData.organizador,
          evaluador: userData.evaluador,
          conferencista: userData.conferencista,
          ponente: userData.ponente,
          registrador: userData.registrador,
          telefono: userData.telefono,
          fotoUsuarioUrl: userData.fotoUsuarioUrl,
        });

        Swal.fire({
          icon: "success",
          title: "¡Cuenta modificada!",
          text: "Sus datos se han modificado con éxito.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Ocurrio un error...",
          text: err.message || "Hubo un problema al modificar la cuenta.",
          confirmButtonText: "Reintentar",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        });
      }
    },
    [user, setUser, fotoUsuario, setImg, reset, setFotoUsuario]
  );

  const handleSecuritySubmit = async (data) => {
    if (data.newPassword === "" && data.newCorreo === "") {
      return;
    }
    setLoadingSecurity(true);
    const { value: currentPassword, isConfirmed } = await Swal.fire({
      title: "Verificar identidad",
      text: "Ingrese su contraseña actual para continuar:",
      input: "password",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
      confirmButtonColor: "#9b59b6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Verificar",
      cancelButtonText: "Cancelar",
      background: "#6c757d",
      color: "#ffffff",
      preConfirm: (password) => {
        if (!password || password.trim() === "") {
          Swal.showValidationMessage("Debe ingresar una contraseña.");
        }
        return password;
      },
    });

    if (!isConfirmed || !currentPassword) {
      setLoadingSecurity(false);
      return;
    }

    try {
      const res = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/User/verifyPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario: user.idUsuario,
          password: currentPassword,
        }),
      });
      if (!res.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error desconocido en el servidor");
      }

      if (data.newPassword) {
        const res2 = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/User/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idUsuario: user.idUsuario,
            password: data.newPassword,
          }),
        });
        if (!res2.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Error desconocido en el servidor");
        }
        Swal.fire({
          icon: "success",
          title: "Contraseña cambiada correctamente",
          background: "#6c757d",
          color: "#ffffff",
        });
        setValue("newPassword", "");
        setValue("confirmNewPassword", "");
        setLoadingSecurity(false);
      }

      if (data.newCorreo) {
        const res3 = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/User/requestEmailChange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombreUsuario: user.nombreUsuario,
            correo: data.newCorreo,
          }),
        });
        if (!res3.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Error desconocido en el servidor");
        }

        let verified = false;
        while (!verified) {
          const result = await Swal.fire({
            title: "Verifica tu correo",
            text: "Ingresa el código que recibiste en tu nuevo correo.",
            input: "text",
            inputAttributes: {
              maxlength: 6,
              autocapitalize: "off",
              autocorrect: "off",
            },
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonColor: "#9b59b6",
            cancelButtonColor: "#d33",
            denyButtonColor: "#f39c12",
            confirmButtonText: "Verificar",
            cancelButtonText: "Cancelar",
            denyButtonText: "Reenviar código",
            background: "#6c757d",
            color: "#ffffff",
            preConfirm: (code) => {
              if (!code || code.trim().length !== 6) {
                Swal.showValidationMessage("El código debe tener 6 dígitos.");
              }
              return code;
            },
          });

          const { value: token, isConfirmed, isDenied, isDismissed } = result;

          if (isDismissed) {
            Swal.fire({
              icon: "info",
              title: "Operación cancelada",
              background: "#6c757d",
              color: "#ffffff",
            });
            setLoadingSecurity(false);
            verified = true;
            break;
          } else if (isDenied) {
            await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/User/requestEmailChange", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nombreUsuario: user.nombreUsuario,
                correo: data.newCorreo,
              }),
            });
            Swal.fire({
              icon: "success",
              title: "Código reenviado",
              background: "#6c757d",
              color: "#ffffff",
            });
          } else if (isConfirmed && token) {
            const res4 = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/User/verifyEmailChange", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                idUsuario: user.idUsuario,
                correo: data.newCorreo,
                token,
              }),
            });
            if (res4.ok) {
              Swal.fire({
                icon: "success",
                title: "Correo cambiado correctamente",
                background: "#6c757d",
                color: "#ffffff",
              });
              setValue("newCorreo", "");
              setLoadingSecurity(false);
              verified = true;
              const userData = await res4.json();
              reset();
              setImg("");
              setUser({
                idUsuario: userData.idUsuario,
                nombre: userData.nombre,
                apellidoPaterno: userData.apellidoPaterno,
                apellidoMaterno: userData.apellidoMaterno,
                nombreUsuario: userData.nombreUsuario,
                correo: userData.correo,
                administrador: userData.administrador,
                organizador: userData.organizador,
                evaluador: userData.evaluador,
                conferencista: userData.conferencista,
                ponente: userData.ponente,
                registrador: userData.registrador,
                telefono: userData.telefono,
                fotoUsuarioUrl: userData.fotoUsuarioUrl,
              });
              break;
            } else {
              let errorMsg = "Código incorrecto o expirado";
              try {
                const errorText = await res4.text();
                if (errorText) errorMsg = errorText;
              } catch (e) {}
              await Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMsg,
                background: "#6c757d",
                color: "#ffffff",
              });
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
          }
        }
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        background: "#6c757d",
        color: "#ffffff",
      });
      setLoadingSecurity(false);
    }
  };

  return (
    <>
      <div className="w-100 d-flex justify-content-center h-100">
        <div
          className="custom-scrollbar text-start w-100 px-2 px-md-3 py-md-2"
          style={{
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <div className="row px-sm-5 pt-2 d-flex align-items-center justify-content-center justify-content-md-start">
            <h3
              className="custom-font-titleArticle-gold d-flex align-items-center justify-content-md-start justify-content-center mb-3 text-center p-0"
              style={{ width: "max-content" }}
            >
              Mi perfil
            </h3>
          </div>
          <div className="mb-4 mx-2 mb-md-5 p-3 bg-dark bg-dark2 rounded">
            <div className="row d-flex flex-column align-items-center justify-content-center">
              <div className="row d-flex flex-row align-items-center justify-content-center mt-2 px-0 px-sm-4 px-md-0 row2">
                <div className="col-md-3 d-flex align-items-center justify-content-center h-100 mb-4 mb-md-0 ms-md-3">
                  <img
                    src={
                      user.fotoUsuarioUrl
                        ? `https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net${user.fotoUsuarioUrl}`
                        : "https://cdn-icons-png.flaticon.com/512/1077/1077063.png"
                    }
                    alt="Usuario"
                    className="custom-profile-img img-fluid"
                  />
                </div>
                <div className="col-md-8 h-100">
                  <h3 className="custom-font-subtitleArticle2-gold d-flex justify-content-center align-items-center text-center text-md-start">
                    {user.nombre
                      ? user.nombre +
                        " " +
                        user.apellidoPaterno +
                        " " +
                        user.apellidoMaterno
                      : "Nombre Completo"}
                  </h3>
                  <p className="custom-font-normalArticle ms-md-4 mb-1 text-center text-md-start">
                    ID: {user.idUsuario ? user.idUsuario : "0"}
                  </p>
                  <p className="custom-font-normalArticle ms-md-4 mb-1 text-center text-md-start">
                    Usuario:{" "}
                    {user.nombreUsuario
                      ? user.nombreUsuario
                      : "Nombre de usuario"}
                  </p>
                  <p className="custom-font-normalArticle ms-md-4 mb-1 text-center text-md-start">
                    Correo: {user.correo ? user.correo : "ej@ej.com"}
                  </p>
                  <p className="custom-font-normalArticle ms-md-4 mb-1 text-center text-md-start">
                    Teléfono: {user.telefono ? user.telefono : "Sin teléfono"}
                  </p>
                </div>
                {/*
                <div className="col-3">
                  <div className="row align-items-end">
                    <button
                      className="custom-btn-gold mb-4"
                      onClick={handleDownloadGafete}
                    >
                      Descargar Gafete
                    </button>
                  </div>
                  <div className="row d-flex justify-content-center align-items-center">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="QR de usuario"
                        className="custom-QR-img me-2 img-fluid2"
                      />
                    ) : (
                      <span className="text-light">QR no disponible</span>
                    )}
                  </div>
                </div>
                 */}
              </div>
            </div>
          </div>
          <div className="mb-4 mx-2 mb-md-5 p-3 bg-dark bg-dark2 rounded">
            <div className="row d-flex flex-row">
              <div className="d-flex d-flex align-items-center justify-content-center justify-content-md-start">
                <h3 className="custom-font-subtitleArticle2-gold d-flex justify-content-center align-items-center text-center">
                  Modificar perfil
                </h3>
              </div>
              <form onSubmit={handleSubmit(handleGeneralSubmit)}>
                <div className="row d-flex flex-row align-items-center justify-content-center mt-2 px-4 px-md-0 row2">
                  <div className="col-md-3 d-flex align-items-center justify-content-center h-100 mb-4 mb-md-0">
                    {img ? (
                      <img
                        src={img}
                        alt="Vista previa"
                        className="custom-profile-img img-fluid"
                        style={{
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          document.getElementById("fotoUsuario").click()
                        }
                      />
                    ) : (
                      <button
                        type="button"
                        className="custom-btn-gold2 py-3 px-3 fw-bold w-100 d-flex justify-content-center align-items-center"
                        onClick={() =>
                          document.getElementById("fotoUsuario").click()
                        }
                      >
                        Subir foto
                      </button>
                    )}
                    <input
                      type="file"
                      autoComplete="off"
                      id="fotoUsuario"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                    <input
                      type="hidden"
                      autoComplete="off"
                      {...register("fotoUsuarioBase64")}
                      value={img || ""}
                    />
                  </div>
                  <div className="col-md-9 h-100">
                    <div className="row mb-md-4">
                      <div className="col-md-6">
                        <InputField
                          label="Nombre"
                          name="nombre"
                          register={register}
                          errors={errors}
                          validationRules={{
                            maxLength: {
                              value: 50,
                              message: "*La longitud máxima es de 50.",
                            },
                          }}
                        />
                      </div>
                      <div className="col-md-6">
                        <InputField
                          label="Apellido Paterno"
                          name="apellidoPaterno"
                          register={register}
                          errors={errors}
                          validationRules={{
                            maxLength: {
                              value: 50,
                              message: "*La longitud máxima es de 50.",
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div className="row mb-md-4">
                      <InputField
                        label="Apellido Materno"
                        name="apellidoMaterno"
                        register={register}
                        errors={errors}
                        validationRules={{
                          maxLength: {
                            value: 50,
                            message: "*La longitud máxima es de 50.",
                          },
                        }}
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <InputField
                          label="Nombre de usuario"
                          name="nombreUsuario"
                          register={register}
                          errors={errors}
                          validationRules={{
                            maxLength: {
                              value: 50,
                              message: "*La longitud máxima es de 50.",
                            },
                            minLength: {
                              value: 5,
                              message: "*La longitud mínima es de 5.",
                            },
                          }}
                        />
                      </div>
                      <div className="col-md-6">
                        <InputField
                          label="Teléfono"
                          type="tel"
                          name="telefono"
                          register={register}
                          errors={errors}
                          validationRules={{
                            validate: (value) =>
                              value === "" || phoneValidation(value),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-center px-4 px-md-0 mt-md-4">
                  <button
                    className="custom-btn-gold"
                    style={{ width: "100%", height: "50px" }}
                    type="submit"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="mx-0 mx-md-4 mb-4 mb-md-5 p-3 bg-dark bg-dark2 rounded">
            <div className="row d-flex flex-row">
              <div className="d-flex d-flex align-items-center justify-content-center justify-content-md-start">
                <h3 className="custom-font-subtitleArticle2-gold d-flex justify-content-center align-items-center text-center">
                  Modificar Correo y/o Contraseña
                </h3>
              </div>
              <form onSubmit={handleSubmit(handleSecuritySubmit)}>
                <div className="row d-flex flex-row align-items-center justify-content-center mt-2">
                  <div className="row d-flex justify-content-center align-items-center mb-md-4">
                    <div className="row col-md-6 d-flex justify-content-center">
                      <InputField
                        label="Correo nuevo"
                        name="newCorreo"
                        register={register}
                        errors={errors}
                        validationRules={{
                          validate: (value) =>
                            value === "" || emailValidation(value),
                        }}
                      />
                    </div>
                  </div>
                  <div className="row px-4 px-md-0">
                    <div className="col-md-6">
                      <InputField
                        label="Nueva contraseña"
                        name="newPassword"
                        type="password"
                        register={register}
                        errors={errors}
                        validationRules={{
                          minLength: {
                            value: 8,
                            message: "*Mínimo 8 caracteres.",
                          },
                          maxLength: {
                            value: 16,
                            message: "*Máximo 16 caracteres.",
                          },
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <InputField
                        label="Confirmar nueva contraseña"
                        name="confirmNewPassword"
                        type="password"
                        register={register}
                        errors={errors}
                        validationRules={{
                          validate: (value) =>
                            !watch("newPassword") ||
                            value === watch("newPassword") ||
                            "*Las contraseñas no coinciden.",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-center px-4 px-md-0 mt-md-4">
                  <button
                    className="custom-btn-gold"
                    style={{ width: "100%", height: "50px" }}
                    type="submit"
                    disabled={loadingSecurity}
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="mx-0 mx-md-4 p-3 bg-dark bg-dark2 rounded">
            <div className="row d-flex flex-row">
              <div className="d-flex d-flex align-items-center justify-content-center justify-content-md-start">
                <h3 className="custom-font-subtitleArticle2-gold d-flex justify-content-center align-items-center text-center">
                  Eliminar cuenta
                </h3>
              </div>
              <div>
                <div className="d-flex justify-content-center px-4 px-md-0 mt-md-4">
                  <button
                    className="custom-btn-gold"
                    style={{ width: "100%", height: "50px" }}
                    onClick={handleDelete}
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
