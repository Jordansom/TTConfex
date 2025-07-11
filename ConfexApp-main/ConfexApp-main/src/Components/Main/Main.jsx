import React, { useContext, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { DataContext } from "../../Context/DataContext.jsx";
import Sidebar from "./SideBar.jsx";
import fondo from "../../assets/FondoMain.jpg";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

const Main = () => {
  const { pathname } = useLocation();
  const [dropDawn, setDropDawn] = useState(false);
  const openDropDawn = () => {
    setDropDawn(!dropDawn);
  };
  const { user } = useContext(DataContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const childsToRender = () => {
    if (pathname === "Main") {
      return;
      <></>;
    } else {
      return <Outlet context={{ isSidebarOpen }} />;
    }
  };

  return (
    <>
      <div className="position-fixed h-100 w-100">
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{
            backgroundImage: `url(${fondo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        <div
          className="position-fixed w-100 h-100"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        ></div>
        <div className="position-relative d-flex flex-column h-100 w-100">
          <header className="d-flex align-items-center justify-content-md-between justify-content-center custom-border-bottom w-100">
            <div className="col-6 ms-3 custom-font-title-gold">Confex</div>
            <div className="col-6 col-md-2 d-flex align-items-center justify-content-md-around justify-content-center">
              <ul className="nav">
                <li>
                  <div className="position-relative">
                    <Dropdown
                      isOpen={dropDawn}
                      toggle={openDropDawn}
                      direction="down"
                    >
                      <DropdownToggle
                        className="custom-dropdown-toggle dropdown-toggle show"
                        style={{
                          backgroundColor: "transparent",
                          border: "0",
                        }}
                      >
                        <img
                          src={
                            user.fotoUsuarioUrl
                              ? `${process.env.REACT_APP_API_URL}${user.fotoUsuarioUrl}`
                              : "http://cdn-icons-png.flaticon.com/512/1077/1077063.png"
                          }
                          alt="mdo"
                          width="40"
                          height="40"
                          className="rounded-circle custom-profile-img me-2"
                        />
                      </DropdownToggle>
                      <DropdownMenu
                        className="dropdown-menu-end shadow custom-dropdown-menu"
                        end
                      >
                        <DropdownItem header>
                          <small>Mi perfil</small>
                        </DropdownItem>
                        <DropdownItem>
                          <Link
                            to={"Mi-perfil"}
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                            }}
                          >
                            <small className="ms-3">Configuración</small>
                          </Link>
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </li>
              </ul>
            </div>
          </header>
          <div className="d-flex flex-grow-1 w-100 h-100">
            <button
              className={`sidebar-toggle ${isSidebarOpen ? "open" : ""}`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? "✖" : "☰"}
            </button>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="flex-grow-1 d-flex justify-content-center align-items-start w-100 h-100 p-3">
              {childsToRender()}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;
