import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from "react-icons/fa";

const Help = () => {
  return (
    <>
      <div className="w-100 h-100 d-flex justify-content-center align-items-center">
        <div
          className="custom-scrollbar text-start"
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
          <h2 className="custom-font-subtitle fw-bold">Ayuda</h2>
          <p className="custom-font-normal mt-3 mb-3">
            Si tiene dudas sobre el funcionamiento del sistema, si tiene algún
            problema técnico o si desea crear un congreso póngase en contacto
            con nosotros a través de los siguientes medios:
          </p>
          <p className="custom-font-normal mt-3 mb-3 fw-bold">
            Correo electrónico:
          </p>
          <p className="custom-font-normal mt-3 mb-3 ms-3 ms-md-5">
            Confex.Support@hotmail.com
          </p>
          <p className="custom-font-normal mt-3 mb-3 fw-bold">
            Redes sociales:
          </p>
          <p className="custom-font-normal mt-3 mb-3 ms-3 ms-md-5">
            <FaFacebook />{" "}
            Confex&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <FaTwitter />{" "}
            Confex&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <FaLinkedin /> Confex
          </p>
          <p className="custom-font-normal mt-3 mb-3 fw-bold">
            Teléfono de contacto:
          </p>
          <p className="custom-font-normal mt-3 mb-5 ms-3 ms-md-5">
            <FaWhatsapp /> 55 55 55 55 55
          </p>
        </div>
      </div>
    </>
  );
};

export default Help;
