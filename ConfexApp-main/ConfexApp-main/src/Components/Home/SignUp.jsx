import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import PasswordInput from "./Components/PasswordInput.jsx";
import Swal from "sweetalert2";

const InputField = ({
  label,
  name,
  type = "text",
  register,
  errors,
  validationRules,
}) => (
  <div className="form-floating">
    <input
      type={type}
      {...register(name, validationRules)}
      className="form-control custom-input text-center fw-bold"
      placeholder={label}
      autoComplete="off"
    />
    {errors[name] && (
      <small className="custom-font-Extrasmall">{errors[name].message}</small>
    )}
  </div>
);

const emailValidation = (value) => {
  if (!value || value.trim() === "") return true;
  return (
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value.trim()) ||
    "*Formato de correo inválido."
  );
};

const SignUp = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    shouldUnregister: false,
  });
  const password = watch("password");

  const [correoGuardado, setCorreoGuardado] = useState("");
  const [userGuardado, setUserGuardado] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleResendCode = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/SignUp/iniciarRegistro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreUsuario: userGuardado,
          correo: correoGuardado,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error al reenviar código");
      }

      setValue("token", "");
      Swal.fire({
        icon: "success",
        title: "Código reenviado",
        text: "Se ha enviado un nuevo código de verificación a tu correo.",
        confirmButtonText: "Ok",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#9b59b6",
        background: "#6c757d",
        color: "#ffffff",
      });
    } finally {
      setLoading(false);
    }
  }, [correoGuardado, userGuardado, setValue]);

  const onSubmit = useCallback(
    async (data) => {
      setLoading(true);
      if (step === 1) {
        try {
          const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/SignUp/iniciarRegistro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombreUsuario: data.nombreUsuario,
              correo: data.correo,
            }),
          });

          if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(
              errorMessage || "Error al enviar código de verificación"
            );
          }

          Swal.fire({
            icon: "success",
            title: "Código enviado",
            text: "Se ha enviado un código de verificación a tu correo electrónico. Tiene una validez de 5 minutos.",
            confirmButtonText: "Continuar",
            confirmButtonColor: "#9b59b6",
            background: "#6c757d",
            color: "#ffffff",
          });

          setCorreoGuardado(data.correo);
          setUserGuardado(data.nombreUsuario);
          setStep(2);
          setValue("token", "");
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err.message,
            confirmButtonText: "Reintentar",
            confirmButtonColor: "#9b59b6",
            background: "#6c757d",
            color: "#ffffff",
          });
        } finally {
          setLoading(false);
        }
      } else if (step === 2) {
        try {
          const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/SignUp/verificarRegistro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: data.correo,
              token: data.token,
            }),
          });

          if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(
              errorMessage || "Error al verificar código de verificación"
            );
          }

          try {
            const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/SignUp/altaUsuario", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              const errorMessage = await response.text();
              throw new Error(
                errorMessage || "Error desconocido en el servidor"
              );
            }
            Swal.fire({
              icon: "success",
              title: "¡Cuenta creada!",
              text: "Su registro ha sido completado.",
              confirmButtonText: "Aceptar",
              confirmButtonColor: "#9b59b6",
              background: "#6c757d",
              color: "#ffffff",
            }).then(() => {
              reset();
              navigate("/Iniciar-sesion");
            });
          } catch (err) {
            Swal.fire({
              icon: "error",
              title: "Ocurrio un error...",
              text: err.message || "Hubo un problema al crear la cuenta.",
              confirmButtonText: "Reintentar",
              confirmButtonColor: "#9b59b6",
              background: "#6c757d",
              color: "#ffffff",
            });
          } finally {
            setLoading(false);
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err.message,
            confirmButtonText: "Reintentar",
            confirmButtonColor: "#9b59b6",
            background: "#6c757d",
            color: "#ffffff",
          });
        } finally {
          setLoading(false);
        }
      }
    },
    [navigate, step, setValue, setCorreoGuardado, setUserGuardado]
  );

  return (
    <>
      <div className="w-100 h-100 d-flex justify-content-center align-items-center">
        <div
          className="custom-scrollbar"
          style={{
            width: "85%",
            maxHeight: "60vh",
            overflowY: "auto",
            paddingRight: "2rem",
            paddingBottom: "1rem",
            paddingTop: "1rem",
            paddingLeft: "2rem",
          }}
        >
          <div
            className="modal-dialog"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="modal-content">
              <div className="d-flex flex-column flex-md-row align-items-center justify-content-center">
                <form onSubmit={handleSubmit(onSubmit)}>
                  {step === 1 ? (
                    <>
                      <div className="d-flex flex-column flex-md-row align-items-center justify-content-center mb-3 mb-md-5">
                        <div className="me-md-3 mb-3 mb-md-0 w-100 w-md-50">
                          <InputField
                            label="Nombre"
                            name="nombre"
                            register={register}
                            errors={errors}
                            validationRules={{
                              required: {
                                value: true,
                                message: "*El nombre es obligatorio.",
                              },
                              maxLength: {
                                value: 50,
                                message: "*La longitud máxima es de 50.",
                              },
                            }}
                          />
                        </div>
                        <div className="w-100 w-md-50 mb-3 mb-md-0">
                          <InputField
                            label="Apellido Paterno"
                            name="apellidoPaterno"
                            register={register}
                            errors={errors}
                            validationRules={{
                              required: {
                                value: true,
                                message: "*El apellido paterno es obligatorio.",
                              },
                              maxLength: {
                                value: 50,
                                message: "*La longitud máxima es de 50.",
                              },
                            }}
                          />
                        </div>
                        <div className="ms-md-3 w-100 w-md-50">
                          <InputField
                            label="Apellido Materno"
                            name="apellidoMaterno"
                            register={register}
                            errors={errors}
                            validationRules={{
                              required: {
                                value: true,
                                message: "*El apellido materno es obligatorio.",
                              },
                              maxLength: {
                                value: 50,
                                message: "*La longitud máxima es de 50.",
                              },
                            }}
                          />
                        </div>
                      </div>
                      <div className="row d-flex flex-row align-items-center justify-content-center">
                        <div className="mb-3 mb-md-5 w-100">
                          <InputField
                            label="Nombre de usuario"
                            name="nombreUsuario"
                            register={register}
                            errors={errors}
                            validationRules={{
                              required: {
                                value: true,
                                message:
                                  "*El nombre de usuario es obligatorio.",
                              },
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
                        <div className="mb-3 mb-md-5 w-100">
                          <InputField
                            label="Correo electrónico (ej. usuario@dominio.com)"
                            name="correo"
                            register={register}
                            errors={errors}
                            validationRules={{
                              required: {
                                value: true,
                                message:
                                  "*El correo electrónico es obligatorio.",
                              },
                              validate: emailValidation,
                            }}
                          />
                        </div>
                      </div>
                      <div className="d-flex flex-column flex-md-row align-items-center justify-content-center mb-3 mb-md-5">
                        <div className="me-md-3 mb-3 mb-md-0 w-100 w-md-50">
                          <PasswordInput
                            placeholder="Contraseña"
                            {...register("password", {
                              required: {
                                value: true,
                                message: "*La contraseña es obligatoria.",
                              },
                              maxLength: {
                                value: 16,
                                message: "*La longitud máxima es de 16.",
                              },
                              minLength: {
                                value: 8,
                                message: "*La longitud mínima es de 8.",
                              },
                            })}
                          />
                          {errors.password && (
                            <small className="custom-font-Extrasmall">
                              {errors.password.message}
                            </small>
                          )}
                        </div>
                        <div className="mb-3 mb-md-0 w-100 w-md-50">
                          <PasswordInput
                            placeholder="Confirmar contraseña"
                            {...register("confirmPassword", {
                              required: {
                                value: true,
                                message: "*Tiene que confirmar la contraseña.",
                              },
                              maxLength: {
                                value: 16,
                                message: "*La longitud máxima es de 16.",
                              },
                              minLength: {
                                value: 8,
                                message: "*La longitud mínima es de 8.",
                              },
                              validate: (value) =>
                                value === password ||
                                "*Las contraseñas no coinciden.",
                            })}
                          />
                          {errors.confirmPassword && (
                            <small className="custom-font-Extrasmall">
                              {errors.confirmPassword.message}
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="row d-flex flex-row align-items-center justify-content-center px-3 px-md-0">
                        <button
                          className="btn btn-outline-light custom-btn2 fw-bold mb-3 mb-md-4"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? "Enviando..." : "Continuar"}
                        </button>
                        <small className="custom-font-small text-center">
                          Al hacer clic en crear cuenta, estás aceptando
                          nuestros{" "}
                          <Link to={"/Terminos-y-condiciones"}>
                            términos y condiciones.
                          </Link>
                        </small>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-4">
                        <h4 className="mb-3 mb-md-4 custom-font-subtitle fw-bold">
                          Verificación de correo electrónico
                        </h4>
                        <p className="custom-font-normal">
                          Hemos enviado un código de verificación a{" "}
                          <strong>{correoGuardado}</strong>
                        </p>
                      </div>

                      <div className="d-flex flex-column flex-md-row align-items-center justify-content-center">
                        <div className="w-100 w-md-50 mb-3 mb-md-5">
                          <InputField
                            label="Código de verificación"
                            name="token"
                            register={register}
                            errors={errors}
                            validationRules={{
                              required: {
                                value: true,
                                message:
                                  "*El código de verificación es obligatorio.",
                              },
                              minLength: {
                                value: 6,
                                message: "*El código debe tener 6 dígitos.",
                              },
                              maxLength: {
                                value: 6,
                                message: "*El código debe tener 6 dígitos.",
                              },
                            }}
                          />
                        </div>
                      </div>

                      <div className="row d-flex flex-column flex-md-row">
                        <div className="col d-flex align-items-center justify-content-center">
                          <button
                            className="mb-3 mb-md-4 btn btn-outline-light custom-btn2 fw-bold justify-content-center"
                            type="button"
                            onClick={() => {
                              setValue("nombreUsuario", userGuardado);
                              setStep(1);
                            }}
                            disabled={loading}
                          >
                            Volver
                          </button>
                        </div>
                        <div className="col d-flex align-items-center justify-content-center">
                          <button
                            className="mb-3 mb-md-4 btn btn-outline-light custom-btn2 fw-bold justify-content-center"
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? "Procesando..." : "Crear cuenta"}
                          </button>
                        </div>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          className="btn btn-link text-light custom-font-small"
                          onClick={handleResendCode}
                          disabled={loading}
                        >
                          Reenviar código
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
