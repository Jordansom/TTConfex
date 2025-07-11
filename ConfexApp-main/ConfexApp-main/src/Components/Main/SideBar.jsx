import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiBlackBook } from "react-icons/gi";
import { GoChecklist } from "react-icons/go";
import { TbPodium } from "react-icons/tb";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { LiaTrophySolid } from "react-icons/lia";
import { FaUserCheck } from "react-icons/fa6";
import { CiUser, CiLogout } from "react-icons/ci";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { DataContext } from "../../Context/DataContext.jsx";
import { FaClock } from "react-icons/fa";
const RoleSection = ({ title, links, setIsOpen, isOpen }) => (
  <>
    <h2
      className="custom-font-subtitle-gold"
      style={{
        marginTop: "7.5vh",
        marginBottom: "3vh",
      }}
    >
      {title}
    </h2>
    <div>
      {links.map(({ icon: Icon, label, to }, index) => (
        <Link
          key={index}
          className="Link-bar"
          to={to || "#"}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Icon className="icon" />
          &nbsp;{label}
        </Link>
      ))}
    </div>
  </>
);

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(DataContext);

  const logOut = () => {
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
  };

  const hasRoles =
    user.organizador ||
    user.evaluador ||
    user.conferencista ||
    user.ponente ||
    user.registrador;

  const generalSections = [
    {
      title: "Mi tablero",
      links: hasRoles
        ? [
            { icon: LiaTrophySolid, label: "Mis Constancias" },
            { icon: FaUserCheck, label: "Congresos a los que quiero asistir", to: "/Main/Congresos-asistente" },
            { icon: HiOutlineDocumentText, label: "Mis Ponencias", to: "/Main/Subir-ponencias" },
            { icon: GiBlackBook, label: "Congresos", to: "/Main/Congresos" },
          ]
        : [
            { icon: FaUserCheck, label: "Congresos a los que quiero asistir", to: "/Main/Congresos-asistente" },
            { icon: HiOutlineDocumentText, label: "Mis Ponencias", to: "/Main/Subir-ponencias" },
            { icon: GiBlackBook, label: "Congresos", to: "/Main/Congresos" },
          ],
    },
  ];

  const rolesConfig = {
    administrador: {
      title: "Administrador",
      links: [
        {
          icon: CiUser,
          label: "Administrar organizadores",
          to: "/Main/Administrar-Organizadores",
        },
        {
          icon: CiUser,
          label: "Administrar Temáticas",
          to: "/Main/Administrar-Tematicas",
        },
      ],
    },
    organizador: {
      title: "Organizador",
      links: [
        {
          icon: GiBlackBook,
          label: "Mis Congresos",
          to: "/Main/Mis-congresos",
        },
        {
          icon: FaClock, // Importar FaClock de react-icons/fa
          label: "Horarios",
          to: "/Main/Horarios",
        },
      ],
    },
    evaluador: {
      title: "Evaluador",
      links: [
        {
          icon: GoChecklist,
          label: "Evaluación de Ponencias",
          to: "/Main/Congresos-evaluador",
        },
      ],
    },
    conferencista: {
      title: "Conferencista",
      links: [{ icon: TbPodium, label: "Mis Conferencias", to: "/Main/Mis-conferencias" }],
    },
    ponente: {
      title: "Ponente",
      links: [{ icon: HiOutlineDocumentText, label: "Mis Ponencias" }],
    },
    registrador: {
          title: "Registrador",
          links: [
            { 
              icon: MdOutlineQrCodeScanner, 
              label: "Registro de asistencia",
              to: "/Main/Mis-registros"
            },
          ],
        },
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? "active" : ""}`}>
        <div
          className="main-content custom-scrollbar"
          style={{
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <Link
            className="Link-subtitle-gold"
            to={"/Main"}
            onClick={() => setIsOpen(!isOpen)}
          >
            <h2 className="custom-font-subtitle-gold">Congresos</h2>
          </Link>
          {generalSections.map((section, i) => (
            <RoleSection
              key={`general-${i}`}
              {...section}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />
          ))}
          {Object.entries(rolesConfig).map(([role, config]) =>
            user[role] ? (
              <RoleSection
                key={role}
                {...config}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            ) : null
          )}
          <h2
            className="custom-font-subtitle-gold"
            style={{
              marginTop: "7.5vh",
              marginBottom: "3vh",
            }}
          >
            Configuración
          </h2>
          <Link
            className="Link-bar"
            to={"/Main/Mi-perfil"}
            onClick={() => setIsOpen(!isOpen)}
          >
            <CiUser className="icon" />
            &nbsp;Mi perfil
          </Link>
          <Link
            className="Link-bar"
            to={"/"}
            onClick={() => {
              setIsOpen(!isOpen);
              logOut();
            }}
          >
            <CiLogout className="icon" />
            &nbsp;Cerrar Sesión
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
