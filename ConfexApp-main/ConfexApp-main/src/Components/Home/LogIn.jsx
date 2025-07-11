import React, { useContext, useState, useCallback } from "react";
import { DataContext } from "../../Context/DataContext.jsx";
import { useForm } from "react-hook-form";
import PasswordInput from "./Components/PasswordInput.jsx";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const InputField = ({
  label,
  name,
  type = "text",
  register,
  errors,
  validationRules,
  onChange,
}) => (
  <>
    <div className="form-floating d-flex justify-content-center align-items-center">
      <input
        type={type}
        {...register(name, validationRules)}
        className="form-control custom-input text-center fw-bold w-100 w-md-50"
        placeholder={label}
        autoComplete="off"
        onChange={onChange}
      />
    </div>
    {errors[name] && (
      <small className="custom-font-Extrasmall">{errors[name].message}</small>
    )}
  </>
);

const LogIn = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userIdentifier, setUserIdentifier] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(DataContext);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    shouldUnregister: false,
  });
  const password = watch("password");

  const handleResendCode = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/LogIn/RequestReset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: userIdentifier }),
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
  }, [setLoading, userIdentifier, setValue]);

  const onLogin = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/LogIn/buscar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Error desconocido en el servidor");
        }
        const userData = await response.json();
        setUser(userData);
        Swal.fire({
          icon: "success",
          title: "¡Acceso correcto!",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        }).then(() => {
          reset();
          navigate("/Main");
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Ocurrió un error...",
          text: err.message || "Hubo un problema al iniciar sesión.",
          confirmButtonText: "Reintentar",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        });
      } finally {
        setLoading(false);
      }
    },
    [setLoading, navigate, setUser]
  );

  const onRecovery = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/LogIn/RequestReset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Error al solicitar recuperación");
        }
        setUserIdentifier(data.identifier);
        setStep(3);
        Swal.fire({
          icon: "success",
          title: "Código enviado",
          text: "Se ha enviado un código de verificación a tu correo.",
          confirmButtonText: "Continuar",
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
    },
    [setLoading, setUserIdentifier, setStep]
  );

  const onVerify = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/LogIn/verifyToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: userIdentifier,
            token: data.token,
          }),
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Código incorrecto");
        }
        setToken(data.token);
        setStep(4);
        Swal.fire({
          icon: "success",
          title: "Código verificado",
          text: "Ahora puedes restablecer tu contraseña.",
          confirmButtonText: "Continuar",
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
    },
    [setLoading, userIdentifier, setToken, setStep]
  );

  const onReset = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const response = await fetch("https://confex-e8ccgscmh9ejeucj.eastus2-01.azurewebsites.net/LogIn/resetPassword", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: userIdentifier,
            password: data.password,
          }),
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(
            errorMessage || "No se pudo restablecer la contraseña"
          );
        }
        Swal.fire({
          icon: "success",
          title: "Contraseña restablecida",
          text: "Ahora puedes iniciar sesión con tu nueva contraseña.",
          confirmButtonText: "Ir a LogIn",
          confirmButtonColor: "#9b59b6",
          background: "#6c757d",
          color: "#ffffff",
        }).then(() => {
          setStep(1);
          reset();
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
    },
    [setLoading, userIdentifier, reset, setStep]
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
              <div className="row d-flex flex-column flex-md-row align-items-center justify-content-center">
                {step === 1 && (
                  <form onSubmit={handleSubmit(onLogin)}>
                    <div className="row d-flex justify-content-center align-items-center">
                      <div className="w-100 w-md-50 mb-3 mb-md-5 custom-input-md">
                        <InputField
                          label="Nombre de usuario o Correo"
                          name="identifier"
                          register={register}
                          errors={errors}
                          validationRules={{
                            required: {
                              value: true,
                              message:
                                "*El nombre de usuario o correo es obligatorio.",
                            },
                          }}
                        />
                      </div>
                      <div className="w-100 w-md-50 mb-3 mb-md-5 custom-input-md">
                        <PasswordInput
                          placeholder="Contraseña"
                          className1="form-floating d-flex justify-content-center align-items-center position-relative"
                          className2="form-control custom-input text-center fw-bold w-100 w-md-50"
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
                      <div className="d-flex justify-content-center align-items-center custom-input-md">
                        <button
                          className="mb-3 mb-md-4 btn btn-outline-light custom-btn3 fw-bold justify-content-center"
                          type="submit"
                          disabled={loading}
                        >
                          Iniciar sesión
                        </button>
                      </div>
                      <div className="text-center">
                        <button
                          type="button"
                          className="btn btn-link text-light custom-font-small"
                          onClick={() => {
                            setStep(2);
                          }}
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmit(onRecovery)}>
                    <div className="row d-flex justify-content-center align-items-center">
                      <div className="w-100 w-md-50 mb-3 mb-md-5 custom-input-md">
                        <InputField
                          label="Nombre de usuario o Correo"
                          name="identifier"
                          register={register}
                          errors={errors}
                          validationRules={{
                            required: {
                              value: true,
                              message:
                                "*El nombre de usuario o correo es obligatorio.",
                            },
                          }}
                        />
                      </div>
                      <div className="row d-flex flex-column flex-md-row custom-input-md">
                        <div className="col d-flex align-items-center justify-content-center">
                          <button
                            type="button"
                            className="mb-3 mb-md-4 btn btn-outline-light custom-btn3 fw-bold justify-content-center"
                            onClick={() => setStep(1)}
                          >
                            Volver
                          </button>
                        </div>
                        <div className="col d-flex align-items-center justify-content-center">
                          <button
                            className="mb-3 mb-md-4 btn btn-outline-light custom-btn3 fw-bold justify-content-center"
                            type="submit"
                            disabled={loading}
                          >
                            Enviar código
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <form onSubmit={handleSubmit(onVerify)}>
                    <div className="row d-flex justify-content-center align-items-center">
                      <div className="w-100 w-md-50 mb-3 mb-md-5 custom-input-md">
                        <InputField
                          label="Código de verificación"
                          name="token"
                          register={register}
                          errors={errors}
                          validationRules={{
                            required: {
                              value: true,
                              message: "*El código es obligatorio.",
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
                      <div className="row d-flex flex-column flex-md-row custom-input-md">
                        <div className="col d-flex align-items-center justify-content-center">
                          <button
                            type="button"
                            className="mb-3 mb-md-4 btn btn-outline-light custom-btn3 fw-bold justify-content-center"
                            onClick={() => setStep(2)}
                          >
                            Volver
                          </button>
                        </div>
                        <div className="col d-flex align-items-center justify-content-center">
                          <button
                            className="mb-3 mb-md-4 btn btn-outline-light custom-btn3 fw-bold justify-content-center"
                            type="submit"
                            disabled={loading}
                          >
                            Verificar código
                          </button>
                        </div>
                      </div>
                      <div className="text-center mt-3 me-2">
                        <button
                          type="button"
                          className="btn btn-link text-light custom-font-small"
                          onClick={handleResendCode}
                          disabled={loading}
                        >
                          Reenviar código
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {step === 4 && (
                  <form onSubmit={handleSubmit(onReset)}>
                    <div className="row d-flex justify-content-center align-items-center">
                      <div className="w-100 w-md-50 mb-3 mb-md-5 custom-input-md">
                        <PasswordInput
                          placeholder="Nueva contraseña"
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
                      <div className="w-100 w-md-50 mb-3 mb-md-5 custom-input-md">
                        <PasswordInput
                          placeholder="Confirmar contraseña"
                          {...register("confirmPassword", {
                            required: {
                              value: true,
                              message: "*Tiene que confirmar la contraseña.",
                            },
                            minLength: {
                              value: 8,
                              message: "*La longitud mínima es de 8.",
                            },
                            maxLength: {
                              value: 16,
                              message: "*La longitud máxima es de 16.",
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
                      <div className="row d-flex flex-column flex-md-row custom-input-md">
                        <div className="col d-flex align-items-center justify-content-center">
                          <button
                            type="button"
                            className="mb-3 mb-md-4 btn btn-outline-light custom-btn3 fw-bold justify-content-center"
                            onClick={() => setStep(3)}
                          >
                            Volver
                          </button>
                        </div>
                        <div className="col d-flex align-items-center justify-content-center">
                          <button
                            className="mb-3 mb-md-4 btn btn-outline-light custom-btn3 fw-bold justify-content-center"
                            type="submit"
                            disabled={loading}
                          >
                            Restablecer contraseña
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogIn;
