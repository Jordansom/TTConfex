import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import fondo from "../assets/FondoHome.jpg";

const Home = () => {
  const { pathname } = useLocation();

  const childsToRender = () => {
    if (pathname === "/") {
      return (
        <>
          <div className="w-100 h-100 d-flex justify-content-center align-items-center">
            <div
              className="custom-scrollbar text-start container-custom2"
              style={{
                maxHeight: "60vh",
                overflowY: "auto",
                paddingRight: "2rem",
                paddingBottom: "1rem",
                paddingTop: "1rem",
                paddingLeft: "2rem",
              }}
            >
              <div className="d-flex justify-content-center mb-3 mb-md-5 w-100">
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3 w-100">
                  <div className="d-flex justify-content-center mb-3 mb-md-0 w-100">
                    <Link to={"Crear-cuenta"}>
                      <button
                        className="btn btn-outline-light custom-btn fw-bold"
                        style={{ padding: "10px 25px" }}
                      >
                        Crear Cuenta
                      </button>
                    </Link>
                  </div>
                  <div className="d-flex justify-content-center mb-3 mb-md-0 w-100">
                    <Link to={"Iniciar-sesion"}>
                      <button className="btn btn-outline-light custom-btn fw-bold">
                        Iniciar Sesión
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-2 mt-md-4 w-100">
                <h2 className="custom-font-subtitle fw-bold mb-3 mb-md-4 text-center text-start-md">
                  Descubre una <br /> nueva experiencia
                </h2>
                <p className="custom-font-normal mb-2 mb-md-3 text-center text-start-md">
                  Un espacio para encontrar conferencias y congresos de tus
                  temas favoritos.
                </p>
                <p className="custom-font-normal mb-2 text-center text-start-md">
                  Un espacio para crear y organizar tus conferencias y
                  congresos.
                </p>
              </div>
            </div>
          </div>
        </>
      );
    } else {
      return <Outlet />;
    }
  };

  return (
    <>
      <div className="position-fixed h-100 w-100 text-white">
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{
            backgroundImage: `url(${fondo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(4px)",
          }}
        />
        <div
          className="position-fixed w-100 h-100"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
        />
        <div className="position-relative d-flex flex-column h-100 w-100">
          <header className="pt-4 px-3 d-flex flex-column align-items-center">
            <div className="d-flex justify-content-around align-items-center w-100">
              <Link to={"/"} className="nav-link">
                <span className="custom-font-subtitle">Confex</span>
              </Link>
              <span className="custom-font-subtitle">Bienvenido a</span>
              <Link to={"Acerca-de"} className="nav-link">
                <span className="custom-font-subtitle">Acerca</span>
              </Link>
            </div>
            <h1 className="mt-3 custom-font-title text-center">Confex</h1>
          </header>
          <main className="flex-grow-1 d-flex justify-content-center align-items-start h-100 p-3">
            {childsToRender()}
          </main>
          <footer className="footer w-100">
            <div className="text-white-50 small pb-3 d-flex justify-content-end align-items-end gap-4 text-center">
              <Link to={"Terminos-y-condiciones"} className="nav-link">
                <span className="custom-font-small">
                  Términos y condiciones
                </span>
              </Link>
              <Link to={"Ayuda"} className="nav-link">
                <span className="custom-font-small">Ayuda</span>
              </Link>
              <span className="custom-font-small me-4">© 2025 Confex.com</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Home;
