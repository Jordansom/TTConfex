import React from "react";

const About = () => {
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
          <h2 className="custom-font-subtitle fw-bold">¿Qué es Confex?</h2>
          <p className="custom-font-normal mt-3 mb-2">
            Confex es una plataforma web desarrollada en el Instituto
            Politécnico Nacional (IPN) para facilitar la organización de
            congresos y conferencias académicas. Este sistema automatiza tareas
            como el registro de participantes, la evaluación de ponencias, la
            generación de constancias y gafetes, y el control de asistencia con
            tecnología QR. Al centralizar estos procesos, Confex mejora la
            eficiencia, la experiencia de los usuarios y la calidad general de
            los eventos académicos.
          </p>
          <h2 className="custom-font-subtitle fw-bold mt-5">Misión</h2>
          <p className="custom-font-normal mt-3 mb-2">
            Ofrecer una solución tecnológica integral que permita a
            organizadores y participantes gestionar de forma sencilla y efectiva
            todas las etapas de un congreso, desde la convocatoria hasta la
            entrega de constancias, fortaleciendo así la difusión del
            conocimiento y el desarrollo académico.
          </p>
          <h2 className="custom-font-subtitle fw-bold mt-5">Visión</h2>
          <p className="custom-font-normal mt-3 mb-2">
            Convertirse en la herramienta de gestión de congresos académicos
            líder dentro del IPN y en otras instituciones educativas,
            promoviendo eventos científicos de alta calidad mediante tecnología
            accesible, segura y eficiente.
          </p>
          <h2 className="custom-font-subtitle fw-bold mt-5">
            ¿Cómo solicitar ser organizador?
          </h2>
          <p className="custom-font-normal mt-3 mb-2">
            Para solicitar ser organizador de un congreso, los usuarios deben
            registrarse en la plataforma y enviar una solicitud a través del
            sistema. El equipo de desarrollo revisará la solicitud y, si es
            aprobada, se asignará el rol de organizador al usuario. Una vez
            aprobado, el usuario podrá crear y gestionar congresos dentro de la
            plataforma.
          </p>
          <h2 className="custom-font-subtitle fw-bold mt-5">
            Para más información sobre el funcionamiento del sistema descargue
            el manual de usuario
          </h2>
          <p className="custom-font-normal mt-3 mb-2">Link</p>
        </div>
      </div>
    </>
  );
};

export default About;
