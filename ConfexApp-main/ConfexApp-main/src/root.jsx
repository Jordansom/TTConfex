import React from "react";
import { createRoot } from "react-dom/client";
import "react-datepicker/dist/react-datepicker.css";
import "../scss/styles.scss";
import { DataContextProvider } from "./Context/DataContext.jsx";
import App from "./App.jsx";
import { createBrowserRouter } from "react-router-dom";
import Home from "./Components/Home.jsx";
import ErrorPage from "./Components/ErrorPage.jsx";
import SignUp from "./Components/Home/SignUp.jsx";
import LogIn from "./Components/Home/LogIn.jsx";
import Conditions from "./Components/Home/Conditions.jsx";
import Help from "./Components/Home/Help.jsx";
import About from "./Components/Home/About.jsx";
import Main from "./Components/Main/Main.jsx";
import Profile from "./Components/Main/Mi perfil/Profile.jsx";
import MisCongresos from "./Components/Main/Organizador/MisCongresos.jsx";
import CrearCongreso from "./Components/Main/Organizador/CrearCongreso.jsx";
import AdminOrganizadores from "./Components/Main/Administrador/AdminOrganizadores.jsx";
import AdminTematicas from "./Components/Main/Administrador/AdminTematicas.jsx"
import SubirPonencias from "./Components/Main/Ponente/SubirPonencias.jsx";
import ListaCongresos from "./Components/Main/ListaCongresos.jsx";
import CongresoTabs from "./Components/Main/CongresoTabs.jsx";
import CongresosAsistente from "./Components/Main/CongresosAsistente.jsx";
import CongresosEvaluador from "./Components/Main/Evaluador/CongresosEvaluador.jsx";
import EvaluarPonencias from "./Components/Main/Evaluador/EvaluarPonencias.jsx";
import MisConferencias from "./Components/Main/Conferencista/MisConferencias.jsx";
import MisRegistros from "./Components/Main/Registrador/MisRegistros.jsx";
import RegistroCongreso from "./Components/Main/Registrador/RegistroCongreso.jsx";
import ReportesAsistencia from "./Components/Main/Registrador/ReportesAsistencia.jsx";
import HorariosLista from "./Components/Main/Organizador/HorariosLista.jsx";
import HorariosCongreso from "./Components/Main/Organizador/HorariosCongreso.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "Crear-cuenta",
        element: <SignUp />,
        errorElement: <ErrorPage />,
      },
      {
        path: "Iniciar-sesion",
        element: <LogIn />,
        errorElement: <ErrorPage />,
      },
      {
        path: "Terminos-y-condiciones",
        element: <Conditions />,
        errorElement: <ErrorPage />,
      },
      { path: "Ayuda", element: <Help />, errorElement: <ErrorPage /> },
      { path: "Acerca-de", element: <About />, errorElement: <ErrorPage /> },
    ],
  },
  {
    path: "/Main",
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      { path: "Mi-perfil", element: <Profile />, errorElement: <ErrorPage /> },
      { path: "Mis-congresos", element: <MisCongresos />, errorElement: <ErrorPage /> },
      { path: "Crear-congreso", element: <CrearCongreso />, errorElement: <ErrorPage /> },
      { path: "Administrar-Organizadores", element: <AdminOrganizadores />, errorElement: <ErrorPage /> },
      { path: "Administrar-Tematicas", element: <AdminTematicas />, errorElement: <ErrorPage /> },
      { path: "Subir-ponencias", element: <SubirPonencias />, errorElement: <ErrorPage /> },
      { path: "Congresos", element: <ListaCongresos />, errorElement: <ErrorPage /> },
      { path: "Congreso/:idCongreso", element: <CongresoTabs />, errorElement: <ErrorPage /> },
      { path: "Congresos-asistente", element: <CongresosAsistente />, errorElement: <ErrorPage /> },
      { path: "Congresos-evaluador", element: <CongresosEvaluador />, errorElement: <ErrorPage /> },
      { path: "Evaluar-ponencias/:idCongreso", element: <EvaluarPonencias />, errorElement: <ErrorPage /> },
      { path: "Mis-conferencias", element: <MisConferencias />, errorElement: <ErrorPage /> },
      { path: "Mis-registros",
              element: <MisRegistros/>,
              errorElement: <ErrorPage />,
            },
            { path: "Registro-congreso/:idCongreso",
              element: <RegistroCongreso />,
              errorElement: <ErrorPage />,
            },
            {
              path: "Reportes/:idCongreso",
              element: <ReportesAsistencia />,
              errorElement: <ErrorPage />
            },
            { 
              path: "Horarios", 
              element: <HorariosLista />, 
              errorElement: <ErrorPage /> 
            },
            { 
              path: "Horarios/:idCongreso", 
              element: <HorariosCongreso />, 
              errorElement: <ErrorPage /> 
            },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DataContextProvider>
      <App router={router} future={{ v7_startTransition: true }} />
    </DataContextProvider>
  </React.StrictMode>
);
