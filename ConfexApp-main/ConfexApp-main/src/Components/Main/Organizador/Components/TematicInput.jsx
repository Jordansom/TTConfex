import React, { useState } from "react";
import { Controller } from "react-hook-form";
import Select from "react-select";

const TematicInput = ({ name, label, control, tematicas, errors }) => {
  const options = tematicas.map((t) => ({
    value: t.idTematica,
    label: t.nombre,
  }));

  return (
    <>
      <Controller
        name={name}
        control={control}
        className="form-control custom-input-gold text-center fw-bold"
        rules={{ required: "Seleccione al menos una temática." }}
        render={({ field }) => (
          <>
            <Select
              {...field}
              isMulti
              options={options}
              classNamePrefix="select"
              placeholder={label}
              menuPortalTarget={document.body}
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
                  color: "white",
                  borderRadius: "30px",
                  padding: "10px 20px",
                  backdropFilter: "blur(5px)",
                  position: "relative",
                  fontFamily: "Jura, sans-serif",
                  fontSize: "clamp(15px, 3vw, 22px);",
                  textAlign: "center",
                  cursor: "pointer",
                  ":hover": {
                    border: "4px solid #B8860B",
                    boxShadow: "0 0 15px rgba(184, 134, 11, 0.5)",
                  },
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  border: "2px solid #B8860B",
                  borderRadius: "30px",
                  boxShadow: "0 0 10px 2px rgba(184, 134, 11, 0.5)",
                  backdropFilter: "blur(5px)",
                  marginTop: 4,
                  overflowY: "hidden",
                  fontFamily: "Jura, sans-serif",
                  fontSize: "clamp(15px, 3vw, 22px)",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: "clamp(15px, 3vw, 22px);",
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
                valueContainer: (base) => ({
                  ...base,
                  padding: "0 8px",
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
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#b8860b",
                  borderRadius: "12px",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#23272b",
                  fontWeight: "bold",
                  fontSize: "clamp(15px, 3vw, 22px)",
                }),
                multiValueRemove: (base, state) => ({
                  ...base,
                  color: state.isFocused ? "#fffbe6" : "black",
                  cursor: "pointer",
                  borderRadius: "50%",
                  ":hover": {
                    backgroundColor: "transparent",
                    color: "#fffbe6",
                  },
                  zIndex: 2,
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
            {errors.tematicas && (
              <small className="custom-font-Extrasmall fw-bold">
                {errors.tematicas.message}
              </small>
            )}
          </>
        )}
      />
    </>
  );
};

export default TematicInput;
