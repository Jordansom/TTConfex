import React, { useState } from "react";
import { Controller } from "react-hook-form";
import Select from "react-select";

const UserInput = ({ control, name, errors, roles, setRolSeleccionado }) => {
  const [inputValue, setInputValue] = useState("");
  const userIdentifier = document.getElementById("UserIdentifier")?.value;

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = inputValue.trim();
      const rolValido = roles.find(
        (rol) => rol.label === trimmed || rol.value === trimmed
      );
      if (rolValido) {
        field.onChange(rolValido.value);
        setRolSeleccionado(rolValido.value);
        setInputValue("");
      }
    }
    if (e.key === "Backspace" && inputValue === "") {
      field.onChange(null);
      setRolSeleccionado("");
    }
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        className="form-control custom-input-gold text-center fw-bold"
        rules={{
          validate: (value) => {
            if (!userIdentifier?.trim()) return true;
            if (!value) return "Seleccione un rol.";
            return true;
          },
        }}
        render={({ field }) => {
          const selectedOption =
            roles.find((r) => r.value === field.value) || null;
          return (
            <>
              <Select
                {...field}
                options={roles}
                classNamePrefix="select"
                placeholder="Selecciona al staff del congreso."
                menuPortalTarget={document.body}
                value={selectedOption}
                onChange={(selectedOption) => {
                  field.onChange(selectedOption.value);
                  setRolSeleccionado(selectedOption.value);
                  setInputValue(selectedOption.label);
                }}
                onInputChange={(value) => setInputValue(value)}
                onKeyDown={(e) => handleKeyDown(e, field)}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: "rgba(255, 255, 255, 0.07)",
                    border: state.isFocused
                      ? "4px solid #B8860B"
                      : "2px solid #B8860B",
                    boxShadow: state.isFocused
                      ? "0 0 15px rgba(184, 134, 11, 0.5)"
                      : "none",
                    borderRadius: "30px",
                    color: "white",
                    padding: "10px 20px",
                    backdropFilter: "blur(5px)",
                    position: "relative",
                    fontFamily: "Jura, sans-serif",
                    fontSize: "clamp(15px, 3vw, 22px)",
                    textAlign: "center",
                    cursor: "pointer",
                    marginLeft: "-2px",
                    marginRight: "-2px",
                    height: "100%",
                    ":hover": {
                      border: "4px solid #B8860B",
                      boxShadow: "0 0 15px rgba(184, 134, 11, 0.5)",
                    },
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    border: "2px solid #B8860B",
                    borderRadius: "30px",
                    boxShadow: "0 0 10px 2px rgba(184, 134, 11, 0.5)",
                    backdropFilter: "blur(5px)",
                    overflowY: "hidden",
                    marginTop: 4,
                    fontFamily: "Jura, sans-serif",
                    fontSize: "clamp(15px, 3vw, 22px)",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: "clamp(15px, 3vw, 22px)",
                    textAlign: "center",
                    fontWeight: "bold",
                  }),
                  menuList: (base) => ({
                    ...base,
                    padding: 0,
                    scrollbarColor: "#B8860B rgba(255, 255, 255, 0.1)",
                    scrollbarWidth: "thin",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#B8860B",
                      borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }),
                  input: (base) => ({
                    ...base,
                    color: "white",
                    fontSize: "clamp(15px, 3vw, 22px)",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#B8860B"
                      : state.isFocused
                      ? "rgba(0, 0, 0, 0.3)"
                      : "rgba(122, 122, 122, 0.1)",
                    color: state.isSelected
                      ? "#23272b"
                      : state.isFocused
                      ? "#B8860B"
                      : "#ffffff",
                    backdropFilter: "blur(5px)",
                    borderRadius: "30px",
                    fontWeight:
                      state.isFocused || state.isSelected ? "bold" : "normal",
                    cursor: "pointer",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    color: "white",
                    textAlign: "center",
                    justifyContent: "center",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "clamp(15px, 3vw, 22px)",
                    textAlign: "center",
                  }),
                  dropdownIndicator: (base, state) => ({
                    ...base,
                    color: "#fffbe6",
                    cursor: "pointer",
                    borderRadius: "50%",
                    ":hover": {
                      color: "#fffbe6",
                      backgroundColor: "transparent",
                    },
                    zIndex: 2,
                  }),
                }}
              />
              {errors.staff && (
                <small className="custom-font-Extrasmall fw-bold">
                  {errors.staff.message}
                </small>
              )}
            </>
          );
        }}
      />
    </>
  );
};

export default UserInput;
